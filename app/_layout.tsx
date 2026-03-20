import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/src/i18n';
import { colors } from '@/src/constants/colors';
import { useHydration } from '@/src/hooks/useHydration';

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

export default function RootLayout() {
  const hydrated = useHydration();
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
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <StatusBar style="light" />
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
        </I18nextProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
