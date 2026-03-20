# Sub-project 3: Data Flow & Dynamic Pulse — Design Spec

## Goal

Replace hardcoded Pulse screen data with dynamically computed astrology/numerology readings, served from a Vercel-hosted Next.js API that reads user birth data from Supabase and returns daily personalized readings.

## Architecture

The React Native app collects birth data during onboarding and syncs it to Supabase. When the user opens the Pulse screen, React Query fetches the daily reading from a Next.js API route. The API extracts the user ID from the Supabase JWT, computes Energy Score + Lucky elements using a deterministic algorithm seeded by birth data + current date, caches the result in Supabase, and returns it. Subsequent requests for the same user on the same day return the cached result.

Guest users get readings computed client-side using the identical algorithm (shared `compute-reading.ts` module used by both server and client). When a guest upgrades to an account, their birth data syncs to Supabase.

## Tech Stack

- Next.js API routes on Vercel (backend)
- Supabase (database + Row Level Security)
- React Query (data fetching + caching on client)
- @supabase/supabase-js (server-side Supabase client)

---

## Scope

### In Scope

1. Next.js API project setup (Vercel deployment config)
2. Supabase `birth_data` table for storing onboarding data
3. Supabase `daily_readings` table for caching computed readings
4. `/api/pulse/daily` endpoint — computes and returns daily reading
5. Deterministic reading computation algorithm (shared between server and client)
6. React Native API service layer (`src/services/pulse.ts`)
7. React Query integration for Pulse screen data fetching
8. Updated Pulse screen with real data + loading/error states
9. Onboarding data sync to Supabase on completion
10. Guest-mode client-side computation using shared algorithm

### Out of Scope

- Power Windows (V2)
- Cosmic News / market correlation (V2)
- Real ephemeris / astronomical calculations (V1 uses deterministic pseudo-astrology)
- Push notifications for daily readings (Sub-project later)
- Oracle AI chat (Sub-project 4)
- `daily_readings` table cleanup/retention (future cron job)

---

## Decisions

### Timezone Handling

All daily readings use the **user's local timezone** to determine "today." The client sends its current local date (YYYY-MM-DD) as a query parameter. The API uses this date for cache lookups and as the daily seed. This means a user in Bangkok (UTC+7) at 11pm gets today's reading, not tomorrow's UTC reading.

### Algorithm Sharing

The `compute-reading.ts` module is a pure function with no server dependencies. It lives in a shared location (`shared/compute-reading.ts` at the repo root) and is imported by both the API and the React Native app. This ensures guest→account upgrades don't change the day's reading.

### Star Map Header

The star map constellation visualization and moon phase display remain hardcoded for V1. They are decorative elements, not data-driven. The location and date text will be updated to show the user's birth location and current date from the reading response.

---

## Component Design

### 1. Backend API Project

**Location:** `api/` directory in repo root (separate Next.js project deployed to Vercel)

**Structure:**
```
api/
├── package.json
├── tsconfig.json
├── vercel.json
├── src/
│   ├── app/
│   │   └── api/
│   │       └── pulse/
│   │           └── daily/
│   │               └── route.ts
│   └── lib/
│       └── supabase.ts          (server-side Supabase client)
shared/
├── compute-reading.ts           (deterministic algorithm, used by API + RN)
├── insight-templates.ts         (insight text templates)
└── types.ts                     (DailyPulseResponse, BirthDataInput)
```

### 2. Daily Pulse Endpoint

**Route:** `GET /api/pulse/daily?date=YYYY-MM-DD`

**Auth:** Validates Supabase JWT from Authorization header. Extracts `userId` from the decoded token — never from query params.

**Parameters:**
- `date` (required): The user's local date, used for cache key and daily seed

**Logic:**
1. Decode JWT → extract userId
2. Check `daily_readings` cache for this user + date
3. If cached, return it
4. If not, fetch `birth_data` for user
5. Compute reading using shared `compute-reading.ts`
6. Insert into `daily_readings` cache
7. Return computed reading

**Response shape:**
```typescript
interface DailyPulseResponse {
  date: string;                    // ISO date (YYYY-MM-DD)
  energyScore: number;             // 0-100
  insight: string;                 // Daily insight text
  luckyColor: { name: string; hex: string };
  luckyNumber: number;
  luckyDirection: string;
  subScores: {
    business: number;              // 0-100
    heart: number;                 // 0-100
    body: number;                  // 0-100
  };
}
```

### 3. Deterministic Reading Algorithm

**File:** `shared/compute-reading.ts`

Pure function, no external dependencies. Uses a seeded pseudo-random number generator (based on hash of `userId + birthDate + currentDate`) to produce consistent daily readings.

**Input type:**
```typescript
interface BirthDataInput {
  userId: string;
  dateOfBirth: string;        // ISO date
  fullName?: string;
  currentDate: string;        // ISO date (user's local "today")
}
```

**Algorithm outline:**
1. Compute life path number from birth date (sum digits recursively to single digit)
2. Compute name number from full name using Pythagorean system (if available)
3. Create daily seed = simple hash of `userId + currentDate`
4. Generate base energy score: `(lifePath * 7 + seed) % 41 + 40` → range 40-80, then adjust ±20 based on name number compatibility with day
5. Distribute sub-scores: business/heart/body each vary ±15 from energy score, seeded differently
6. Select lucky color from a palette of 12 mapped to birth month element
7. Select lucky number: `(lifePath + dayOfYear) % 9 + 1`
8. Select lucky direction from 8 compass points mapped to element + daily offset
9. Select insight text from template pool (see below)

**Insight Templates** (`shared/insight-templates.ts`):

~30 template strings organized by score range (low 0-39, medium 40-69, high 70-100) and element (fire/water/earth/air). Example:

```typescript
const TEMPLATES = {
  high: {
    fire: [
      "A powerful day for bold decisions. Your fire energy peaks in the morning — act before noon.",
      "Creative sparks fly today. Channel your intensity into one focused project.",
    ],
    water: [
      "Intuition runs deep today. Trust your gut on financial matters.",
      // ...
    ],
    // ...
  },
  // ...
};
```

Element is derived from birth month: Jan-Mar = Water, Apr-Jun = Fire, Jul-Sep = Earth, Oct-Dec = Air.

### 4. Supabase Tables

**`birth_data` table:**
```sql
CREATE TABLE public.birth_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,              -- stored as HH:MM:00, converted from {hour, minute}
  time_approximate BOOLEAN DEFAULT false,
  place_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  country TEXT,
  gender TEXT,
  full_name TEXT,
  phone_number TEXT,
  car_plate TEXT,
  concerns TEXT[] DEFAULT '{}',
  urgency_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.birth_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own birth data"
  ON public.birth_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birth data"
  ON public.birth_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birth data"
  ON public.birth_data FOR UPDATE USING (auth.uid() = user_id);
```

**`daily_readings` table:**
```sql
CREATE TABLE public.daily_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  energy_score INTEGER NOT NULL CHECK (energy_score BETWEEN 0 AND 100),
  insight TEXT NOT NULL,
  lucky_color_name TEXT NOT NULL,
  lucky_color_hex TEXT NOT NULL,
  lucky_number INTEGER NOT NULL,
  lucky_direction TEXT NOT NULL,
  sub_score_business INTEGER NOT NULL,
  sub_score_heart INTEGER NOT NULL,
  sub_score_body INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reading_date)
);

ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own readings"
  ON public.daily_readings FOR SELECT USING (auth.uid() = user_id);

-- API inserts via service role key (bypasses RLS).
-- This is intentional: the API validates the JWT and only inserts for the authenticated user.
```

### 5. React Native API Layer

**File:** `src/services/pulse.ts`

```typescript
import { supabase } from '@/src/lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function fetchDailyPulse(): Promise<DailyPulseResponse> {
  // Always get a fresh token from Supabase (handles refresh automatically)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const today = new Date().toISOString().split('T')[0]; // user's local date

  const response = await fetch(
    `${API_BASE_URL}/api/pulse/daily?date=${today}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );
  if (!response.ok) throw new Error('Failed to fetch daily pulse');
  return response.json();
}
```

**File:** `src/hooks/useDailyPulse.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/stores/authStore';
import { fetchDailyPulse } from '@/src/services/pulse';
import { computeReading } from '@shared/compute-reading';

export function useDailyPulse() {
  const authMode = useAuthStore((s) => s.authMode);
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: ['dailyPulse', userId, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      if (authMode === 'guest') {
        // Use local computation for guests
        const onboardingData = /* read from onboarding store */;
        return computeReading({ ... });
      }
      return fetchDailyPulse();
    },
    staleTime: 30 * 60 * 1000,   // 30 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    enabled: !!userId,
  });
}
```

### 6. Updated Pulse Screen

The existing `app/(main)/pulse/index.tsx` is updated to:
- Use `useDailyPulse()` hook instead of hardcoded data
- Show a skeleton/shimmer loading state while fetching
- Show an error state with retry button on failure
- Pass real data to existing UI components (EnergyScoreRing, lucky elements, insight card)
- Star map header remains decorative (hardcoded constellation) but updates the date text
- Remove hardcoded `LUCKY_ELEMENTS`, `POWER_WINDOWS`, and `COSMIC_INSIGHTS` constants
- Keep `STARS` and `LINES` arrays (decorative star map)

### 7. Onboarding Data Sync

**File:** `src/services/birth-data.ts`

After onboarding completes (soul-snapshot screen → "Enter the Realms"), if the user is in `account` mode:
- Call `syncBirthData()` that upserts onboarding data to the `birth_data` table
- Converts `timeOfBirth: {hour, minute}` → SQL TIME format: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}:00`
- Converts `dateOfBirth` ISO string → SQL DATE
- This happens once, on first completion
- If it fails, the `useDailyPulse` hook falls back to local computation (same algorithm, same result)

---

## Data Flow Diagram

```
[Onboarding] → collects birth data → [onboardingStore (MMKV)]
                                            │
                                    (account mode)
                                            │
                                            ▼
                                   [syncBirthData()]
                                            │
                                            ▼
                                  [Supabase birth_data]
                                            │
[Pulse Screen] → useDailyPulse() → [GET /api/pulse/daily?date=YYYY-MM-DD]
                                            │
                                            ▼
                              [shared/compute-reading.ts]
                                            │
                                            ▼
                                 [Supabase daily_readings]
                                            │
                                            ▼
                                   [DailyPulseResponse]
                                            │
                                            ▼
                                    [Pulse UI renders]

Guest flow:
[Pulse Screen] → useDailyPulse() → [shared/compute-reading.ts] (local)
                                            │
                                            ▼
                                   [DailyPulseResponse]
```

---

## Error Handling

- **No birth data:** Show the current static/demo data with a prompt to complete onboarding
- **API unreachable:** Fall back to local computation using onboarding store data (same algorithm)
- **Sync failure:** Pulse still works via local computation; sync retries on next app foreground
- **Invalid/expired token:** `supabase.auth.getSession()` auto-refreshes tokens before API call

---

## Environment Variables

**React Native (`.env.local`):**
```
EXPO_PUBLIC_API_BASE_URL=https://mordoo-api.vercel.app
```

**Vercel API (`.env` on Vercel dashboard):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
