import { donateShortcut } from 'react-native-siri-shortcut';
import { Platform } from 'react-native';

export function donatePulseShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'ai.mordoo.app.dailyPulse',
    title: 'View Daily Reading',
    suggestedInvocationPhrase: 'Show my daily reading',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateSiamSiShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'ai.mordoo.app.siamSi',
    title: 'Draw Fortune Stick',
    suggestedInvocationPhrase: 'Draw a fortune stick',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateOracleShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'ai.mordoo.app.askOracle',
    title: 'Ask Mor Doo',
    suggestedInvocationPhrase: 'Ask Mor Doo',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}
