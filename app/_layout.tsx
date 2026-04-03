import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/src/i18n';
import { colors } from '@/src/constants/colors';
import { useHydration } from '@/src/hooks/useHydration';
import { useAuthListener } from '@/src/hooks/useAuthListener';
import { useSyncBirthData } from '@/src/hooks/useSyncBirthData';
import { useDayChangeRefresh } from '@/src/hooks/useDayChangeRefresh';
import { useNotificationHandler } from '@/src/hooks/useNotificationHandler';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { PostHogProvider, posthog } from '@/src/services/analytics';
import { incrementSession } from '@/src/services/rating';
import { configureRevenueCat, identifyUser, checkSubscriptionStatus } from '@/src/services/purchases';
import { syncRemoteFlags } from '@/src/services/feature-flags';
import { useAuthStore } from '@/src/stores/authStore';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { OfflineBanner } from '@/src/components/OfflineBanner';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: !__DEV__,
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
    },
  },
});

function AppContent() {
  const userId = useAuthStore((s) => s.supabaseUserId);
  const isOffline = useNetworkStatus();

  useEffect(() => {
    if (userId) {
      identifyUser(userId).then(() => checkSubscriptionStatus());
    }
  }, [userId]);

  useDayChangeRefresh();
  useNotificationHandler();
  useAnalytics();

  return (
    <>
      <StatusBar style="light" />
      <OfflineBanner visible={isOffline} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.night.DEFAULT },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(onboarding)"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="(main)" />
      </Stack>
    </>
  );
}

function RootLayout() {
  const hydrated = useHydration();
  useAuthListener();
  useSyncBirthData();

  // Defer native SDK init to avoid TurboModule threading race at startup
  useEffect(() => {
    incrementSession();
    configureRevenueCat();
    syncRemoteFlags();
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'CinzelDecorative-Regular': require('@/assets/fonts/CinzelDecorative-Regular.ttf'),
    'CinzelDecorative-Bold': require('@/assets/fonts/CinzelDecorative-Bold.ttf'),
    'CormorantGaramond-Regular': require('@/assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-Medium': require('@/assets/fonts/CormorantGaramond-Medium.ttf'),
    'CormorantGaramond-SemiBold': require('@/assets/fonts/CormorantGaramond-SemiBold.ttf'),
    'NotoSansThai-Regular': require('@/assets/fonts/NotoSansThai-Regular.ttf'),
    'NotoSansThai-Medium': require('@/assets/fonts/NotoSansThai-Medium.ttf'),
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, hydrated]);

  if ((!fontsLoaded && !fontError) || !hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.night.DEFAULT }}>
      <PostHogProvider client={posthog} autocapture>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <AppContent />
          </I18nextProvider>
        </QueryClientProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
