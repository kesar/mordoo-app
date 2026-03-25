# Onboarding Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Power-Ups screen from onboarding, move notification prompt to Pulse screen, fix progress indicators.

**Architecture:** Remove power-ups from onboarding stack. Life-context becomes the final onboarding screen and navigates directly to main app. A new `NotificationPrompt` bottom sheet component shows on Pulse after first view. Settings store tracks whether the prompt has been shown.

**Tech Stack:** React Native, Expo Router, Zustand/MMKV, expo-notifications, i18next

---

### Task 1: Add `notificationPromptShown` flag to settings store

**Files:**
- Modify: `src/stores/settingsStore.ts`

- [ ] **Step 1: Add flag to store**

Add `notificationPromptShown: boolean` to `SettingsState` interface and store, defaulting to `false`. Add setter `setNotificationPromptShown`.

```typescript
// In SettingsState interface, add:
notificationPromptShown: boolean;
setNotificationPromptShown: (shown: boolean) => void;

// In create(), add:
notificationPromptShown: false,
setNotificationPromptShown: (notificationPromptShown) => set({ notificationPromptShown }),

// In partialize, add:
notificationPromptShown: state.notificationPromptShown,
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to settingsStore

- [ ] **Step 3: Commit**

```bash
git add src/stores/settingsStore.ts
git commit -m "feat: add notificationPromptShown flag to settings store"
```

---

### Task 2: Create NotificationPrompt component

**Files:**
- Create: `src/components/NotificationPrompt.tsx`
- Modify: `src/i18n/en/common.json` (add notification prompt strings)
- Modify: `src/i18n/th/common.json` (add notification prompt strings)

- [ ] **Step 1: Add i18n strings**

Add to `src/i18n/en/common.json` under a new `"notificationPrompt"` key:

```json
"notificationPrompt": {
  "title": "Your Daily Cosmic Reading Awaits",
  "description": "Get your Prana Index, lucky elements, and daily insight delivered every morning.",
  "enable": "Enable Notifications",
  "later": "Maybe Later",
  "noSpam": "We'll only notify you once daily — no spam, ever."
}
```

Add equivalent Thai strings to `src/i18n/th/common.json`:

```json
"notificationPrompt": {
  "title": "ดวงประจำวันรอคุณอยู่",
  "description": "รับดัชนีพลังชีวิต ธาตุนำโชค และข้อมูลเชิงลึกประจำวันทุกเช้า",
  "enable": "เปิดการแจ้งเตือน",
  "later": "ไว้ทีหลัง",
  "noSpam": "เราจะแจ้งเตือนวันละครั้งเท่านั้น — ไม่มีสแปม"
}
```

- [ ] **Step 2: Create the NotificationPrompt component**

Create `src/components/NotificationPrompt.tsx`. This is a modal bottom sheet with:
- Props: `visible: boolean`, `onClose: () => void`
- Uses `Modal` with `transparent` and `animationType="slide"`
- Dark surface background (`rgba(31, 31, 41, 0.98)`), gold accents
- Sparkle icon at top
- Title (CinzelDecorative), description (CormorantGaramond)
- "Enable Notifications" gold filled button
- "Maybe Later" ghost button
- Small "no spam" note at bottom

On "Enable":
1. Call `getExpoPushToken()` from notifications service
2. If granted: call `registerPushToken(token, timezone, language)`, set `notificationsEnabled(true)`, set `notificationPromptShown(true)`, track `notification_permission_result` with `{ granted: true, trigger: 'pulse' }`, close modal
3. If denied: show Alert with denial message, set `notificationPromptShown(true)`, track `notification_permission_result` with `{ granted: false, trigger: 'pulse' }`, close modal

On "Maybe Later":
1. Set `notificationPromptShown(true)`
2. Track `notification_prompt_dismissed`
3. Close modal

```typescript
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { SparkleIcon } from '@/src/components/icons/TarotIcons';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { getExpoPushToken, registerPushToken, getTimezone } from '@/src/services/notifications';
import { analytics } from '@/src/services/analytics';

interface NotificationPromptProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationPrompt({ visible, onClose }: NotificationPromptProps) {
  const { t } = useTranslation('common');
  const language = useSettingsStore((s) => s.language);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setNotificationPromptShown = useSettingsStore((s) => s.setNotificationPromptShown);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnable = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const token = await getExpoPushToken();
      if (!token) {
        analytics.track('notification_permission_result', { granted: false, trigger: 'pulse' });
        Alert.alert(
          t('notificationPrompt.title'),
          t('notificationPrompt.noSpam'),
        );
        setNotificationPromptShown(true);
        onClose();
        return;
      }
      setNotificationsEnabled(true);
      setNotificationPromptShown(true);
      analytics.track('notification_permission_result', { granted: true, trigger: 'pulse' });
      await registerPushToken(token, getTimezone(), language);
      onClose();
    } catch (error) {
      console.error('Failed to register push token:', error);
      setNotificationPromptShown(true);
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLater = () => {
    setNotificationPromptShown(true);
    analytics.track('notification_prompt_dismissed');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleLater}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <SparkleIcon size={28} color={colors.gold.DEFAULT} />
          <Text style={styles.title}>{t('notificationPrompt.title')}</Text>
          <Text style={styles.description}>{t('notificationPrompt.description')}</Text>
          <View style={styles.buttons}>
            <GoldButton
              title={t('notificationPrompt.enable')}
              onPress={handleEnable}
              variant="filled"
              fullWidth
              rounded
            />
            <GoldButton
              title={t('notificationPrompt.later')}
              onPress={handleLater}
              variant="ghost"
            />
          </View>
          <Text style={styles.note}>{t('notificationPrompt.noSpam')}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: 'rgba(31, 31, 41, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gold.border,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.gold.light,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttons: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  note: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.xs,
    color: 'rgba(208, 197, 178, 0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});
```

- [ ] **Step 3: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/NotificationPrompt.tsx src/i18n/en/common.json src/i18n/th/common.json
git commit -m "feat: create NotificationPrompt bottom sheet component"
```

---

### Task 3: Wire NotificationPrompt into Pulse screen

**Files:**
- Modify: `app/(main)/pulse/index.tsx`

- [ ] **Step 1: Add notification prompt state and trigger**

Add imports at top of file:

```typescript
import { NotificationPrompt } from '@/src/components/NotificationPrompt';
import { useSettingsStore } from '@/src/stores/settingsStore';
```

Inside `PulseScreen` component, add state:

```typescript
const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
const notificationPromptShown = useSettingsStore((s) => s.notificationPromptShown);
const [showNotifPrompt, setShowNotifPrompt] = useState(false);
```

In the existing `useEffect` that tracks pulse views (the one with `hasTrackedRef`), add notification prompt trigger after the rating prompt check:

```typescript
useEffect(() => {
  if (pulse && !hasTrackedRef.current) {
    hasTrackedRef.current = true;
    incrementPulseView();
    analytics.track('pulse_viewed', {
      energy_score: pulse.energyScore,
      date: pulse.date,
    });
    if (features.ratingPrompt) {
      showRatingPrompt(1500);
    }
    // Show notification prompt on first pulse view (if not already enabled/shown)
    if (!notificationsEnabled && !notificationPromptShown) {
      setTimeout(() => setShowNotifPrompt(true), 2500);
    }
  }
}, [pulse, showRatingPrompt, notificationsEnabled, notificationPromptShown]);
```

Add the component before the closing `</SafeAreaView>`, after the `<RatingPrompt>`:

```tsx
<NotificationPrompt
  visible={showNotifPrompt}
  onClose={() => setShowNotifPrompt(false)}
/>
```

- [ ] **Step 2: Add `useState` to imports if not already present**

Check the existing imports — `useState` needs to be imported from React. Currently line 1 imports `useEffect, useRef` — add `useState`:

```typescript
import { useEffect, useRef, useState } from 'react';
```

- [ ] **Step 3: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/(main)/pulse/index.tsx
git commit -m "feat: show notification prompt on first pulse view"
```

---

### Task 4: Update life-context to be final onboarding screen

**Files:**
- Modify: `app/(onboarding)/life-context.tsx`

- [ ] **Step 1: Update handleContinue to navigate to main app**

Replace the `handleContinue` function. Import `completeOnboarding` from onboarding store and `analytics`:

```typescript
// Add to existing imports:
import { analytics } from '@/src/services/analytics';

// Add to component body (alongside existing store selectors):
const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
```

Replace the `handleContinue` function:

```typescript
const handleContinue = () => {
  setConcerns(selectedConcerns);
  setUrgencyContext(urgency || null);
  analytics.track('onboarding_completed');
  setStep(5);
  completeOnboarding();
  router.replace('/(main)/pulse');
};
```

Key changes:
- `setStep(5)` instead of `setStep(5)` (same value, but now it's the final step)
- Calls `completeOnboarding()` (was only in power-ups before)
- Navigates to `/(main)/pulse` with `router.replace` (not `router.push` to power-ups)
- Tracks `onboarding_completed` analytics event

- [ ] **Step 2: Update progress indicator**

Change from `currentStep={4} totalSteps={6}` to `currentStep={4} totalSteps={4}`:

```tsx
<ProgressIndicator
  currentStep={4}
  totalSteps={4}
  label={t('lifeContext.step')}
/>
```

- [ ] **Step 3: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/(onboarding)/life-context.tsx
git commit -m "feat: make life-context final onboarding screen, navigate to main app"
```

---

### Task 5: Remove power-ups from onboarding stack

**Files:**
- Modify: `app/(onboarding)/_layout.tsx`

- [ ] **Step 1: Remove power-ups Screen from layout**

Remove the `<Stack.Screen name="power-ups" />` line:

```typescript
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.night.DEFAULT },
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="soul-gate" />
      <Stack.Screen name="phone-auth" />
      <Stack.Screen name="birth-data" />
      <Stack.Screen name="name-numbers" />
      <Stack.Screen name="life-context" />
    </Stack>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(onboarding)/_layout.tsx
git commit -m "feat: remove power-ups screen from onboarding stack"
```

---

### Task 6: Fix progress indicators on all onboarding screens

**Files:**
- Modify: `app/(onboarding)/soul-gate.tsx` (line ~127)
- Modify: `app/(onboarding)/birth-data.tsx` (line ~121-122)
- Modify: `app/(onboarding)/name-numbers.tsx` (line ~88-89)
- Modify: `src/i18n/en/onboarding.json`
- Modify: `src/i18n/th/onboarding.json`

- [ ] **Step 1: Fix soul-gate progress**

Change `totalSteps={3}` to `totalSteps={4}`:

```tsx
<ProgressIndicator
  currentStep={1}
  totalSteps={4}
  label={t('soulGate.step')}
/>
```

- [ ] **Step 2: Fix birth-data progress**

Change `totalSteps={6}` to `totalSteps={4}`:

```tsx
<ProgressIndicator
  currentStep={2}
  totalSteps={4}
  label={t('birthData.step')}
/>
```

- [ ] **Step 3: Fix name-numbers progress**

Change `totalSteps={6}` to `totalSteps={4}`:

```tsx
<ProgressIndicator
  currentStep={3}
  totalSteps={4}
  label={t('nameNumbers.step')}
/>
```

- [ ] **Step 4: Update i18n step labels (English)**

In `src/i18n/en/onboarding.json`, update the step labels:

```json
"birthData": {
  "step": "Phase 2 of 4 — The Blueprint",
  ...
},
"nameNumbers": {
  "step": "Phase 3 of 4 — The Vibration",
  ...
},
"lifeContext": {
  "step": "Phase 4 of 4 — The Intent",
  ...
}
```

- [ ] **Step 5: Update i18n step labels (Thai)**

In `src/i18n/th/onboarding.json`, update the step labels:

```json
"birthData": {
  "step": "ขั้นตอนที่ 2 จาก 4 — พิมพ์เขียว",
  ...
},
"nameNumbers": {
  "step": "ขั้นตอนที่ 3 จาก 4 — การสั่นสะเทือน",
  ...
},
"lifeContext": {
  "step": "ขั้นตอนที่ 4 จาก 4 — เจตนา",
  ...
}
```

- [ ] **Step 6: Verify no type errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add app/(onboarding)/soul-gate.tsx app/(onboarding)/birth-data.tsx app/(onboarding)/name-numbers.tsx src/i18n/en/onboarding.json src/i18n/th/onboarding.json
git commit -m "fix: update progress indicators to 4 steps across all onboarding screens"
```

---

### Task 7: Manual verification

- [ ] **Step 1: Start the app and walk through onboarding**

Run: `npm start`

Verify:
1. Soul Gate shows 1/4 progress
2. Birth Data shows 2/4 progress
3. Name Numbers shows 3/4 progress
4. Life Context shows 4/4 progress
5. Life Context "DECLARE YOUR INTENT" navigates directly to Pulse (no power-ups screen)
6. On Pulse screen, after ~2.5 seconds, notification prompt bottom sheet appears
7. Tapping "Maybe Later" dismisses the prompt
8. Prompt does NOT show again on subsequent Pulse views
9. Power-ups screen is not accessible

- [ ] **Step 2: Test notification enable flow**

Reset the `notificationPromptShown` flag (clear app data or modify MMKV) and verify:
1. Prompt appears on Pulse
2. Tapping "Enable Notifications" triggers system permission dialog
3. After granting, prompt closes and notifications are enabled in settings
4. Prompt does NOT show again

- [ ] **Step 3: Final commit with all changes verified**

```bash
git add -A
git status
# Verify only expected files are staged
git commit -m "feat: simplify onboarding — remove power-ups, move notifications to pulse"
```
