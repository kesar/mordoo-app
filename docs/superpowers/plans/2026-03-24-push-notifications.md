# Push Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add daily Pulse reminder push notifications with onboarding opt-in, settings controls, and a Supabase Edge Function + pg_cron backend for scheduled delivery.

**Architecture:** expo-notifications on the client registers push tokens and handles notification taps. A Next.js API endpoint saves tokens and preferences to the `profiles` table. A Supabase Edge Function triggered by pg_cron every 15 minutes queries eligible users and sends bilingual notifications via the Expo Push API.

**Tech Stack:** expo-notifications, expo-device, Supabase (pg_cron + Edge Functions + pg_net), Expo Push API, Next.js API routes, Zustand + MMKV

**Spec:** `docs/superpowers/specs/2026-03-24-push-notifications-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/services/notifications.ts` | Create | API calls for token registration + preference updates |
| `src/hooks/useNotificationHandler.ts` | Create | Notification tap handler, Android channel setup |
| `api/src/app/api/notifications/register/route.ts` | Create | Backend endpoint for saving tokens/preferences |
| `supabase/functions/send-daily-reminder/index.ts` | Create | Edge Function for sending daily push notifications |
| `sql/009-push-notifications.sql` | Create | Database migration |
| `src/stores/settingsStore.ts` | Modify | Add `notificationTime` field |
| `app/_layout.tsx` | Modify | Register notification handler hook |
| `app/(onboarding)/power-ups.tsx` | Modify | Wire notification toggle to OS permission request |
| `app/(main)/profile/index.tsx` | Modify | Wire toggle to API, add time picker |
| `app.json` | Modify | Add expo-notifications plugin |
| `src/i18n/en/settings.json` | Modify | Add reminder time translation keys |
| `src/i18n/th/settings.json` | Modify | Add reminder time translation keys |

---

### Task 1: Install dependencies and configure Expo

**Files:**
- Modify: `package.json`
- Modify: `app.json:32-45` (plugins array)

- [ ] **Step 1: Install expo-notifications and expo-device**

Run: `npx expo install expo-notifications expo-device`

- [ ] **Step 2: Add expo-notifications plugin to app.json**

In `app.json`, add to the `plugins` array (after the `expo-sensors` entry at line 39-44):

```json
[
  "expo-notifications",
  {
    "color": "#c9a84c"
  }
]
```

- [ ] **Step 3: Commit**

```bash
git add package.json app.json package-lock.json
git commit -m "chore: add expo-notifications and expo-device dependencies"
```

---

### Task 2: Database migration

**Files:**
- Create: `sql/009-push-notifications.sql`

- [ ] **Step 1: Create sql directory and migration file**

```sql
-- sql/009-push-notifications.sql
-- Add push notification fields to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_time time DEFAULT '07:00';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Bangkok';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_notification_sent date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'th';

-- Index for the Edge Function query (find eligible users efficiently)
CREATE INDEX IF NOT EXISTS idx_profiles_notification_eligible
  ON profiles (notifications_enabled, last_notification_sent)
  WHERE notifications_enabled = true AND push_token IS NOT NULL;
```

- [ ] **Step 2: Commit**

```bash
git add sql/009-push-notifications.sql
git commit -m "feat: add push notification columns migration"
```

- [ ] **Step 3: Run migration against Supabase**

Run the SQL in the Supabase dashboard SQL editor or via CLI. Verify columns exist:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('push_token', 'notifications_enabled', 'notification_time', 'timezone', 'last_notification_sent', 'language');
```

---

### Task 3: Settings store update

**Files:**
- Modify: `src/stores/settingsStore.ts`

- [ ] **Step 1: Add notificationTime to the store interface and implementation**

In `src/stores/settingsStore.ts`, update the interface (line 6-11) to:

```typescript
interface SettingsState {
  language: 'en' | 'th';
  notificationsEnabled: boolean;
  notificationTime: string;
  setLanguage: (lang: 'en' | 'th') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
}
```

Add `notificationTime` default and setter in the store body (after line 17):

```typescript
notificationTime: '07:00',
```

Add setter (after line 23):

```typescript
setNotificationTime: (notificationTime) => set({ notificationTime }),
```

Add to `partialize` (line 28-31):

```typescript
partialize: (state) => ({
  language: state.language,
  notificationsEnabled: state.notificationsEnabled,
  notificationTime: state.notificationTime,
}),
```

- [ ] **Step 2: Verify app still starts**

Run: `npm start` — confirm no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/settingsStore.ts
git commit -m "feat: add notificationTime to settings store"
```

---

### Task 4: Notification service

**Files:**
- Create: `src/services/notifications.ts`

- [ ] **Step 1: Create the notification service**

Follow the exact pattern from `src/services/pulse.ts` — use `supabase.auth.getSession()` for auth, `fetch()` for API calls.

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function registerPushToken(
  token: string,
  timezone: string,
  language: 'en' | 'th',
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/notifications/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      push_token: token,
      notifications_enabled: true,
      timezone,
      language,
    }),
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }
}

export async function updateNotificationPreferences(
  enabled: boolean,
  time?: string,
  language?: 'en' | 'th',
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const body: Record<string, unknown> = { notifications_enabled: enabled };
  if (time) body.notification_time = time;
  if (language) body.language = language;

  const response = await fetch(`${API_BASE_URL}/api/notifications/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Preference update failed: ${response.status}`);
  }
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '969fe2eb-8da0-4af0-be98-df44a79690a8',
  });

  return tokenData.data;
}

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/notifications.ts
git commit -m "feat: add notification service for token registration and preferences"
```

---

### Task 5: Notification handler hook

**Files:**
- Create: `src/hooks/useNotificationHandler.ts`
- Modify: `app/_layout.tsx:1-14` (imports), `app/_layout.tsx:52-55` (hook call)

- [ ] **Step 1: Create the notification handler hook**

```typescript
// src/hooks/useNotificationHandler.ts
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotificationHandler() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(main)/pulse');
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}
```

- [ ] **Step 2: Register the hook in root layout**

In `app/_layout.tsx`, add import (after line 13):

```typescript
import { useNotificationHandler } from '@/src/hooks/useNotificationHandler';
```

In `AppContent` function (after line 29 `useDayChangeRefresh();`), add:

```typescript
useNotificationHandler();
```

- [ ] **Step 3: Verify app still starts**

Run: `npm start` — confirm no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useNotificationHandler.ts app/_layout.tsx
git commit -m "feat: add notification handler hook with tap-to-pulse navigation"
```

---

### Task 6: API endpoint for token registration

**Files:**
- Create: `api/src/app/api/notifications/register/route.ts`

- [ ] **Step 1: Create the endpoint directory and route**

Follow the exact pattern from `api/src/app/api/pulse/daily/route.ts` — use `authenticateRequest()` for auth, `createServiceClient()` for DB writes.

```typescript
// api/src/app/api/notifications/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  // 2. Parse body
  const body = await request.json();
  const {
    push_token,
    notifications_enabled,
    notification_time,
    timezone,
    language,
  } = body;

  // 3. Build update object (only include provided fields)
  const update: Record<string, unknown> = {};
  if (push_token !== undefined) update.push_token = push_token;
  if (notifications_enabled !== undefined) update.notifications_enabled = notifications_enabled;
  if (notification_time !== undefined) update.notification_time = notification_time;
  if (timezone !== undefined) update.timezone = timezone;
  if (language !== undefined) update.language = language;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // 4. If push_token provided, clear it from other profiles first (uniqueness)
  if (push_token) {
    await serviceClient
      .from('profiles')
      .update({ push_token: null })
      .eq('push_token', push_token)
      .neq('user_id', user.id);
  }

  // 5. Update profile
  const { error: updateError } = await serviceClient
    .from('profiles')
    .update(update)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Failed to update notification preferences:', updateError);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Verify API builds**

Run: `cd api && npm run build`

- [ ] **Step 3: Commit**

```bash
git add api/src/app/api/notifications/register/route.ts
git commit -m "feat: add POST /api/notifications/register endpoint"
```

---

### Task 7: Wire up Power-Ups onboarding screen

**Files:**
- Modify: `app/(onboarding)/power-ups.tsx`

- [ ] **Step 1: Add notification permission logic to Power-Ups screen**

In `app/(onboarding)/power-ups.tsx`:

Merge `Alert` into the existing `react-native` import (line 2-8), adding it to the destructured list:

```typescript
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
```

Add new imports (after line 9):

```typescript
import { getExpoPushToken, registerPushToken, getTimezone } from '@/src/services/notifications';
import { useSettingsStore } from '@/src/stores/settingsStore';
```

Rename the local notification state to avoid collision with the store setter. Change line 28 from:

```typescript
const [notificationsEnabled, setNotificationsEnabled] = useState(false);
```

to:

```typescript
const [notifToggle, setNotifToggle] = useState(false);
```

Add store selectors inside the component (after line 28):

```typescript
const language = useSettingsStore((s) => s.language);
const storeSetNotifications = useSettingsStore((s) => s.setNotificationsEnabled);
const [isRequesting, setIsRequesting] = useState(false);
```

Update all references in the notifications card template (lines 112, 113, 117-123) from `notificationsEnabled` to `notifToggle`.

Replace the notifications toggle `onPress` (line 114) from:

```typescript
onPress={() => setNotifToggle((v) => !v)}
```

to:

```typescript
onPress={async () => {
  if (notifToggle) {
    setNotifToggle(false);
    storeSetNotifications(false);
    return;
  }
  if (isRequesting) return;
  setIsRequesting(true);
  try {
    const token = await getExpoPushToken();
    if (!token) {
      Alert.alert(
        t('powerUps.notifications.denied'),
        t('powerUps.notifications.deniedMessage'),
      );
      setIsRequesting(false);
      return;
    }
    setNotifToggle(true);
    storeSetNotifications(true);
    await registerPushToken(token, getTimezone(), language);
  } catch (error) {
    console.error('Failed to register push token:', error);
    // Non-blocking: let user continue even if registration fails
    setNotifToggle(true); // permission was granted even if API call failed
  } finally {
    setIsRequesting(false);
  }
}}
```

- [ ] **Step 2: Add denied-permission translation keys**

In `src/i18n/en/onboarding.json`, add under `powerUps.notifications`:

```json
"denied": "Notifications Blocked",
"deniedMessage": "You can enable notifications later in your device settings."
```

In `src/i18n/th/onboarding.json`, add under `powerUps.notifications`:

```json
"denied": "การแจ้งเตือนถูกบล็อก",
"deniedMessage": "คุณสามารถเปิดการแจ้งเตือนได้ในการตั้งค่าอุปกรณ์ภายหลัง"
```

- [ ] **Step 3: Verify onboarding flow works**

Run the app, navigate through onboarding to Power-Ups. Toggle notifications — verify permission dialog appears (on physical device).

- [ ] **Step 4: Commit**

```bash
git add app/(onboarding)/power-ups.tsx src/i18n/en/onboarding.json src/i18n/th/onboarding.json
git commit -m "feat: wire notification permission request in onboarding Power-Ups"
```

---

### Task 8: Upgrade Settings/Profile screen

**Files:**
- Modify: `app/(main)/profile/index.tsx`
- Modify: `src/i18n/en/settings.json`
- Modify: `src/i18n/th/settings.json`

- [ ] **Step 1: Add translation keys**

In `src/i18n/en/settings.json`, add after `"notifications"` (line 7):

```json
"notificationTime": "Reminder Time",
"notificationTimeDescription": "When should we send your daily reading reminder?"
```

In `src/i18n/th/settings.json`, add after `"notifications"` (line 7):

```json
"notificationTime": "เวลาแจ้งเตือน",
"notificationTimeDescription": "คุณต้องการให้แจ้งเตือนดวงประจำวันเมื่อไหร่?"
```

- [ ] **Step 2: Update profile screen with notification API sync and time picker**

In `app/(main)/profile/index.tsx`:

Add imports (after line 13):

```typescript
import {
  getExpoPushToken,
  updateNotificationPreferences,
  registerPushToken,
  getTimezone,
} from '@/src/services/notifications';
```

Add store selectors (after line 22):

```typescript
const notificationTime = useSettingsStore((s) => s.notificationTime);
const setNotificationTime = useSettingsStore((s) => s.setNotificationTime);
```

Replace `handleNotificationsToggle` (lines 35-38) with:

```typescript
const handleNotificationsToggle = async (value: boolean) => {
  lightHaptic();
  const previousValue = notificationsEnabled;
  setNotificationsEnabled(value); // optimistic update

  try {
    if (value) {
      // Toggling ON: request permission + register token
      const token = await getExpoPushToken();
      if (!token) {
        setNotificationsEnabled(previousValue); // rollback
        Alert.alert(
          t('notifications'),
          'Please enable notifications in your device settings.',
        );
        return;
      }
      await registerPushToken(token, getTimezone(), language);
    } else {
      // Toggling OFF: just update preference on server
      await updateNotificationPreferences(false);
    }
  } catch {
    setNotificationsEnabled(previousValue); // rollback on failure
    Alert.alert(t('common:errors.generic'));
  }
};
```

Add time picker state and helpers:

```typescript
const [showTimePicker, setShowTimePicker] = useState(false);

const TIMES = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, '0');
  const m = String((i % 4) * 15).padStart(2, '0');
  return `${h}:${m}`;
});

const handleTimeChange = async (time: string) => {
  lightHaptic();
  setNotificationTime(time);
  setShowTimePicker(false);
  try {
    await updateNotificationPreferences(true, time);
  } catch {
    // Time update failed silently — will retry on next change
  }
};

const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};
```

Add `useState` and `Modal, FlatList` to imports (merge into existing react-native import):

```typescript
import { ..., Modal, FlatList } from 'react-native';
```

Add time picker UI after the notifications Switch row (after line 120, before the closing `</View>` of settingsGroup):

```tsx
{notificationsEnabled && (
  <>
    <View style={styles.separator} />
    <Pressable
      style={styles.settingsRow}
      onPress={() => { lightHaptic(); setShowTimePicker(true); }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.settingsLabel}>{t('notificationTime')}</Text>
        <Text style={styles.settingsDescription}>{t('notificationTimeDescription')}</Text>
      </View>
      <Text style={styles.settingsValue}>{formatTime(notificationTime)}</Text>
    </Pressable>
  </>
)}
```

Add the time picker modal at the end of the ScrollView (before `</SafeAreaView>`):

```tsx
<Modal visible={showTimePicker} transparent animationType="slide">
  <Pressable
    style={styles.modalOverlay}
    onPress={() => setShowTimePicker(false)}
  >
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{t('notificationTime')}</Text>
      <FlatList
        data={TIMES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.timeOption,
              item === notificationTime && styles.timeOptionActive,
            ]}
            onPress={() => handleTimeChange(item)}
          >
            <Text
              style={[
                styles.timeOptionText,
                item === notificationTime && styles.timeOptionTextActive,
              ]}
            >
              {formatTime(item)}
            </Text>
          </Pressable>
        )}
        initialScrollIndex={TIMES.indexOf(notificationTime)}
        getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
      />
    </View>
  </Pressable>
</Modal>
```

Add modal styles:

```typescript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'flex-end',
},
modalContent: {
  backgroundColor: colors.night.surface,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '50%',
  padding: 20,
},
modalTitle: {
  color: colors.parchment.DEFAULT,
  fontSize: fontSizes.lg,
  fontFamily: fonts.body.semibold,
  textAlign: 'center',
  marginBottom: 16,
},
timeOption: {
  height: 48,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12,
},
timeOptionActive: {
  backgroundColor: colors.gold.muted,
},
timeOptionText: {
  color: colors.parchment.DEFAULT,
  fontSize: fontSizes.base,
},
timeOptionTextActive: {
  color: colors.gold.DEFAULT,
  fontFamily: fonts.body.semibold,
},
settingsDescription: {
  color: colors.outline,
  fontSize: fontSizes.xs,
  marginTop: 2,
},
```

- [ ] **Step 3: Verify settings screen works**

Run the app, go to profile/settings. Toggle notifications on/off. Verify time picker appears when enabled.

- [ ] **Step 4: Commit**

```bash
git add app/(main)/profile/index.tsx src/i18n/en/settings.json src/i18n/th/settings.json
git commit -m "feat: wire notification toggle to API and add reminder time picker"
```

---

### Task 9: Supabase Edge Function

**Files:**
- Create: `supabase/functions/send-daily-reminder/index.ts`

- [ ] **Step 1: Create the Edge Function**

```typescript
// supabase/functions/send-daily-reminder/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface Profile {
  user_id: string;
  push_token: string;
  language: string;
}

function getNotificationContent(lang: string) {
  if (lang === 'th') {
    return { title: 'หมอดู', body: 'ดวงประจำวันของคุณพร้อมแล้ว ✨' };
  }
  return { title: 'Mordoo', body: 'Your daily energy reading is ready ✨' };
}

Deno.serve(async (req) => {
  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Query eligible users
    const { data: users, error } = await supabase.rpc('get_notification_eligible_users');

    // Fallback to direct query if RPC not set up
    // Uses: notifications_enabled = true, push_token not null,
    //       last_notification_sent < today, current time in user's timezone within their window
    const eligible: Profile[] = users ?? [];

    if (error || eligible.length === 0) {
      if (error) console.error('Query error:', error);
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Batch into groups of 100
    const batches: Profile[][] = [];
    for (let i = 0; i < eligible.length; i += 100) {
      batches.push(eligible.slice(i, i + 100));
    }

    let totalSent = 0;
    const failedTokens: string[] = [];

    for (const batch of batches) {
      const messages = batch.map((user) => {
        const content = getNotificationContent(user.language);
        return {
          to: user.push_token,
          title: content.title,
          body: content.body,
          data: { screen: 'pulse' },
          channelId: 'daily-reminders',
        };
      });

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        console.error('Expo Push API error:', response.status);
        continue;
      }

      const result = await response.json();
      const tickets = result.data ?? [];

      // Process tickets per-user
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const user = batch[i];

        if (ticket.status === 'ok') {
          // Mark as sent for this user
          await supabase
            .from('profiles')
            .update({ last_notification_sent: new Date().toISOString().split('T')[0] })
            .eq('user_id', user.user_id);
          totalSent++;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
          failedTokens.push(user.user_id);
        }
      }
    }

    // Clear invalid tokens
    if (failedTokens.length > 0) {
      await supabase
        .from('profiles')
        .update({ push_token: null, notifications_enabled: false })
        .in('user_id', failedTokens);
    }

    console.log(`Sent ${totalSent} notifications, cleared ${failedTokens.length} invalid tokens`);

    return new Response(
      JSON.stringify({ sent: totalSent, cleared: failedTokens.length }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
```

- [ ] **Step 2: Create the SQL function for querying eligible users**

**Important:** This SQL function MUST be deployed to Supabase before the Edge Function will work. The Edge Function calls `supabase.rpc('get_notification_eligible_users')` which depends on this function existing.

Add to `sql/009-push-notifications.sql`:

```sql
-- Function to get users eligible for notification in current 15-min window
CREATE OR REPLACE FUNCTION get_notification_eligible_users()
RETURNS TABLE (user_id uuid, push_token text, language text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.user_id, p.push_token, COALESCE(p.language, 'th') as language
  FROM profiles p
  WHERE p.notifications_enabled = true
    AND p.push_token IS NOT NULL
    AND (p.last_notification_sent IS NULL OR p.last_notification_sent < CURRENT_DATE)
    AND (CURRENT_TIME AT TIME ZONE p.timezone) >= p.notification_time
    AND (CURRENT_TIME AT TIME ZONE p.timezone) < p.notification_time + INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/send-daily-reminder/index.ts sql/009-push-notifications.sql
git commit -m "feat: add Edge Function for sending daily push notifications"
```

---

### Task 10: pg_cron setup and deployment

**Files:**
- Modify: `sql/009-push-notifications.sql` (append pg_cron schedule)

- [ ] **Step 1: Add pg_cron schedule to migration**

Append to `sql/009-push-notifications.sql`:

```sql
-- Schedule: run every 15 minutes
-- NOTE: Replace <project> and <service_role_key> with actual values before running
-- Run this manually in Supabase SQL editor after deploying the Edge Function
SELECT cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/send-daily-reminder',
    headers := '{"Authorization": "Bearer <service_role_key>", "Content-Type": "application/json"}'::jsonb
  )$$
);
```

- [ ] **Step 2: Deploy Edge Function**

Run: `supabase functions deploy send-daily-reminder`

- [ ] **Step 3: Run pg_cron setup in Supabase SQL editor**

Replace `<project>` and `<service_role_key>` with actual values and run.

Verify the cron job is scheduled:

```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-reminders';
```

- [ ] **Step 4: Commit**

```bash
git add sql/009-push-notifications.sql
git commit -m "feat: add pg_cron schedule for daily notification delivery"
```

---

### Task 11: End-to-end verification

- [ ] **Step 1: Test onboarding flow**

On a physical device:
1. Go through onboarding to Power-Ups screen
2. Toggle notifications ON → OS permission dialog should appear
3. Grant permission → token should be registered (check `profiles` table in Supabase)
4. Complete onboarding → land on Pulse tab

- [ ] **Step 2: Test settings**

1. Go to Profile/Settings
2. Toggle notifications OFF → verify `notifications_enabled = false` in profiles
3. Toggle notifications ON → verify permission + re-registration
4. Change reminder time → verify `notification_time` updates in profiles

- [ ] **Step 3: Test Edge Function**

1. Manually invoke: `supabase functions invoke send-daily-reminder`
2. Verify notification received on device
3. Check `last_notification_sent` is updated in profiles

- [ ] **Step 4: Test notification tap**

1. Receive notification (or trigger one manually)
2. Tap notification → should navigate to Pulse tab

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: push notifications complete — onboarding, settings, daily reminders"
```
