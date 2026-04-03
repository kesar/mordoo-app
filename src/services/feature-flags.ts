// src/services/feature-flags.ts
import { storage } from '@/src/utils/storage';
import { REMOTE_FLAG_KEYS, type RemoteFlagKey } from '@/src/config/features';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const MMKV_KEY = 'mordoo-feature-flags';

interface FlagResponse {
  flags: Record<RemoteFlagKey, boolean>;
  v: number;
}

/**
 * Fetch remote flags and write to MMKV for next cold start.
 * Does NOT update Zustand — changes apply on next launch only.
 * Call this once on app cold start (fire-and-forget).
 */
export async function syncRemoteFlags(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/config/features`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return;

    const data: FlagResponse = await res.json();
    if (!data.flags || typeof data.v !== 'number') return;

    // Check version — skip write if unchanged
    const raw = storage.getString(MMKV_KEY);
    if (raw) {
      try {
        const cached = JSON.parse(raw);
        if (cached.v === data.v) return; // same version, skip
      } catch {
        // corrupted cache, overwrite
      }
    }

    // Only persist known remote flag keys
    const safeFlags: Partial<Record<RemoteFlagKey, boolean>> = {};
    for (const key of REMOTE_FLAG_KEYS) {
      if (typeof data.flags[key] === 'boolean') {
        safeFlags[key] = data.flags[key];
      }
    }

    storage.set(MMKV_KEY, JSON.stringify({ flags: safeFlags, v: data.v }));
  } catch {
    // Network error — silently ignore, cached flags persist
  }
}
