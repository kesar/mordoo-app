import { Stack } from 'expo-router';
import { colors } from '@/src/constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.night.DEFAULT },
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="soul-gate" />
      <Stack.Screen name="phone-auth" />
      <Stack.Screen name="birth-data" />
      <Stack.Screen name="name-numbers" />
      <Stack.Screen name="life-context" />
      <Stack.Screen name="power-ups" />
    </Stack>
  );
}
