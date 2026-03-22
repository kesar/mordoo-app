import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { syncBirthData } from '@/src/services/birth-data';

/**
 * Ensures local birth data is synced to the server once per session.
 * Handles the case where a user completed onboarding before server-side
 * computation was required.
 */
export function useSyncBirthData() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const birthData = useOnboardingStore((s) => s.birthData);
  const nameData = useOnboardingStore((s) => s.nameData);
  const concerns = useOnboardingStore((s) => s.concerns);
  const urgencyContext = useOnboardingStore((s) => s.urgencyContext);
  const isComplete = useOnboardingStore((s) => s.isComplete);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    if (!isAuthenticated || !birthData || !isComplete) return;

    syncedRef.current = true;
    syncBirthData({ birthData, nameData, concerns, urgencyContext }).catch((err) => {
      console.warn('Birth data sync failed:', err);
      syncedRef.current = false; // Allow retry next render cycle
    });
  }, [isAuthenticated, birthData, nameData, concerns, urgencyContext, isComplete]);
}
