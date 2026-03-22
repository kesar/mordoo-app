import { Stack } from 'expo-router';
import { colors } from '@/src/constants/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.night.DEFAULT },
      }}
    />
  );
}
