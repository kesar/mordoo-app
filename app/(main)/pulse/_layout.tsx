import { Stack } from 'expo-router';
import { colors } from '@/src/constants/colors';

export default function PulseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.night.DEFAULT },
      }}
    />
  );
}
