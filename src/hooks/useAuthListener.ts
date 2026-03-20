import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/stores/authStore';

export function useAuthListener() {
  const setSupabaseSession = useAuthStore((s) => s.setSupabaseSession);
  const logout = useAuthStore((s) => s.logout);
  const authMode = useAuthStore((s) => s.authMode);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setSupabaseSession(session);
        } else if (event === 'SIGNED_OUT' && authMode === 'account') {
          logout();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [setSupabaseSession, logout, authMode]);
}
