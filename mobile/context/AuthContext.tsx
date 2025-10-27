import React, { createContext, useContext, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { getItem, setItem, deleteItem } from '../utils/storage';

const BACKEND_BASE = 'https://nutrisnap.workhardbekind.com';
const GITHUB_CLIENT_ID = 'Ov23lioaDXtNM7gAMYfz';

type User = { id: string; name?: string | null; email?: string | null; image?: string | null } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const t = await getItem('nutrisnap_token');
      if (t) {
        setToken(t);
        try {
          const r = await fetch(`${BACKEND_BASE}/api/me`, { headers: { Authorization: `Bearer ${t}` } });
          if (r.ok) setUser(await r.json());
        } catch (e) {
          console.log('Failed to fetch /api/me', e);
        }
      }
    })();
  }, []);

  async function signIn() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      console.log('redirectUri', redirectUri);
      // show the redirectUri in an alert so non-dev users can copy it for GitHub app settings
      try {
        Alert.alert('Redirect URI', redirectUri);
      } catch (e) {
        // ignore
      }
      const discovery = {
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
      } as const;

      const authRequest = new AuthSession.AuthRequest({ clientId: GITHUB_CLIENT_ID, scopes: ['read:user', 'user:email'], redirectUri });
      const result = await authRequest.promptAsync(discovery, { useProxy: true });
      if (result.type === 'success' && (result as any).params?.code) {
        const code = (result as any).params.code;
        const resp = await fetch(`${BACKEND_BASE}/api/auth/mobile-exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          Alert.alert('Backend error', text);
          return;
        }

        const json = await resp.json();
        if (json.token) {
          await setItem('nutrisnap_token', json.token);
          setToken(json.token);
          const meResp = await fetch(`${BACKEND_BASE}/api/me`, { headers: { Authorization: `Bearer ${json.token}` } });
          if (meResp.ok) setUser(await meResp.json());
        } else {
          Alert.alert('Exchange failed', JSON.stringify(json));
        }
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Login error', err?.message ?? String(err));
    }
  }

  async function signOut() {
    await deleteItem('nutrisnap_token');
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, token, signIn, signOut }}>{children}</AuthContext.Provider>;
};
