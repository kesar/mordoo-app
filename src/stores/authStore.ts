import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';
import type { Session } from '@supabase/supabase-js';
import { logOutPurchases } from '@/src/services/purchases';

/** Clear all user-scoped stores. Imported lazily to avoid circular deps. */
function clearUserStores() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useOracleStore } = require('./oracleStore');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useOnboardingStore } = require('./onboardingStore');
  useOracleStore.getState().clearConversation();
  useOnboardingStore.getState().resetStore();
}

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
    (set, get) => ({
      isAuthenticated: false,
      userId: null,
      supabaseUserId: null,
      token: null,

      setSupabaseSession: (session: Session) => {
        const prev = get().supabaseUserId;
        const next = session.user.id;

        // Different user logging in — clear stale data
        if (prev && prev !== next) {
          clearUserStores();
        }

        set({
          isAuthenticated: true,
          userId: next,
          supabaseUserId: next,
          token: session.access_token,
        });
      },

      logout: () => {
        clearUserStores();
        logOutPurchases(); // Fire-and-forget — don't block logout on this
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
