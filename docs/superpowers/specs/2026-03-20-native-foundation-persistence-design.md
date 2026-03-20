# Sub-project 1: Native Foundation & Persistence — Design Spec

## Goal

Migrate Mordoo from Expo Go to a custom dev client with native module support, replace the in-memory storage shim with real MMKV persistence, add Zustand persist middleware to all stores, enable Reanimated worklets, and configure EAS Build for development/preview/production profiles.

## Architecture

The app currently runs in Expo Go, which doesn't support native modules. This sub-project runs `expo prebuild` to generate native iOS/Android projects, then swaps the `InMemoryStorage` shim for real `react-native-mmkv`. All three Zustand stores gain `persist` middleware so state survives app restarts. EAS Build is configured so future sub-projects can build native dev clients and production binaries.

## Tech Stack

- Expo SDK 55 (prebuild / custom dev client)
- react-native-mmkv 4.2.0 (already installed, just not usable in Expo Go)
- zustand 5.0.12 `persist` middleware
- react-native-reanimated 4.2.1 + react-native-worklets 0.7.4
- EAS CLI / eas.json

---

## Scope

### In Scope

1. Run `expo prebuild` to generate `ios/` and `android/` native projects
2. Revert `src/utils/storage.ts` to use real MMKV
3. Add `zustand/middleware` `persist` to authStore, onboardingStore, settingsStore
4. Enable Reanimated worklets in babel.config.js
5. Configure `eas.json` with development, preview, and production build profiles
6. Verify the app builds and runs on iOS simulator via custom dev client

### Out of Scope

- Authentication (Sub-project 2)
- Supabase integration (Sub-project 2+)
- Animations using Reanimated (Sub-project 5 — we only verify the plugin loads here)
- App icons and splash screen (Sub-project 6)
- Production App Store / Play Store submission (Sub-project 6)

---

## Component Design

### 1. Expo Prebuild & Native Projects

**What changes:**
- Run `npx expo prebuild` to generate `ios/` and `android/` directories
- The existing `app.json` already has `bundleIdentifier: "ai.mordoo.app"` and `package: "ai.mordoo.app"` — no changes needed
- Verify `ios/` and `android/` are already in `.gitignore` (they are — lines 40-41)

**Why CNG:** With CNG, native projects are regenerated from `app.json` config. This keeps the source of truth in JS-land and avoids maintaining native code manually. The `ios/` and `android/` dirs are gitignored.

### 2. MMKV Storage

**File:** `src/utils/storage.ts`

Replace `InMemoryStorage` class with real MMKV instance:

```typescript
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'mordoo-storage' });
```

The existing stores call `storage.getString()`, `storage.set()`, `storage.getBoolean()`, etc. — these match MMKV's API. One exception: `authStore.logout()` calls `storage.remove()`, which exists on the shim but not on MMKV (which uses `storage.delete()`). This is a non-issue because the persist middleware refactor removes all manual storage calls entirely.

**Test strategy:** After building the dev client, verify that:
- Setting a value, killing the app, and relaunching preserves the value
- `hasCompletedOnboarding` persists (no re-onboarding on restart)
- Language preference persists

### 3. Zustand Store Persistence

Currently, the three stores read from storage on init but only write to storage on specific actions. This is fragile — any new state field that should persist requires manual `storage.set()` calls. Switch to Zustand's `persist` middleware for automatic persistence.

**File:** `src/utils/zustand-mmkv.ts` (new — MMKV adapter for Zustand persist)

```typescript
import type { StateStorage } from 'zustand/middleware';
import { storage } from './storage';

export const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};
```

**File:** `src/stores/authStore.ts`

Wrap with `persist` middleware. The store shape stays the same. Key: `mordoo-auth`.

Persisted fields: `isAuthenticated`, `authMode`, `userId`, `token`. Use `partialize` to exclude action functions from serialization.

The manual `storage.set()` / `storage.remove()` calls inside `setAuth` and `logout` are removed — `persist` handles serialization automatically.

**File:** `src/stores/onboardingStore.ts`

Wrap with `persist` middleware. Key: `mordoo-onboarding`.

Persisted fields: `step`, `language`, `birthData`, `nameData`, `concerns`, `urgencyContext`, `isComplete`. Use `partialize` to exclude action functions.

The manual `storage.set('mordoo-onboarding-complete', true)` in `completeOnboarding` is removed.

**File:** `src/stores/settingsStore.ts`

Wrap with `persist` middleware. Key: `mordoo-settings`.

Persisted fields: `language`, `notificationsEnabled`. Use `partialize` to exclude action functions.

The manual `storage.set()` calls in setters are removed.

**Hydration handling:** Zustand persist is async by default. Create a `useHydration()` hook that checks `useAuthStore.persist.hasHydrated()` and `useOnboardingStore.persist.hasHydrated()` (these two are critical for routing — auth determines logged-in state, onboarding determines if the user has completed onboarding). `settingsStore` hydration is non-critical and can hydrate in the background.

In `app/_layout.tsx`, gate rendering on both fonts loaded AND hydration complete:

```typescript
const hydrated = useHydration(); // checks auth + onboarding stores
if ((!fontsLoaded && !fontError) || !hydrated) return null;
```

This prevents the flash-of-wrong-route problem (e.g., briefly showing onboarding to a returning user).

**File:** `src/hooks/useHydration.ts` (new)

### 4. Babel Config — Enable Worklets

**File:** `babel.config.js`

Change `worklets: false` to remove the override (or set `worklets: true`), allowing Reanimated's worklet transform to run:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

The `react-native-worklets` package is already installed. This just enables the Babel plugin that was previously disabled for Expo Go compatibility.

Also add `react-native-reanimated` to the `plugins` array in `app.json` to ensure proper native linking during prebuild.

### 5. EAS Build Configuration

**File:** `eas.json` (new)

```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

The `development` profile builds a debug dev client that can connect to the Metro bundler. The `ios.simulator` flag builds for simulator so we can test without a physical device.

### 6. Verification

After all changes:

1. Run `npx expo prebuild --clean` to generate native projects
2. Build iOS dev client: `npx expo run:ios` (uses local Xcode build, faster than EAS for development)
3. Verify app launches, navigate through onboarding, confirm state persists across app kills
4. Verify Reanimated loads without errors (check for "Reanimated" in Metro logs)

---

## Migration Notes

**Storage key migration:** The current stores use keys like `mordoo-user-id`, `mordoo-auth-mode`, `mordoo-token`, `mordoo-lang`, `mordoo-onboarding-complete`, `mordoo-notifications`. The new `persist` middleware uses a single JSON blob per store under keys `mordoo-auth`, `mordoo-onboarding`, `mordoo-settings`. Since the current storage is in-memory (nothing persists anyway), there's no migration needed — fresh start.

**No breaking changes to components:** All store hooks (`useAuthStore`, `useOnboardingStore`, `useSettingsStore`) keep the same API. Components don't need changes.

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/utils/storage.ts` | Modify | Replace InMemoryStorage with real MMKV |
| `src/utils/zustand-mmkv.ts` | Create | MMKV adapter for Zustand persist middleware |
| `src/hooks/useHydration.ts` | Create | Hook to gate rendering on store hydration |
| `src/stores/authStore.ts` | Modify | Add persist middleware, remove manual storage calls |
| `src/stores/onboardingStore.ts` | Modify | Add persist middleware, remove manual storage calls |
| `src/stores/settingsStore.ts` | Modify | Add persist middleware, remove manual storage calls |
| `app/_layout.tsx` | Modify | Wait for Zustand hydration before rendering |
| `app.json` | Modify | Add react-native-reanimated plugin |
| `babel.config.js` | Modify | Enable worklets plugin |
| `eas.json` | Create | EAS Build profiles |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `expo prebuild` fails due to incompatible config plugins | All current plugins (expo-router, expo-secure-store, expo-font, expo-localization, expo-web-browser) support prebuild. Low risk. |
| MMKV native module fails to link | MMKV 4.x uses the new architecture (JSI). Expo SDK 55 + RN 0.83 supports new arch. Should work out of the box with prebuild. |
| Reanimated worklets plugin causes Metro errors | If issues arise, we can selectively disable worklets again and defer to Sub-project 5. The rest of this sub-project doesn't depend on it. |
| Zustand hydration flash (shows wrong state briefly) | Gate route rendering on hydration completion in root layout. |

---

## Success Criteria

1. App runs via custom dev client (not Expo Go)
2. Onboarding completion persists across app kills
3. Language and auth state persist across app restarts
4. `eas.json` exists with valid development/preview/production profiles
5. Reanimated worklets plugin loads without errors
6. TypeScript compiles cleanly (`npx tsc --noEmit`)
