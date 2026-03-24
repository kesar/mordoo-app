# Push Notifications — Design Spec

## Overview

Add daily Pulse reminder push notifications to Mordoo. Users opt in during onboarding (Power-Ups screen), configure timing in Settings, and receive a bilingual morning reminder to check their daily reading.

## Architecture

```
Mobile App                    Supabase                      Edge Function
─────────────                ─────────                     ──────────────
1. Request OS permission     profiles table:                1. Query eligible users
2. Get Expo Push Token       + push_token (text)            2. Batch tokens (100/req)
3. Save token via API        + notifications_enabled        3. Call Expo Push API
4. Save time preference      + notification_time (time)     4. Handle failures
5. Receive notification      + timezone (text)              5. Update last_notification_sent
                             + last_notification_sent

                             pg_cron (every 15 min)
                             → triggers Edge Function
```

## Database

### Migration: Add columns to `profiles`

```sql
ALTER TABLE profiles ADD COLUMN push_token text;
ALTER TABLE profiles ADD COLUMN notifications_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN notification_time time DEFAULT '07:00';
ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'Asia/Bangkok';
ALTER TABLE profiles ADD COLUMN last_notification_sent date;
```

- `push_token` — Expo push token string (`ExponentPushToken[xxx]`)
- `notification_time` — user's preferred reminder time, defaults to 7:00 AM
- `timezone` — converts notification_time to UTC for scheduling
- `last_notification_sent` — prevents duplicate sends within the same day
- RLS: existing row-level policies already restrict users to their own profile row

### pg_cron job

```sql
SELECT cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/send-daily-reminder',
    headers := '{"Authorization": "Bearer <service_role_key>", "Content-Type": "application/json"}'::jsonb
  )$$
);
```

## Mobile App

### Dependencies

- `expo-notifications` — push notification SDK
- `expo-device` — physical device detection (notifications don't work on simulators)

### Notification setup (`app/_layout.tsx`)

- Register notification handler on app mount
- Set notification channel (Android): name "Daily Reminders", importance high
- Handle notification tap: navigate to `/(main)/pulse`

### Power-Ups screen (onboarding) — upgrade existing

Current state: toggle card exists but doesn't request permissions.

Changes:
- When user enables toggle → call `Notifications.requestPermissionsAsync()`
- If granted → get Expo push token, call registration API
- If denied → show brief message, let user continue (non-blocking)
- Save preference to onboarding store for later sync
- Existing UI and copy ("Daily Oracle Whispers") stays as-is

### Settings screen — upgrade existing

Current state: toggle exists but only updates local store.

Changes:
- Toggle now syncs to server via API
- When toggling ON: check OS permission, request if needed, register token
- When toggling OFF: update `notifications_enabled = false` on server (keep token)
- Add time picker below toggle (visible only when enabled)
  - Default: 07:00
  - Picker shows hours in 15-min increments
  - Updates server on change
- Add translations for time picker label

### New service: `src/services/notifications.ts`

```typescript
// Register or update push token and preferences
registerPushToken(token: string, timezone: string): Promise<void>

// Update notification preferences (enabled state and/or time)
updateNotificationPreferences(enabled: boolean, time?: string): Promise<void>

// Get current OS permission status
getNotificationPermissionStatus(): Promise<PermissionStatus>
```

### Settings store update

Add to `settingsStore`:
- `notificationTime: string` — default `'07:00'`, persisted to MMKV
- `setNotificationTime: (time: string) => void`

### Notification handler hook: `src/hooks/useNotificationHandler.ts`

- Listens for notification taps
- Routes to Pulse tab on tap
- Registered once in root layout

## API Endpoint

### `POST /api/notifications/register`

Location: `api/src/app/api/notifications/register/route.ts`

**Request:**
```json
{
  "push_token": "ExponentPushToken[xxx]",
  "notifications_enabled": true,
  "notification_time": "07:00",
  "timezone": "Asia/Bangkok"
}
```

**Auth:** Supabase bearer token (same pattern as existing endpoints).

**Logic:**
1. Validate bearer token, extract user ID
2. Update `profiles` row with provided fields
3. Return 200 on success

All fields optional — client sends only what changed.

## Supabase Edge Function

### `send-daily-reminder`

**Trigger:** pg_cron every 15 minutes.

**Query logic:**
```sql
SELECT id, push_token, language
FROM profiles
WHERE notifications_enabled = true
  AND push_token IS NOT NULL
  AND (last_notification_sent IS NULL OR last_notification_sent < CURRENT_DATE)
  AND notification_time >= (CURRENT_TIME AT TIME ZONE timezone)
  AND notification_time < (CURRENT_TIME AT TIME ZONE timezone + INTERVAL '15 minutes')
```

**Notification content (bilingual):**
- EN title: "Mordoo" / body: "Your daily energy reading is ready ✨"
- TH title: "หมอดู" / body: "ดวงประจำวันของคุณพร้อมแล้ว ✨"

**Expo Push API:**
- Batch tokens in groups of 100 (API limit)
- POST to `https://exp.host/--/api/v2/push/send`
- Handle `DeviceNotRegistered` errors: clear `push_token` from profile
- Update `last_notification_sent = CURRENT_DATE` for successful sends

**Error handling:**
- Log failures but don't retry immediately (next cron run will catch missed users)
- Invalid tokens are cleared automatically
- Rate limiting: Expo allows 600 req/min, batching keeps us well under

## Translations

### English (`src/i18n/en/settings.json`)
- `settings.notificationTime`: "Reminder Time"
- `settings.notificationTimeDescription`: "When should we send your daily reading reminder?"

### Thai (`src/i18n/th/settings.json`)
- `settings.notificationTime`: "เวลาแจ้งเตือน"
- `settings.notificationTimeDescription`: "คุณต้องการให้แจ้งเตือนดวงประจำวันเมื่อไหร่?"

## Files to Create/Modify

### New files
- `src/services/notifications.ts` — notification service
- `src/hooks/useNotificationHandler.ts` — tap handler hook
- `api/src/app/api/notifications/register/route.ts` — registration endpoint
- `supabase/functions/send-daily-reminder/index.ts` — Edge Function
- `sql/009-push-notifications.sql` — migration

### Modified files
- `package.json` — add expo-notifications, expo-device
- `app.json` / `app.config.js` — notification permissions config
- `app/_layout.tsx` — register notification handler
- `app/(onboarding)/power-ups.tsx` — wire up permission request
- `app/(main)/profile/index.tsx` — add time picker, wire toggle to API
- `src/stores/settingsStore.ts` — add notificationTime
- `src/i18n/en/settings.json` — new translation keys
- `src/i18n/th/settings.json` — new translation keys
