import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export function useHydration(): boolean {
  const authHydrated = useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(() => cb()),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );

  const onboardingHydrated = useSyncExternalStore(
    (cb) => useOnboardingStore.persist.onFinishHydration(() => cb()),
    () => useOnboardingStore.persist.hasHydrated(),
    () => false,
  );

  return authHydrated && onboardingHydrated;
}
