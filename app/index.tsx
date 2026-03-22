import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { fetchExistingBirthData } from '@/src/services/birth-data';
import { colors } from '@/src/constants/colors';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useOnboardingStore((s) => s.isComplete);
  const [checking, setChecking] = useState(false);
  const [resolved, setResolved] = useState(false);

  // If authenticated but onboarding store says incomplete,
  // check if birth data already exists on the server (e.g., app reinstall)
  useEffect(() => {
    if (!isAuthenticated || onboardingComplete || resolved) return;

    setChecking(true);
    fetchExistingBirthData()
      .then((existing) => {
        if (existing) {
          const store = useOnboardingStore.getState();
          store.setBirthData(existing.birthData);
          if (existing.nameData) store.setNameData(existing.nameData);
          if (existing.concerns.length > 0) store.setConcerns(existing.concerns);
          if (existing.urgencyContext) store.setUrgencyContext(existing.urgencyContext);
          store.completeOnboarding();
        }
      })
      .catch(() => {
        // If fetch fails, proceed with normal onboarding
      })
      .finally(() => {
        setChecking(false);
        setResolved(true);
      });
  }, [isAuthenticated, onboardingComplete, resolved]);

  if (!isAuthenticated) return <Redirect href="/(onboarding)/soul-gate" />;

  // Show loading while checking server for existing birth data
  if (!onboardingComplete && checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.night.DEFAULT }}>
        <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
      </View>
    );
  }

  // Wait for the check to complete before deciding
  if (!onboardingComplete && !resolved) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.night.DEFAULT }}>
        <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
      </View>
    );
  }

  if (!onboardingComplete) return <Redirect href="/(onboarding)/soul-gate" />;
  return <Redirect href="/(main)/pulse" />;
}
