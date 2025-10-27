import React, { createContext, useContext, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { getItem, setItem, deleteItem } from '../utils/storage';

const BACKEND_BASE = 'https://nutrisnap.workhardbekind.com';
// Replace with your Google OAuth Client ID (for the mobile app)
const GOOGLE_CLIENT_ID = '119993777591-to7tf5tpqiov0310vvd4e549ua2jqlhl.apps.googleusercontent.com';

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
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      } as const;

      const authRequest = new AuthSession.AuthRequest({ clientId: GOOGLE_CLIENT_ID, scopes: ['openid', 'profile', 'email'], redirectUri });
      // cast options to any because some expo-auth-session types don't include useProxy
      const result = await (authRequest as any).promptAsync(discovery, { useProxy: true } as any);
      if (result.type === 'success' && (result as any).params?.code) {
        const code = (result as any).params.code;
        const resp = await fetch(`${BACKEND_BASE}/api/auth/mobile-exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri, provider: 'google' }),
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
