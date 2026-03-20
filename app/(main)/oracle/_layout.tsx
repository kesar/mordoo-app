import { Stack } from 'expo-router';
import { colors } from '@/src/constants/colors';

export default function OracleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.night.DEFAULT },
      }}
    />
  );
}
