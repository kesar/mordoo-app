# User-Timezone-Aware Dates

**Date:** 2026-03-26
**Status:** Approved

## Problem

All server-side date logic — quota resets, conversation day boundaries, Siam Si draw seeds, and the Oracle system prompt's "today" — uses `getBangkokDateString()`, which hardcodes UTC+7 (Bangkok time). Users outside Thailand get incorrect day boundaries: a user in New York at 10pm sees "tomorrow's" conversation, and their quota resets at 12pm EST instead of midnight.

## Solution

Read the user's IANA timezone from `profiles.timezone` (column already exists, defaults to `'Asia/Bangkok'`) and use it for all server-side date calculations. Sync the client's timezone to the profile on app launch.

## Scope

### In scope
- New timezone-aware date helper in `api/src/lib/date.ts`
- Update all API endpoints that call `getBangkokDateString()` to use user timezone
- Client-side timezone sync on auth session start
- Move `getTimezone()` to a shared utility (currently only in notifications service)

### Out of scope
- Pulse daily endpoint (already uses client-sent `date` param — already timezone-aware)
- Push notifications DB function (already uses `profiles.timezone`)
- Changing the DB column default from `'Asia/Bangkok'` (correct for most existing users)

## Design

### 1. Date Helper — `api/src/lib/date.ts`

Add a new function `getDateStringForTimezone(timezone: string)` that returns `YYYY-MM-DD` for the current moment in the given IANA timezone.

```typescript
/** Returns today's date in the given IANA timezone as YYYY-MM-DD string. */
export function getDateStringForTimezone(timezone: string, now = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(now); // en-CA locale gives YYYY-MM-DD
  } catch {
    // Invalid timezone — fall back to Bangkok
    return getBangkokDateString(now);
  }
}
```

`getBangkokDateString()` remains as-is for backward compatibility but callers will be migrated.

### 2. API Endpoint Changes

Every endpoint that currently calls `getBangkokDateString()` already fetches the user's profile (for `tier`). The change is:

1. Add `timezone` to the profile `.select()` call
2. Pass `profile.timezone ?? 'Asia/Bangkok'` to `getDateStringForTimezone()`

**Affected endpoints:**

| Endpoint | File | Current usage |
|----------|------|---------------|
| Oracle chat | `api/src/app/api/oracle/chat/route.ts` | Quota reset, system prompt "today", conversation lookup |
| Oracle today | `api/src/app/api/oracle/today/route.ts` | Conversation lookup, quota check |
| Siam Si | `api/src/app/api/oracle/siam-si/route.ts` | Quota reset, draw seed |

**`api/src/lib/conversation.ts`** — `findOrCreateConversation()` and `summarizeConversation()` currently call `getBangkokDateString()` internally. Change their signatures to accept a `timezone` parameter:

```typescript
export async function findOrCreateConversation(
  client: SupabaseClient,
  userId: string,
  timezone: string,
): Promise<{ id: string; conversationDate: string }>

export async function summarizeConversation(
  client: SupabaseClient,
  userId: string,
  timezone: string,
): Promise<void>
```

### 3. Client Timezone Sync

On auth session start, update the user's profile timezone. This happens in `src/hooks/useAuthListener.ts`:

```typescript
// After successful session detection
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
supabase.from('profiles').update({ timezone: tz }).eq('id', session.user.id);
```

This is fire-and-forget — no need to await or handle errors. If it fails, the existing default (`'Asia/Bangkok'`) is used.

Move `getTimezone()` from `src/services/notifications.ts` to `src/utils/timezone.ts` and re-export from notifications for backward compatibility.

### 4. Fallback Strategy

- If `profile.timezone` is null or missing → use `'Asia/Bangkok'`
- If `profile.timezone` is an invalid IANA string → `Intl.DateTimeFormat` throws, caught by try/catch, falls back to `getBangkokDateString()`
- If profile fetch fails entirely → endpoint already returns 500 (no change)

## Data Flow

```
App launch
  → useAuthListener detects session
  → fire-and-forget: profiles.update({ timezone: Intl...timeZone })

API request (e.g., Oracle chat)
  → authenticateRequest() → user
  → profiles.select('tier, timezone') → timezone
  → getDateStringForTimezone(timezone) → today string
  → use today for quota, conversation, draw seed
```

## Migration

No migration needed. The `timezone` column already exists on `profiles` (added in `sql/009-push-notifications.sql`) with default `'Asia/Bangkok'`. Existing users keep Bangkok time until they open the app, which triggers the sync.

## Testing

- Unit test `getDateStringForTimezone()` with known timezones (America/New_York, Asia/Bangkok, Europe/London)
- Unit test fallback behavior with invalid timezone string
- Verify quota resets correctly at user-local midnight (manual/integration)
