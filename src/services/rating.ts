import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import { storage } from '@/src/utils/storage';

const RATING_KEY = 'rating_prompt_state';

interface RatingState {
  sessionCount: number;
  pulseViewCount: number;
  oracleConversationCount: number;
  firstInstallDate: string;
  lastPromptDate: string | null;
  promptedVersions: string[];
  hasErrorThisSession: boolean;
}

const DEFAULT_STATE: RatingState = {
  sessionCount: 0,
  pulseViewCount: 0,
  oracleConversationCount: 0,
  firstInstallDate: new Date().toISOString(),
  lastPromptDate: null,
  promptedVersions: [],
  hasErrorThisSession: false,
};

function getState(): RatingState {
  const raw = storage.getString(RATING_KEY);
  if (raw) {
    try {
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }
  return { ...DEFAULT_STATE };
}

function setState(state: RatingState) {
  storage.set(RATING_KEY, JSON.stringify(state));
}

function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function incrementSession() {
  const state = getState();
  state.sessionCount++;
  state.hasErrorThisSession = false;
  setState(state);
}

export function incrementPulseView() {
  const state = getState();
  state.pulseViewCount++;
  setState(state);
}

export function incrementOracleConversation() {
  const state = getState();
  state.oracleConversationCount++;
  setState(state);
}

export function markSessionError() {
  const state = getState();
  state.hasErrorThisSession = true;
  setState(state);
}

export function shouldShowRatingPrompt(): boolean {
  const state = getState();
  const appVersion = getAppVersion();
  const now = Date.now();
  const installDate = new Date(state.firstInstallDate).getTime();
  const daysSinceInstall = (now - installDate) / (1000 * 60 * 60 * 24);

  if (state.sessionCount < 3) return false;
  if (daysSinceInstall < 3) return false;
  if (state.pulseViewCount < 3) return false;
  if (state.promptedVersions.includes(appVersion)) return false;
  if (state.hasErrorThisSession) return false;

  // 14-day cooldown after last prompt
  if (state.lastPromptDate) {
    const daysSincePrompt =
      (now - new Date(state.lastPromptDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePrompt < 14) return false;
  }

  return true;
}

export async function triggerNativeReviewPrompt() {
  const isAvailable = await StoreReview.isAvailableAsync();
  if (isAvailable) {
    await StoreReview.requestReview();
  }
  const state = getState();
  const appVersion = getAppVersion();
  state.promptedVersions.push(appVersion);
  state.lastPromptDate = new Date().toISOString();
  setState(state);
}

export function markPromptDismissed() {
  const state = getState();
  state.lastPromptDate = new Date().toISOString();
  setState(state);
}
