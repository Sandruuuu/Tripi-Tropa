'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseJwt, type JwtPayload, type UserRole } from '@/lib/jwt';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  username: string | null;
  transportType: JwtPayload['transportType'] | null;
  setAuth: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

function applyToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }
  if (!token) {
    return { token: null, role: null, username: null, transportType: null };
  }
  const payload = parseJwt(token);
  return {
    token,
    role: payload?.role ?? null,
    username: payload?.username ?? null,
    transportType: payload?.transportType ?? null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      username: null,
      transportType: null,
      setAuth: (token) => set(applyToken(token)),
      logout: () => {
        applyToken(null);
        set({
          token: null,
          role: null,
          username: null,
          transportType: null,
        });
      },
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'tripi-auth',
      partialize: (s) => ({
        token: s.token,
        role: s.role,
        username: s.username,
        transportType: s.transportType,
      }),
    },
  ),
);
