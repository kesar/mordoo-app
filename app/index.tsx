import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useOnboardingStore((s) => s.isComplete);

  if (!isAuthenticated) return <Redirect href="/(onboarding)/soul-gate" />;
  if (!onboardingComplete) return <Redirect href="/(onboarding)/soul-gate" />;
  return <Redirect href="/(main)/pulse" />;
}
