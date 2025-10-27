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

    const access_token = tokenJson.access_token;

    // Fetch GitHub profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/vnd.github+json' },
    });
    const profile = await userRes.json();

    if (!profile || !profile.id) {
      return NextResponse.json({ error: 'Failed fetching GitHub profile' }, { status: 400 });
    }

    // Upsert user in DB by email if available, else by provider id
    const email = profile.email ?? null;
    let user;

    if (email) {
      user = await prisma.user.upsert({
        where: { email },
        update: { name: profile.name ?? profile.login, image: profile.avatar_url ?? null },
        create: { email, name: profile.name ?? profile.login, image: profile.avatar_url ?? null },
      });
    } else {
      // try to find by existing account with providerAccountId
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider: 'github', providerAccountId: String(profile.id) } },
      });

      if (account) {
        user = (await prisma.user.findUnique({ where: { id: account.userId } })) ?? undefined;
      }
      if (!user) {
        user = await prisma.user.create({ data: { name: profile.name ?? profile.login, image: profile.avatar_url ?? null } });
      }
    }

    // Upsert account
    await prisma.account.upsert({
      where: { provider_providerAccountId: { provider: 'github', providerAccountId: String(profile.id) } },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'github',
        providerAccountId: String(profile.id),
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
