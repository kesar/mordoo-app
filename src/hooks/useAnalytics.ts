import { useEffect } from 'react';
import { AppState } from 'react-native';
import { analytics } from '@/src/services/analytics';
import { useAuthStore } from '@/src/stores/authStore';

/**
 * Initializes analytics: identifies user on auth, tracks sessions, resets on logout.
 * Call once in root layout.
 */
export function useAnalytics() {
  const userId = useAuthStore((s) => s.userId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Identify user when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      analytics.identify(userId);
      analytics.reloadFeatureFlags();
    } else {
      analytics.reset();
    }
  }, [isAuthenticated, userId]);

  // Track app foreground sessions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        analytics.track('session_started');
      }
    });
    return () => subscription.remove();
  }, []);
}
