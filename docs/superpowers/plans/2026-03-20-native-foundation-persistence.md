# Native Foundation & Persistence Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Mordoo from Expo Go to a custom dev client with MMKV persistence, Zustand persist middleware, Reanimated worklets, and EAS Build configuration.

**Architecture:** Run `expo prebuild` to generate native projects, replace InMemoryStorage with real MMKV, wrap all three Zustand stores with `persist` middleware using an MMKV adapter, gate route rendering on hydration, enable Reanimated worklets, and configure EAS Build profiles.

**Tech Stack:** Expo SDK 55, react-native-mmkv 4.2.0, zustand 5.0.12 persist, react-native-reanimated 4.2.1, EAS CLI

**Spec:** `docs/superpowers/specs/2026-03-20-native-foundation-persistence-design.md`

---

## Chunk 1: Storage & Persistence Layer

### Task 1: Replace InMemoryStorage with MMKV

**Files:**
- Modify: `src/utils/storage.ts`

- [ ] **Step 1: Replace the InMemoryStorage class with real MMKV**

Replace the entire contents of `src/utils/storage.ts` with:

```typescript
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'mordoo-storage' });
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (MMKV types match the existing usage pattern)

- [ ] **Step 3: Commit**

```bash
git add src/utils/storage.ts
git commit -m "feat: replace InMemoryStorage with real MMKV"
```

---

### Task 2: Create MMKV adapter for Zustand persist

**Files:**
- Create: `src/utils/zustand-mmkv.ts`

- [ ] **Step 1: Create the adapter file**

Create `src/utils/zustand-mmkv.ts` with:

```typescript
import type { StateStorage } from 'zustand/middleware';
import { storage } from './storage';

export const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/utils/zustand-mmkv.ts
git commit -m "feat: add MMKV adapter for Zustand persist middleware"
```

---

### Task 3: Add persist middleware to authStore

**Files:**
- Modify: `src/stores/authStore.ts`

- [ ] **Step 1: Rewrite authStore with persist middleware**

Replace the entire contents of `src/stores/authStore.ts` with:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

interface AuthState {
  isAuthenticated: boolean;
  authMode: 'guest' | 'account' | null;
  userId: string | null;
  token: string | null;
  setAuth: (params: { userId: string; token?: string; mode: 'guest' | 'account' }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authMode: null,
      userId: null,
      token: null,

      setAuth: ({ userId, token, mode }) => {
        set({ isAuthenticated: true, userId, token: token ?? null, authMode: mode });
      },

      logout: () => {
        set({ isAuthenticated: false, userId: null, token: null, authMode: null });
      },
    }),
    {
      name: 'mordoo-auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authMode: state.authMode,
        userId: state.userId,
        token: state.token,
      }),
    },
  ),
);
```

Key changes from current code:
- Removed `import { storage } from '@/src/utils/storage'`
- Removed manual `storage.set()` / `storage.remove()` calls from `setAuth` and `logout`
- Wrapped store creator with `persist(...)` middleware
- Added `partialize` to exclude action functions
- Initial state is now `false`/`null` — `persist` handles rehydration

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/stores/authStore.ts
git commit -m "feat: add persist middleware to authStore"
```

---

### Task 4: Add persist middleware to onboardingStore

**Files:**
- Modify: `src/stores/onboardingStore.ts`

- [ ] **Step 1: Rewrite onboardingStore with persist middleware**

Replace the entire contents of `src/stores/onboardingStore.ts` with:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

export type Concern = 'love' | 'career' | 'money' | 'health' | 'family' | 'spiritual';

export interface BirthData {
  dateOfBirth: string; // ISO date string
  timeOfBirth: { hour: number; minute: number };
  timeApproximate: boolean;
  placeOfBirth: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
  };
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not';
}

export interface NameData {
  fullName: string;
  phoneNumber?: string;
  carPlate?: string;
}

interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  language: 'en' | 'th';
  birthData: BirthData | null;
  nameData: NameData | null;
  concerns: Concern[];
  urgencyContext: string | null;
  isComplete: boolean;

  setStep: (step: OnboardingState['step']) => void;
  setLanguage: (lang: 'en' | 'th') => void;
  setBirthData: (data: BirthData) => void;
  setNameData: (data: NameData) => void;
  setConcerns: (concerns: Concern[]) => void;
  setUrgencyContext: (context: string | null) => void;
  completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      language: 'en',
      birthData: null,
      nameData: null,
      concerns: [],
      urgencyContext: null,
      isComplete: false,

      setStep: (step) => set({ step }),
      setLanguage: (language) => set({ language }),
      setBirthData: (birthData) => set({ birthData }),
      setNameData: (nameData) => set({ nameData }),
      setConcerns: (concerns) => set({ concerns }),
      setUrgencyContext: (urgencyContext) => set({ urgencyContext }),
      completeOnboarding: () => set({ isComplete: true }),
    }),
    {
      name: 'mordoo-onboarding',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        step: state.step,
        language: state.language,
        birthData: state.birthData,
        nameData: state.nameData,
        concerns: state.concerns,
        urgencyContext: state.urgencyContext,
        isComplete: state.isComplete,
      }),
    },
  ),
);
```

Key changes:
- Removed `import { storage } from '@/src/utils/storage'`
- Removed manual `storage.getString('mordoo-lang')` and `storage.getBoolean('mordoo-onboarding-complete')` init reads
- Removed `storage.set('mordoo-onboarding-complete', true)` from `completeOnboarding`
- Initial state defaults used (persist rehydrates on startup)

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/stores/onboardingStore.ts
git commit -m "feat: add persist middleware to onboardingStore"
```

---

### Task 5: Add persist middleware to settingsStore

**Files:**
- Modify: `src/stores/settingsStore.ts`

- [ ] **Step 1: Rewrite settingsStore with persist middleware**

Replace the entire contents of `src/stores/settingsStore.ts` with:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

interface SettingsState {
  language: 'en' | 'th';
  notificationsEnabled: boolean;
  setLanguage: (lang: 'en' | 'th') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      notificationsEnabled: false,

      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'mordoo-settings',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
      }),
    },
  ),
);
```

Key changes:
- Removed `import { storage } from '@/src/utils/storage'`
- Removed manual `storage.set()` calls from setters
- Removed manual `storage.getString()` / `storage.getBoolean()` init reads

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/stores/settingsStore.ts
git commit -m "feat: add persist middleware to settingsStore"
```

---

### Task 6: Create useHydration hook and integrate into root layout

**Files:**
- Create: `src/hooks/useHydration.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create the useHydration hook**

Create `src/hooks/useHydration.ts` with:

```typescript
import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export function useHydration(): boolean {
  const authHydrated = useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );

  const onboardingHydrated = useSyncExternalStore(
    (cb) => useOnboardingStore.persist.onFinishHydration(cb),
    () => useOnboardingStore.persist.hasHydrated(),
    () => false,
  );

  return authHydrated && onboardingHydrated;
}
```

This hook uses `useSyncExternalStore` to subscribe to hydration state of the two critical stores (auth and onboarding). It returns `true` only when both have finished rehydrating from MMKV.

- [ ] **Step 2: Update app/_layout.tsx to gate on hydration**

In `app/_layout.tsx`, add the import at the top (after existing imports):

```typescript
import { useHydration } from '@/src/hooks/useHydration';
```

Inside `RootLayout()`, after the `useFonts` call, add:

```typescript
const hydrated = useHydration();
```

Update the early return gate from:

```typescript
if (!fontsLoaded && !fontError) return null;
```

to:

```typescript
if ((!fontsLoaded && !fontError) || !hydrated) return null;
```

And update the `useEffect` that hides the splash screen from:

```typescript
useEffect(() => {
  if (fontsLoaded || fontError) {
    SplashScreen.hideAsync();
  }
}, [fontsLoaded, fontError]);
```

to:

```typescript
useEffect(() => {
  if ((fontsLoaded || fontError) && hydrated) {
    SplashScreen.hideAsync();
  }
}, [fontsLoaded, fontError, hydrated]);
```

This ensures the splash screen stays visible until both fonts are loaded AND stores are hydrated.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useHydration.ts app/_layout.tsx
git commit -m "feat: add hydration gating to prevent flash-of-wrong-route"
```

---

## Chunk 2: Build Configuration & Verification

### Task 7: Enable Reanimated worklets and update app.json

**Files:**
- Modify: `babel.config.js`
- Modify: `app.json`

- [ ] **Step 1: Enable worklets in babel.config.js**

Replace the entire contents of `babel.config.js` with:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

This removes the `{ worklets: false }` override that was needed for Expo Go.

- [ ] **Step 2: Add react-native-reanimated to app.json plugins**

In `app.json`, update the `plugins` array from:

```json
"plugins": [
  "expo-router",
  "expo-secure-store",
  "expo-font",
  "expo-localization",
  "expo-web-browser"
]
```

to:

```json
"plugins": [
  "expo-router",
  "expo-secure-store",
  "expo-font",
  "expo-localization",
  "expo-web-browser",
  "react-native-reanimated"
]
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add babel.config.js app.json
git commit -m "feat: enable Reanimated worklets and add config plugin"
```

---

### Task 8: Create EAS Build configuration

**Files:**
- Create: `eas.json`

- [ ] **Step 1: Install EAS CLI globally (if not already installed)**

Run: `npm install -g eas-cli`
Expected: eas-cli installed successfully

- [ ] **Step 2: Create eas.json**

Create `eas.json` in the project root with:

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
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

- [ ] **Step 3: Commit**

```bash
git add eas.json
git commit -m "feat: add EAS Build configuration"
```

---

### Task 9: Run expo prebuild and verify the app builds

**Files:**
- No file edits — this is a build/verification task

- [ ] **Step 1: Run expo prebuild**

Run: `npx expo prebuild --clean`
Expected: `ios/` and `android/` directories are generated. Output shows successful prebuild with no errors. These directories are gitignored so they won't be committed.

- [ ] **Step 2: Build and run on iOS simulator**

Run: `npx expo run:ios`
Expected: Xcode builds the project and launches the app in the iOS simulator. The app should display the onboarding flow (soul-gate screen) since no auth/onboarding state exists yet.

If this fails with Xcode errors, check:
- `pod install` may need to run: `cd ios && pod install && cd ..`
- If MMKV fails to link, check that `react-native-mmkv` is in `package.json` dependencies (it is: v4.2.0)

- [ ] **Step 3: Verify state persistence**

Manual test:
1. Navigate through onboarding to soul-snapshot screen
2. Tap "Enter the Realms" to complete onboarding
3. Force-kill the app (swipe up from app switcher in simulator, or `xcrun simctl terminate booted ai.mordoo.app`)
4. Relaunch the app
5. Expected: App should go directly to the main Pulse screen (not onboarding) because `isComplete: true` persisted via MMKV

- [ ] **Step 4: Verify Reanimated loads**

Check Metro bundler output for Reanimated initialization. There should be no "Reanimated worklets are not enabled" warnings in the console.

- [ ] **Step 5: Final TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit any remaining changes (if prebuild modified config files)**

```bash
git status
# If any tracked files were modified by prebuild, commit them:
git add -A ':!ios' ':!android'
git commit -m "chore: post-prebuild config adjustments"
```

Only commit JS/config changes — `ios/` and `android/` are gitignored.
