import { useEffect, useRef } from 'react';
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
  const isColdStart = useRef(true);

  // Identify user when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      analytics.identify(userId);
      analytics.reloadFeatureFlags();
    } else {
      analytics.reset();
    }
  }, [isAuthenticated, userId]);

  // Track cold start
  useEffect(() => {
    analytics.track('app_opened');
  }, []);

  // Track app foreground sessions (resume from background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (isColdStart.current) {
          isColdStart.current = false;
          return; // skip — already tracked as app_opened
        }
        analytics.track('session_started');
      }
    });
    return () => subscription.remove();
  }, []);
}
