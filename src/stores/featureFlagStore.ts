// src/stores/featureFlagStore.ts
import { create } from 'zustand';
import { features, type FeatureFlags } from '@/src/config/features';
import { storage } from '@/src/utils/storage';

const MMKV_KEY = 'mordoo-feature-flags';

function readCachedFlags(): FeatureFlags {
  const raw = storage.getString(MMKV_KEY);
  if (!raw) return { ...features };
  try {
    const cached = JSON.parse(raw) as { flags: Partial<FeatureFlags>; v: number };
    // Merge cached over defaults — ensures new flags get default values
    return { ...features, ...cached.flags };
  } catch {
    return { ...features };
  }
}

interface FeatureFlagState extends FeatureFlags {
  _hydrated: boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>()(() => ({
  ...readCachedFlags(),
  _hydrated: true,
}));
