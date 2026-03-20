import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

interface AuthState {
  isAuthenticated: boolean;
  authMode: 'guest' | 'account' | null;
  userId: string | null;
  token: string | null;
  setAuth: (params: { userId: string; token?: string; mode: 'guest' | 'account' }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authMode: null,
      userId: null,
      token: null,

      setAuth: ({ userId, token, mode }) => {
        set({ isAuthenticated: true, userId, token: token ?? null, authMode: mode });
      },

      logout: () => {
        set({ isAuthenticated: false, userId: null, token: null, authMode: null });
      },
    }),
    {
      name: 'mordoo-auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authMode: state.authMode,
        userId: state.userId,
        token: state.token,
      }),
    },
  ),
);
