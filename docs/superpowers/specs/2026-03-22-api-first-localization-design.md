# API-First Architecture with Localization

## Goal

Move all computation and content to the API so the app can be updated without releasing a new build. Add Thai/English localization to all text content via a `lang` parameter.

## Decision: Guest Mode Removed

Users must sign in before accessing any features. No more local-only computation for guests.

## Languages

English (`en`) and Thai (`th`). API validates `lang` against `['en', 'th']`, defaults to `en` if missing or unsupported.

---

## 1. Daily Pulse API Updates

**Endpoint:** `GET /api/pulse/daily?date=YYYY-MM-DD&lang=th`

### Changes to `shared/insight-templates.ts`

Add Thai translations for all 48 insight sentences. Structure changes from:

```ts
Record<ScoreRange, Record<Element, string[]>>
```

to:

```ts
Record<ScoreRange, Record<Element, { en: string; th: string }[]>>
```

### Changes to `shared/compute-reading.ts`

- `LUCKY_COLORS` gains `nameTh` field (e.g. `{ name: 'Gold', nameTh: 'ทอง', hex: '#c9a84c' }`)
- `DIRECTIONS` becomes array of `{ en: string; th: string }` objects
- `computeReading()` returns both languages for insight, color name, and direction
- Extract duplicate `hashCode()` from `siam-si.ts` into a shared `shared/hash.ts` utility

### Type split: internal vs API response

Two separate types in `shared/types.ts`:

```ts
// Internal bilingual type — used by computeReading() and cache storage
export interface DailyPulseReading {
  date: string;
  energyScore: number;
  insightEn: string;
  insightTh: string;
  luckyColor: { name: string; nameTh: string; hex: string };
  luckyNumber: number;
  luckyDirection: string;
  luckyDirectionTh: string;
  subScores: {
    business: number;
    heart: number;
    body: number;
  };
}

// API response type — monolingual, returned to app
export interface DailyPulseResponse {
  date: string;
  energyScore: number;
  insight: string;
  luckyColor: { name: string; hex: string };
  luckyNumber: number;
  luckyDirection: string;
  subScores: {
    business: number;
    heart: number;
    body: number;
  };
}
```

### Changes to `daily_readings` cache table

Add columns:
- `insight_en` (text) — English insight text
- `insight_th` (text) — Thai insight text
- `lucky_color_name_th` (text) — Thai color name
- `lucky_direction_th` (text) — Thai direction name

Migration strategy: Add `insight_en` as new column, backfill from existing `insight` column (`UPDATE daily_readings SET insight_en = insight`), then drop the old `insight` column. This avoids breaking existing cached rows.

### Changes to API route (`api/src/app/api/pulse/daily/route.ts`)

- Accept `lang` query param (default `en`, validated against `['en', 'th']`)
- Store both languages in cache
- Return localized `DailyPulseResponse`: pick `insight_en` or `insight_th` etc. based on `lang`
- When reading from cache, handle rows where `insight_th` is null (pre-migration): delete stale cache row and recompute
- Localized response shape:

```json
{
  "date": "2026-03-22",
  "energyScore": 72,
  "insight": "คำแนะนำวันนี้...",
  "luckyColor": { "name": "ทอง", "hex": "#c9a84c" },
  "luckyNumber": 7,
  "luckyDirection": "ทิศเหนือ",
  "subScores": { "business": 68, "heart": 75, "body": 70 }
}
```

---

## 2. New Siam Si API

**Endpoint:** `POST /api/oracle/siam-si`

### Request

Empty body (or `{}`). Auth required (Bearer token).

The server derives everything:
- `yearMonth` from current server date
- `drawIndex` from `siam_si_draws_this_month` in `user_quotas` table

The client does NOT send `drawIndex` — this prevents manipulation (e.g., sending `drawIndex: 0` forever to get different sticks without consuming quota).

### Response

```json
{
  "number": 5,
  "fortune": "excellent",
  "titleEn": "Golden Lotus",
  "titleTh": "บัวทอง",
  "meaningEn": "Spiritual and material abundance align...",
  "meaningTh": "ความอุดมสมบูรณ์ทางจิตใจและวัตถุ...",
  "drawsUsed": 3,
  "drawsTotal": 5,
  "drawsRemaining": 2
}
```

Returns both languages always (app picks which to display). Design note: Siam Si data is small and static (title + meaning), so returning both languages avoids an extra param while keeping the response lightweight.

Returns `drawsUsed`, `drawsTotal`, and `drawsRemaining` so the app can show "Draw 3 of 5".

### Error responses

- 401: Missing or invalid auth token
- 429: Quota exceeded (`{ "error": "QUOTA_EXCEEDED", "drawsTotal": 5, "drawsRemaining": 0 }`)

### Server-side quota tracking

Move quota from client-side Zustand to `user_quotas` table:
- Add `siam_si_draws_this_month` (integer, default 0)
- Add `siam_si_last_reset` (date)
- Reset count when month changes (check on each request)
- Increment after successful draw
- Return quota info in response

### Quota limits
- Free tier: 5 draws/month
- Standard tier: unlimited

---

## 3. Oracle Chat Updates

**Endpoint:** `POST /api/oracle/chat` (existing)

### Changes

- Add `lang` field to request body
- Pass language preference to Claude system prompt so it responds in the correct language
- Currently the system prompt already instructs Claude to respond in same language as user message — `lang` param makes this explicit

---

## 4. App-Side Changes

### Remove local computation

- `useDailyPulse.ts`: Remove `computeLocalReading()`, remove guest fallback. Always call `fetchDailyPulse(lang)`.
- `useSiamSi.ts`: Remove `drawSiamSi()` import. Call new API endpoint instead. Remove Zustand quota tracking.
- Remove guest auth mode checks from pulse/siam-si flows.

### Add language parameter

- `fetchDailyPulse(lang: string)`: Add `lang` query param to API call
- New `fetchSiamSiDraw()`: POST to `/api/oracle/siam-si` (no params needed, server derives everything)
- `sendOracleMessage()`: Add `lang` to request body
- Language sourced from `settingsStore.language` (`'en' | 'th'`)

### Siam Si hook refactor

`useSiamSi.ts` changes:
- `performDraw()` calls API instead of local function
- Quota state comes from API response (`drawsUsed`, `drawsTotal`, `drawsRemaining`)
- Remove `oracleStore` Siam Si quota fields (`siamSiThisMonth`, `siamSiLastReset`, `incrementSiamSiQuota`, `checkAndResetQuotas`)
- Shake detection stays client-side, triggers API call

### Clean up oracle quota in Zustand

The oracle chat quota is already enforced server-side (`user_quotas.oracle_questions_today`). Remove the client-side oracle quota tracking from `oracleStore` (`oracleQuestionsToday`, `oracleLastReset`) — the 429 response from the API is sufficient for the app to show quota-exceeded UI.

---

## 5. Files Changed

### Shared (server uses these)
- `shared/types.ts` — split into `DailyPulseReading` (bilingual, internal) and `DailyPulseResponse` (monolingual, API)
- `shared/compute-reading.ts` — bilingual color/direction names, returns `DailyPulseReading`
- `shared/insight-templates.ts` — add Thai translations for all 48 templates
- `shared/hash.ts` — **new file**, extract shared `hashCode()` utility
- `shared/siam-si.ts` — import `hashCode` from `shared/hash.ts` instead of local duplicate

### API
- `api/src/app/api/pulse/daily/route.ts` — accept `lang`, store/return bilingual data, map `DailyPulseReading` to `DailyPulseResponse`
- `api/src/app/api/oracle/siam-si/route.ts` — **new file**, Siam Si endpoint with server-side quota
- `api/src/app/api/oracle/chat/route.ts` — accept `lang` in body

### App
- `src/hooks/useDailyPulse.ts` — remove local fallback, add lang param
- `src/hooks/useSiamSi.ts` — refactor to call API, remove local draw
- `src/services/pulse.ts` — add lang param
- `src/services/oracle.ts` — add lang param, add `fetchSiamSiDraw()`
- `src/stores/oracleStore.ts` — remove Siam Si quota fields and oracle quota fields
- `src/stores/authStore.ts` — remove `setGuestAuth` and `'guest'` auth mode

### Database migration
- `daily_readings`: add `insight_en` (backfill from `insight`), `insight_th`, `lucky_color_name_th`, `lucky_direction_th` columns; drop old `insight` column
- `user_quotas`: add `siam_si_draws_this_month` (integer, default 0), `siam_si_last_reset` (date)

---

## 6. Out of Scope

- Adding more languages beyond EN/TH
- Changing the numerology calculation logic
- UI/UX changes (app already handles displaying the data)
- Push notifications or background refresh
- Removing `shared/` module from the app bundle (server still imports it)
- Oracle chat conversation history (single-message only, pre-existing limitation)
