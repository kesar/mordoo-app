import { donateShortcut } from 'react-native-siri-shortcut';
import { Platform } from 'react-native';

export function donatePulseShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'app.mordoo.oracle.dailyInsight',
    title: 'View Daily Insight',
    suggestedInvocationPhrase: 'Show my daily insight',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateSiamSiShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'app.mordoo.oracle.siamSi',
    title: 'Draw Wisdom Stick',
    suggestedInvocationPhrase: 'Draw a wisdom stick',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateOracleShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'app.mordoo.oracle.askOracle',
    title: 'Ask Mor Doo',
    suggestedInvocationPhrase: 'Ask Mor Doo',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}
