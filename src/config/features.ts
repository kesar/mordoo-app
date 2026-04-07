// src/config/features.ts

// These are the HARDCODED defaults used when:
// 1. First install (no MMKV cache yet)
// 2. MMKV cache exists but a flag key is missing (new flag added in update)
//
// Set to SAFE values for App Store review.
// After approval, flip via API — app picks up on next cold start.

export const features = {
  appleSignIn: false,
  googleSignIn: false,
  ratingPrompt: true,
  paywall: true,

  // Remote-toggled flags (synced from /api/config/features)
  dailyPulse: false,
  zodiacReferences: false,
  fortuneLabels: false,
  luckyElements: false,
  siamSi: true,
  oracleChat: true,
} as const;

export type FeatureFlags = typeof features;
export type RemoteFlagKey = 'dailyPulse' | 'zodiacReferences' | 'fortuneLabels' | 'luckyElements' | 'siamSi' | 'oracleChat';
export const REMOTE_FLAG_KEYS: RemoteFlagKey[] = [
  'dailyPulse', 'zodiacReferences', 'fortuneLabels', 'luckyElements', 'siamSi', 'oracleChat',
];
