# User-Timezone-Aware Dates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded Bangkok timezone with user's IANA timezone for quota resets, conversation boundaries, and Siam Si draws.

**Architecture:** Add `getDateStringForTimezone(tz)` to the API date helper. All endpoints already fetch user profiles for tier — add `timezone` to those selects and pass it through. Client syncs its timezone to the profile on auth session start.

**Tech Stack:** TypeScript, Intl.DateTimeFormat, Supabase, Expo (React Native)

**Spec:** `docs/superpowers/specs/2026-03-26-user-timezone-aware-dates-design.md`

---

### Task 1: Add `getDateStringForTimezone` Helper

**Files:**
- Modify: `api/src/lib/date.ts`
- Create: `api/src/lib/__tests__/date.test.ts`
- Modify: `vitest.config.ts` (expand test include)

- [ ] **Step 1: Expand vitest include to cover API lib tests**

In `vitest.config.ts`, change the `include` array:

```typescript
test: {
  include: [
    'shared/__tests__/**/*.test.ts',
    'api/src/lib/__tests__/**/*.test.ts',
  ],
},
```

And add the `@/*` alias used by the API:

```typescript
resolve: {
  alias: {
    '@shared': path.resolve(__dirname, './shared'),
    '@': path.resolve(__dirname, '.'),
  },
},
```

- [ ] **Step 2: Write failing tests for `getDateStringForTimezone`**

Create `api/src/lib/__tests__/date.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getDateStringForTimezone, getBangkokDateString } from '../date';

describe('getDateStringForTimezone', () => {
  it('returns correct date for Asia/Bangkok', () => {
    // 2026-01-15 23:30 UTC = 2026-01-16 06:30 Bangkok (UTC+7)
    const now = new Date('2026-01-15T23:30:00Z');
    expect(getDateStringForTimezone('Asia/Bangkok', now)).toBe('2026-01-16');
  });

  it('returns correct date for America/New_York', () => {
    // 2026-01-15 03:00 UTC = 2026-01-14 22:00 New York (UTC-5 in Jan)
    const now = new Date('2026-01-15T03:00:00Z');
    expect(getDateStringForTimezone('America/New_York', now)).toBe('2026-01-14');
  });

  it('returns correct date for Europe/London', () => {
    // 2026-07-15 00:30 UTC = 2026-07-15 01:30 London (BST, UTC+1 in summer)
    const now = new Date('2026-07-15T00:30:00Z');
    expect(getDateStringForTimezone('Europe/London', now)).toBe('2026-07-15');
  });

  it('falls back to Bangkok for invalid timezone', () => {
    const now = new Date('2026-01-15T23:30:00Z');
    const result = getDateStringForTimezone('Invalid/Timezone', now);
    expect(result).toBe(getBangkokDateString(now));
  });

  it('returns YYYY-MM-DD format', () => {
    const now = new Date('2026-03-05T12:00:00Z');
    const result = getDateStringForTimezone('UTC', now);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- api/src/lib/__tests__/date.test.ts`
Expected: FAIL — `getDateStringForTimezone` is not exported

- [ ] **Step 4: Implement `getDateStringForTimezone`**

Add to `api/src/lib/date.ts` after the existing `getBangkokDateString` function:

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
    return formatter.format(now);
  } catch {
    // Invalid timezone — fall back to Bangkok
    return getBangkokDateString(now);
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- api/src/lib/__tests__/date.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add api/src/lib/date.ts api/src/lib/__tests__/date.test.ts vitest.config.ts
git commit -m "feat: add getDateStringForTimezone helper with tests"
```

---

### Task 2: Update `conversation.ts` to Accept Timezone

**Files:**
- Modify: `api/src/lib/conversation.ts`

- [ ] **Step 1: Update `findOrCreateConversation` signature and body**

In `api/src/lib/conversation.ts`, change the import and function:

Replace:
```typescript
import { getBangkokDateString } from './date';
```
With:
```typescript
import { getDateStringForTimezone } from './date';
```

Change `findOrCreateConversation` to accept a `timezone` parameter:

```typescript
export async function findOrCreateConversation(
  client: SupabaseClient,
  userId: string,
  timezone: string,
): Promise<{ id: string; conversationDate: string }> {
  const today = getDateStringForTimezone(timezone);
```

The rest of the function body stays the same — it already uses `today` everywhere.

- [ ] **Step 2: Update `summarizeConversation` to accept timezone**

Change `summarizeConversation` to accept a `timezone` parameter:

```typescript
export async function summarizeConversation(
  client: SupabaseClient,
  userId: string,
  timezone: string,
): Promise<void> {
```

Inside the try block, replace:
```typescript
    const today = getBangkokDateString();
```
With:
```typescript
    const today = getDateStringForTimezone(timezone);
```

- [ ] **Step 3: Verify API compiles**

Run: `cd api && npx tsc --noEmit`
Expected: Compile errors in files that call these functions (chat, today, siam-si routes) — this is expected and will be fixed in the next tasks.

- [ ] **Step 4: Commit**

```bash
git add api/src/lib/conversation.ts
git commit -m "refactor: conversation functions accept timezone parameter"
```

---

### Task 3: Update Oracle Chat Endpoint

**Files:**
- Modify: `api/src/app/api/oracle/chat/route.ts`

- [ ] **Step 1: Update import**

Replace:
```typescript
import { getBangkokDateString } from '../../../../lib/date';
```
With:
```typescript
import { getDateStringForTimezone } from '../../../../lib/date';
```

- [ ] **Step 2: Add `timezone` to profile select**

Change the profile query (around line 157-161):

```typescript
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier, timezone')
    .eq('id', user.id)
    .single();
```

- [ ] **Step 3: Replace `getBangkokDateString()` with timezone-aware call**

After the profile fetch, add the timezone extraction and replace the `today` variable (around line 145):

Replace:
```typescript
  const today = getBangkokDateString();
```
With:
```typescript
  const timezone = profile?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);
```

- [ ] **Step 4: Update system prompt to use timezone-aware date**

In `buildSystemPrompt`, the function currently calls `getBangkokDateString()` directly on line 63. Change the function signature to accept a `today` parameter:

```typescript
function buildSystemPrompt(
  birthData?: { dateOfBirth: string; fullName?: string; concerns: string[] },
  lang?: string,
  summaries?: Array<{ date: string; summary: string }>,
  today?: string,
) {
```

Replace line 63:
```typescript
- Today's date: ${getBangkokDateString()}
```
With:
```typescript
- Today's date: ${today ?? new Date().toISOString().slice(0, 10)}
```

Update the call site (around line 220-224) to pass `today`:

```typescript
  const systemPrompt = buildSystemPrompt(
    birthData ?? undefined,
    rawLang ?? undefined,
    summaries,
    today,
  );
```

Remove the `getBangkokDateString` import since it's no longer used.

- [ ] **Step 5: Pass timezone to conversation functions**

Update the `findOrCreateConversation` call (around line 203):

```typescript
    conversation = await findOrCreateConversation(serviceClient, user.id, timezone);
```

Update the `summarizeConversation` call (around line 212):

```typescript
  summarizeConversation(serviceClient, user.id, timezone);
```

- [ ] **Step 6: Verify compilation**

Run: `cd api && npx tsc --noEmit`
Expected: No errors from this file (other files may still have errors)

- [ ] **Step 7: Commit**

```bash
git add api/src/app/api/oracle/chat/route.ts
git commit -m "feat: oracle chat uses user timezone for date boundaries"
```

---

### Task 4: Update Oracle Today Endpoint

**Files:**
- Modify: `api/src/app/api/oracle/today/route.ts`

- [ ] **Step 1: Update import**

Replace:
```typescript
import { getBangkokDateString } from '../../../../lib/date';
```
With:
```typescript
import { getDateStringForTimezone } from '../../../../lib/date';
```

- [ ] **Step 2: Add `timezone` to profile select and compute `today`**

The profile is fetched inside a `Promise.all` on line 28-31. Add `timezone`:

```typescript
    serviceClient
      .from('profiles')
      .select('tier, timezone')
      .eq('id', user.id)
      .single(),
```

Replace the `today` variable (line 12):

```typescript
  const timezone = profileResult.data?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);
```

Note: `today` must be computed _after_ the `Promise.all` resolves (since it depends on `profileResult`). Move the `const today = ...` line to after the `Promise.all` block (after line 32). The conversation query inside `Promise.all` currently uses `today` — it needs to be restructured:

Restructure to fetch profile first, then conversation+quota in parallel:

```typescript
  const serviceClient = createServiceClient();

  // Fetch profile first (need timezone)
  const { data: profileData } = await serviceClient
    .from('profiles')
    .select('tier, timezone')
    .eq('id', user.id)
    .single();

  const timezone = profileData?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);

  // Fetch conversation and quota in parallel
  const [conversationResult, quotaResult] = await Promise.all([
    serviceClient
      .from('oracle_conversations')
      .select('id, conversation_date')
      .eq('user_id', user.id)
      .eq('conversation_date', today)
      .single(),
    serviceClient
      .from('user_quotas')
      .select('oracle_questions_today, oracle_last_reset')
      .eq('user_id', user.id)
      .single(),
  ]);

  const tier = profileData?.tier || 'free';
```

Update the rest of the function to use `profileData` instead of `profileResult.data`.

- [ ] **Step 3: Verify compilation**

Run: `cd api && npx tsc --noEmit`
Expected: No errors from this file

- [ ] **Step 4: Commit**

```bash
git add api/src/app/api/oracle/today/route.ts
git commit -m "feat: oracle today endpoint uses user timezone"
```

---

### Task 5: Update Siam Si Endpoint

**Files:**
- Modify: `api/src/app/api/oracle/siam-si/route.ts`

- [ ] **Step 1: Update import**

Replace:
```typescript
import { getBangkokDateString } from '../../../../lib/date';
```
With:
```typescript
import { getDateStringForTimezone } from '../../../../lib/date';
```

- [ ] **Step 2: Add timezone to profile select and update `today` in GET handler**

In the GET handler, add `timezone` to the profile select (around line 19):

```typescript
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier, timezone')
    .eq('id', user.id)
    .single();
```

Replace `const today = getBangkokDateString();` (line 27):

```typescript
  const timezone = profile?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);
```

- [ ] **Step 3: Update `today` in POST handler**

In the POST handler, add `timezone` to the profile select (around line 74-78):

```typescript
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier, timezone')
    .eq('id', user.id)
    .single();
```

Replace `const today = getBangkokDateString();` (line 84):

```typescript
  const timezone = profile?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);
```

- [ ] **Step 4: Verify compilation**

Run: `cd api && npx tsc --noEmit`
Expected: Clean compile — all callers updated

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: All existing tests pass (shared tests are unaffected, new date tests pass)

- [ ] **Step 6: Commit**

```bash
git add api/src/app/api/oracle/siam-si/route.ts
git commit -m "feat: siam si uses user timezone for quota and draw seed"
```

---

### Task 6: Client-Side Timezone Sync

**Files:**
- Create: `src/utils/timezone.ts`
- Modify: `src/hooks/useAuthListener.ts`
- Modify: `src/services/notifications.ts`
- Modify: `src/components/NotificationPrompt.tsx`

- [ ] **Step 1: Create `src/utils/timezone.ts`**

```typescript
/** Returns the device's IANA timezone string (e.g. 'America/New_York'). */
export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

- [ ] **Step 2: Update `src/services/notifications.ts` to import from shared util**

Remove the `getTimezone` function (lines 88-90) and re-export from the new util:

Replace:
```typescript
export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```
With:
```typescript
export { getTimezone } from '@/src/utils/timezone';
```

This keeps the existing import in `NotificationPrompt.tsx` working without changes.

- [ ] **Step 3: Update `src/hooks/useAuthListener.ts` to sync timezone**

```typescript
import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/stores/authStore';
import { getTimezone } from '@/src/utils/timezone';

export function useAuthListener() {
  const setSupabaseSession = useAuthStore((s) => s.setSupabaseSession);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    // Check current session on mount — clear stale auth if expired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSupabaseSession(session);
        // Sync device timezone to profile (fire-and-forget)
        supabase.from('profiles').update({ timezone: getTimezone() }).eq('id', session.user.id);
      } else if (useAuthStore.getState().isAuthenticated) {
        logout();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSupabaseSession(session);
        } else if (useAuthStore.getState().isAuthenticated) {
          logout();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [setSupabaseSession, logout]);
}
```

The timezone sync only runs on mount (initial session check), not on every auth state change — this avoids unnecessary writes on token refreshes.

- [ ] **Step 4: Verify the app compiles**

Run: `npx expo export --platform ios --dump-sourcemap false 2>&1 | head -5` or `npx tsc --noEmit` if available.

- [ ] **Step 5: Commit**

```bash
git add src/utils/timezone.ts src/hooks/useAuthListener.ts src/services/notifications.ts
git commit -m "feat: sync device timezone to profile on app launch"
```

---

### Task 7: Clean Up — Remove Unused `getBangkokDateString` Import

**Files:**
- Modify: `api/src/lib/date.ts` (optional — keep function for backward compat)

- [ ] **Step 1: Verify no remaining callers of `getBangkokDateString` except fallback**

Run: `grep -r "getBangkokDateString" api/src/ --include="*.ts" | grep -v "__tests__" | grep -v "date.ts"`

Expected: No results (all callers migrated)

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Final commit**

If `getBangkokDateString` has no remaining callers outside of `date.ts` itself (where it's used as fallback inside `getDateStringForTimezone`), no cleanup needed — it serves as the fallback. Done.

```bash
git commit --allow-empty -m "chore: verify timezone migration complete — all endpoints use user timezone"
```
