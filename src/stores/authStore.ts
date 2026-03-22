import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  supabaseUserId: string | null;
  token: string | null;

  setSupabaseSession: (session: Session) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      supabaseUserId: null,
      token: null,

      setSupabaseSession: (session: Session) => {
        set({
          isAuthenticated: true,
          userId: session.user.id,
          supabaseUserId: session.user.id,
          token: session.access_token,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
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
        userId: state.userId,
        supabaseUserId: state.supabaseUserId,
        token: state.token,
      }),
    },
  ),
);
