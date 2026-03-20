import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function lightHaptic() {
  if (Platform.OS !== 'ios') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function mediumHaptic() {
  if (Platform.OS !== 'ios') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function heavyHaptic() {
  if (Platform.OS !== 'ios') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function successHaptic() {
  if (Platform.OS !== 'ios') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function errorHaptic() {
  if (Platform.OS !== 'ios') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
