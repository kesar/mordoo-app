import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  authMode: 'guest' | 'account' | null;
  userId: string | null;
  supabaseUserId: string | null;
  token: string | null;

  setSupabaseSession: (session: Session) => void;
  setGuestAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authMode: null,
      userId: null,
      supabaseUserId: null,
      token: null,

      setSupabaseSession: (session: Session) => {
        set({
          isAuthenticated: true,
          authMode: 'account',
          userId: session.user.id,
          supabaseUserId: session.user.id,
          token: session.access_token,
        });
      },

      setGuestAuth: () => {
        const guestId = Date.now().toString(36) + Math.random().toString(36).slice(2);
        set({
          isAuthenticated: true,
          authMode: 'guest',
          userId: guestId,
          supabaseUserId: null,
          token: null,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          authMode: null,
          userId: null,
          supabaseUserId: null,
          token: null,
        });
      },
    }),
    {
      name: 'mordoo-auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authMode: state.authMode,
        userId: state.userId,
        supabaseUserId: state.supabaseUserId,
        token: state.token,
      }),
    },
  ),
);
