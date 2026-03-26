import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/stores/authStore';
import { getTimezone } from '@/src/utils/timezone';

export function useAuthListener() {
  const setSupabaseSession = useAuthStore((s) => s.setSupabaseSession);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    // Check current session on mount — clear stale auth if expired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSupabaseSession(session);
        // Sync device timezone to profile (fire-and-forget)
        supabase.from('profiles').update({ timezone: getTimezone() }).eq('id', session.user.id);
      } else if (useAuthStore.getState().isAuthenticated) {
        logout();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSupabaseSession(session);
        } else if (useAuthStore.getState().isAuthenticated) {
          logout();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [setSupabaseSession, logout]);
}
