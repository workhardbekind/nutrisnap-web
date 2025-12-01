import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, redirectUri } = body ?? {};

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const provider = (body.provider as string) ?? 'github';

    let profile: any = null;
    let access_token: string | null = null;

    if (provider === 'google') {
      const client_id = process.env.GOOGLE_CLIENT_ID;
      const client_secret = process.env.GOOGLE_CLIENT_SECRET;
      if (!client_id || !client_secret) {
        return NextResponse.json({ error: 'Server misconfigured for Google' }, { status: 500 });
      }

      // Exchange code for tokens at Google's token endpoint (application/x-www-form-urlencoded)
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', client_id);
      params.append('client_secret', client_secret);
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const tokenJson = await tokenRes.json();
      if (tokenJson.error || !tokenJson.access_token) {
        return NextResponse.json({ error: tokenJson.error_description || tokenJson.error || 'No access token' }, { status: 400 });
      }

      access_token = tokenJson.access_token;

      // Fetch Google profile via userinfo endpoint
      const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      profile = await userRes.json();
    } else {
      const client_id = process.env.GITHUB_ID;
      const client_secret = process.env.GITHUB_SECRET;

      if (!client_id || !client_secret) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
      }

      // Exchange the code for an access token with GitHub
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id, client_secret, code, redirect_uri: redirectUri }),
      });

      const tokenJson = await tokenRes.json();

      if (tokenJson.error || !tokenJson.access_token) {
        return NextResponse.json({ error: tokenJson.error_description || tokenJson.error || 'No access token' }, { status: 400 });
      }

      access_token = tokenJson.access_token;

      // Fetch GitHub profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/vnd.github+json' },
      });
      profile = await userRes.json();
    }

    // some providers (Google) return `sub` instead of `id`
    const profileId = (profile && (profile.id ?? profile.sub)) ?? null;
    if (!profile || !profileId) {
      return NextResponse.json({ error: 'Failed fetching provider profile' }, { status: 400 });
    }

    // Upsert user in DB by email if available, else by provider id
    const email = profile.email ?? profile.email_address ?? null;
    let user;
    const providerAccountId = provider === 'google' ? String(profile.sub ?? profile.id) : String(profile.id);

    if (email) {
      user = await prisma.user.upsert({
        where: { email },
        update: { name: profile.name ?? profile.login ?? profile.given_name ?? null, image: profile.picture ?? profile.avatar_url ?? null },
        create: { email, name: profile.name ?? profile.login ?? profile.given_name ?? null, image: profile.picture ?? profile.avatar_url ?? null },
      });
    } else {
      // try to find by existing account with providerAccountId
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });

      if (account) {
        user = (await prisma.user.findUnique({ where: { id: account.userId } })) ?? undefined;
      }
      if (!user) {
        user = await prisma.user.create({ data: { name: profile.name ?? profile.login ?? profile.given_name ?? null, image: profile.picture ?? profile.avatar_url ?? null } });
      }
    }

    // Upsert account
    await prisma.account.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      create: {
        userId: user.id,
        type: 'oauth',
        provider,
        providerAccountId,
        access_token: access_token,
      },
      update: { access_token: access_token },
    });

  // Ensure user exists
  if (!user) return NextResponse.json({ error: 'Failed to create or find user' }, { status: 500 });

  // issue JWT using NEXTAUTH_SECRET
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) return NextResponse.json({ error: 'No signing secret' }, { status: 500 });

  const token = jwt.sign({ sub: user.id, name: user.name ?? null, email: user.email ?? null }, secret, { expiresIn: '30d' });

  return NextResponse.json({ token, user, profile });
  } catch (err: any) {
    console.error('mobile-exchange error', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
