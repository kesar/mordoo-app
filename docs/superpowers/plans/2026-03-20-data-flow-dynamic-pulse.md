# Data Flow & Dynamic Pulse Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded Pulse screen data with dynamically computed daily readings, served from a Vercel Next.js API for account users and computed locally for guests.

**Architecture:** Shared pure-function algorithm (`shared/compute-reading.ts`) used by both the Next.js API and React Native client. Account users hit `/api/pulse/daily` which caches results in Supabase. Guest users compute locally. React Query manages client-side caching and loading states.

**Tech Stack:** Next.js (API), Supabase (DB + auth), React Query, Zustand + MMKV, shared TypeScript module

**Spec:** `docs/superpowers/specs/2026-03-20-data-flow-dynamic-pulse-design.md`

---

## Chunk 1: Shared Types & Algorithm

### Task 1: Create shared types

**Files:**
- Create: `shared/types.ts`

- [ ] **Step 1: Create the shared directory and types file**

```bash
mkdir -p shared
```

Create `shared/types.ts`:

```typescript
export interface BirthDataInput {
  userId: string;
  dateOfBirth: string;   // ISO date YYYY-MM-DD
  fullName?: string;
  currentDate: string;   // ISO date YYYY-MM-DD (user's local "today")
}

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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add shared/types.ts
git commit -m "feat: add shared types for daily pulse readings"
```

---

### Task 2: Create insight templates

**Files:**
- Create: `shared/insight-templates.ts`

- [ ] **Step 1: Create insight templates file**

Create `shared/insight-templates.ts`:

```typescript
type Element = 'fire' | 'water' | 'earth' | 'air';
type ScoreRange = 'low' | 'medium' | 'high';

const TEMPLATES: Record<ScoreRange, Record<Element, string[]>> = {
  high: {
    fire: [
      'A powerful day for bold decisions. Your fire energy peaks in the morning — act before noon.',
      'Creative sparks fly today. Channel your intensity into one focused project.',
      'Your confidence radiates today. Others notice — use this for negotiations.',
      'A strong day for leadership. Trust your instincts and move decisively.',
    ],
    water: [
      'Intuition runs deep today. Trust your gut on financial matters.',
      'Emotional clarity arrives. A good day to mend relationships or start new ones.',
      'Your empathy is your superpower today. Listen more than you speak.',
      'Flow with changes today — resistance creates friction, acceptance creates power.',
    ],
    earth: [
      'Stability is your strength today. Build something that lasts.',
      'Practical wisdom guides you. Focus on long-term investments and health.',
      'A grounding day — perfect for organizing, planning, and setting foundations.',
      'Your patience pays off today. Steady progress beats dramatic leaps.',
    ],
    air: [
      'Mental clarity is sharp today. Solve problems that have been lingering.',
      'Communication flows effortlessly. Write, speak, connect — your words carry weight.',
      'Ideas come rapidly today. Capture them before they fade.',
      'A social day — networking and collaboration bring unexpected opportunities.',
    ],
  },
  medium: {
    fire: [
      'Moderate energy today. Pace yourself and save your fire for what matters most.',
      'A balanced day ahead. Small, consistent actions beat grand gestures.',
      'Guard your energy after 6pm. The morning is your window of power.',
      'Mixed signals today — verify before you trust. Your instincts need a second opinion.',
    ],
    water: [
      'Emotions may fluctuate. Stay centered and avoid reactive decisions.',
      'A reflective day. Journal or meditate to find clarity beneath the surface.',
      'Water energy is gentle today. Go with the current, not against it.',
      'Sensitivity is heightened. Choose your company wisely today.',
    ],
    earth: [
      'Steady as she goes. Nothing dramatic, but quiet progress is still progress.',
      'A maintenance day — tend to what you have before seeking something new.',
      'Routine serves you well today. Find comfort in the familiar.',
      'Practical matters need attention. Handle the small things before they grow.',
    ],
    air: [
      'Thoughts may scatter today. Write lists, set reminders, stay organized.',
      'Communication needs extra care. Re-read messages before sending.',
      'A neutral day for air energy. Neither inspired nor blocked — just steady.',
      'Seek quiet spaces today. Too much noise disrupts your thinking.',
    ],
  },
  low: {
    fire: [
      'Low fire energy today. Rest and recharge — tomorrow brings renewal.',
      'Not your day for confrontation. Retreat, plan, and prepare for a stronger tomorrow.',
      'Energy dips in the afternoon. Schedule important tasks for morning only.',
      'A cooling period. Your fire needs fuel — eat well, sleep early, reset.',
    ],
    water: [
      'Emotional fog today. Avoid major decisions until clarity returns.',
      'Low tide energy. Withdraw inward and nurture yourself before giving to others.',
      'Sensitivity is raw today. Protect your peace and say no when needed.',
      'A quiet day for reflection. Not every day needs action.',
    ],
    earth: [
      'Foundations feel shaky today. Focus on self-care, not building.',
      'Slow down. Your body is asking for rest, not productivity.',
      'A day to simplify. Remove one unnecessary burden from your life.',
      'Grounding energy is scattered. Walk barefoot, touch nature, reconnect.',
    ],
    air: [
      'Mental fog rolls in. Postpone complex decisions if you can.',
      'Overthinking is the enemy today. Trust what you already know.',
      'Communication may be misread. Keep messages short and clear.',
      'A day to listen rather than speak. Wisdom hides in silence.',
    ],
  },
};

export function getElement(birthMonth: number): Element {
  if (birthMonth >= 1 && birthMonth <= 3) return 'water';
  if (birthMonth >= 4 && birthMonth <= 6) return 'fire';
  if (birthMonth >= 7 && birthMonth <= 9) return 'earth';
  return 'air';
}

export function getScoreRange(score: number): ScoreRange {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function selectInsight(
  score: number,
  birthMonth: number,
  seedValue: number,
): string {
  const element = getElement(birthMonth);
  const range = getScoreRange(score);
  const pool = TEMPLATES[range][element];
  return pool[seedValue % pool.length];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add shared/insight-templates.ts
git commit -m "feat: add insight text templates for daily readings"
```

---

### Task 3: Create the deterministic reading algorithm

**Files:**
- Create: `shared/compute-reading.ts`

- [ ] **Step 1: Create the compute-reading module**

Create `shared/compute-reading.ts`:

```typescript
import type { BirthDataInput, DailyPulseResponse } from './types';
import { getElement, selectInsight } from './insight-templates';

// Simple string hash → unsigned 32-bit integer
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

// Seeded pseudo-random: returns 0..max-1
function seededRandom(seed: number, offset: number, max: number): number {
  const combined = hashCode(`${seed}-${offset}`);
  return combined % max;
}

// Life path number: sum digits of birth date recursively to single digit
function lifePathNumber(dateOfBirth: string): number {
  const digits = dateOfBirth.replace(/-/g, '');
  let sum = 0;
  for (const d of digits) {
    sum += parseInt(d, 10);
  }
  while (sum > 9 && sum !== 11 && sum !== 22) {
    let newSum = 0;
    for (const d of String(sum)) {
      newSum += parseInt(d, 10);
    }
    sum = newSum;
  }
  return sum;
}

// Name number: Pythagorean system (A=1..I=9, J=1..R=9, S=1..Z=8)
function nameNumber(fullName: string): number {
  const map: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  let sum = 0;
  for (const ch of fullName.toLowerCase()) {
    if (map[ch]) sum += map[ch];
  }
  while (sum > 9) {
    let newSum = 0;
    for (const d of String(sum)) {
      newSum += parseInt(d, 10);
    }
    sum = newSum;
  }
  return sum;
}

const LUCKY_COLORS = [
  { name: 'Gold', hex: '#c9a84c' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Sapphire', hex: '#2563eb' },
  { name: 'Emerald', hex: '#16a34a' },
  { name: 'Amethyst', hex: '#9333ea' },
  { name: 'Ivory', hex: '#fefce8' },
  { name: 'Coral', hex: '#fb7185' },
  { name: 'Jade', hex: '#059669' },
  { name: 'Silver', hex: '#94a3b8' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Indigo', hex: '#4f46e5' },
] as const;

const DIRECTIONS = [
  'North', 'Northeast', 'East', 'Southeast',
  'South', 'Southwest', 'West', 'Northwest',
] as const;

export function computeReading(input: BirthDataInput): DailyPulseResponse {
  const lifePath = lifePathNumber(input.dateOfBirth);
  const namNum = input.fullName ? nameNumber(input.fullName) : 5;
  const dailySeed = hashCode(`${input.userId}:${input.currentDate}`);

  // Energy score: base from life path, modulated by daily seed and name number
  const baseScore = ((lifePath * 7 + dailySeed) % 41) + 40; // 40-80
  const nameModifier = ((namNum * 3 + dailySeed) % 21) - 10; // -10 to +10
  const energyScore = Math.max(0, Math.min(100, baseScore + nameModifier));

  // Sub-scores: vary ±15 around energy score
  const business = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 1, 31) - 15));
  const heart = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 2, 31) - 15));
  const body = Math.max(0, Math.min(100,
    energyScore + seededRandom(dailySeed, 3, 31) - 15));

  // Lucky color: based on birth month element + daily offset
  const birthMonth = parseInt(input.dateOfBirth.split('-')[1], 10);
  const colorIndex = (birthMonth + seededRandom(dailySeed, 4, 12)) % LUCKY_COLORS.length;
  const luckyColor = { name: LUCKY_COLORS[colorIndex].name, hex: LUCKY_COLORS[colorIndex].hex };

  // Lucky number: life path + daily offset, 1-9
  const luckyNumber = ((lifePath + seededRandom(dailySeed, 5, 9)) % 9) + 1;

  // Lucky direction: element-based + daily offset
  const dirIndex = (birthMonth + seededRandom(dailySeed, 6, 8)) % DIRECTIONS.length;
  const luckyDirection = DIRECTIONS[dirIndex];

  // Insight text
  const insight = selectInsight(energyScore, birthMonth, seededRandom(dailySeed, 7, 100));

  return {
    date: input.currentDate,
    energyScore,
    insight,
    luckyColor,
    luckyNumber,
    luckyDirection,
    subScores: { business, heart, body },
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add shared/compute-reading.ts
git commit -m "feat: add deterministic reading computation algorithm"
```

---

## Chunk 2: Next.js API Project

### Task 4: Scaffold Next.js API project

**Files:**
- Create: `api/package.json`
- Create: `api/tsconfig.json`
- Create: `api/vercel.json`
- Create: `api/src/lib/supabase.ts`
- Create: `api/.env.local`

- [ ] **Step 1: Create API project structure**

```bash
mkdir -p api/src/lib api/src/app/api/pulse/daily
```

Create `api/package.json`:

```json
{
  "name": "mordoo-api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.99.3",
    "next": "^15.3.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.15.0",
    "@types/react": "^19.2.0",
    "typescript": "^5.8.0"
  }
}
```

Create `api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@shared/*": ["../shared/*"]
    },
    "baseUrl": "."
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "../shared/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `api/vercel.json`:

```json
{
  "framework": "nextjs"
}
```

Create `api/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export function createAuthClient(token: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}
```

Create `api/.env.local`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 2: Install API dependencies**

```bash
cd api && npm install && cd ..
```

- [ ] **Step 3: Verify API TypeScript compiles**

```bash
cd api && npx tsc --noEmit && cd ..
```

- [ ] **Step 4: Add api/.env.local to root .gitignore**

Verify `.gitignore` has `.env*.local` pattern (it does — covers all subdirectories). If not, add `api/.env.local`.

- [ ] **Step 5: Commit**

```bash
git add api/package.json api/package-lock.json api/tsconfig.json api/vercel.json api/src/lib/supabase.ts
git commit -m "feat: scaffold Next.js API project for Vercel"
```

---

### Task 5: Create daily pulse API endpoint

**Files:**
- Create: `api/src/app/api/pulse/daily/route.ts`

- [ ] **Step 1: Create the route handler**

Create `api/src/app/api/pulse/daily/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createAuthClient } from '../../../../lib/supabase';
import { computeReading } from '@shared/compute-reading';

export async function GET(request: NextRequest) {
  // 1. Extract and validate token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }
  const token = authHeader.slice(7);

  // 2. Get user from token
  const authClient = createAuthClient(token);
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 3. Get date parameter
  const date = request.nextUrl.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // 4. Check cache
  const { data: cached } = await serviceClient
    .from('daily_readings')
    .select('*')
    .eq('user_id', user.id)
    .eq('reading_date', date)
    .single();

  if (cached) {
    return NextResponse.json({
      date: cached.reading_date,
      energyScore: cached.energy_score,
      insight: cached.insight,
      luckyColor: { name: cached.lucky_color_name, hex: cached.lucky_color_hex },
      luckyNumber: cached.lucky_number,
      luckyDirection: cached.lucky_direction,
      subScores: {
        business: cached.sub_score_business,
        heart: cached.sub_score_heart,
        body: cached.sub_score_body,
      },
    });
  }

  // 5. Fetch birth data
  const { data: birthData, error: birthError } = await serviceClient
    .from('birth_data')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (birthError || !birthData) {
    return NextResponse.json({ error: 'No birth data found' }, { status: 404 });
  }

  // 6. Compute reading
  const reading = computeReading({
    userId: user.id,
    dateOfBirth: birthData.date_of_birth,
    fullName: birthData.full_name ?? undefined,
    currentDate: date,
  });

  // 7. Cache result
  await serviceClient.from('daily_readings').insert({
    user_id: user.id,
    reading_date: date,
    energy_score: reading.energyScore,
    insight: reading.insight,
    lucky_color_name: reading.luckyColor.name,
    lucky_color_hex: reading.luckyColor.hex,
    lucky_number: reading.luckyNumber,
    lucky_direction: reading.luckyDirection,
    sub_score_business: reading.subScores.business,
    sub_score_heart: reading.subScores.heart,
    sub_score_body: reading.subScores.body,
  });

  // 8. Return reading
  return NextResponse.json(reading);
}
```

- [ ] **Step 2: Create a Next.js layout to satisfy App Router**

Create `api/src/app/layout.tsx`:

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}
```

Create `api/src/app/page.tsx`:

```typescript
export default function Home() {
  return <p>Mordoo API</p>;
}
```

- [ ] **Step 3: Verify API builds**

```bash
cd api && npx tsc --noEmit && cd ..
```

- [ ] **Step 4: Commit**

```bash
git add api/src/app/
git commit -m "feat: add daily pulse API endpoint with caching"
```

---

## Chunk 3: React Native Client Integration

### Task 6: Add API base URL to environment

**Files:**
- Modify: `.env.local`
- Modify: `tsconfig.json`

- [ ] **Step 1: Add API URL to .env.local**

Add to `.env.local`:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

- [ ] **Step 2: Add shared path alias to tsconfig.json**

In `tsconfig.json`, add to the `paths` object:

```json
"paths": {
  "@/*": ["./*"],
  "@shared/*": ["./shared/*"]
}
```

Also add `"shared/**/*.ts"` to the `include` array if it's not already covered by the existing glob.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json
git commit -m "feat: add shared path alias and API base URL config"
```

---

### Task 7: Create birth data sync service

**Files:**
- Create: `src/services/birth-data.ts`

- [ ] **Step 1: Create the birth data sync service**

Create `src/services/birth-data.ts`:

```typescript
import { supabase } from '@/src/lib/supabase';
import type { BirthData, NameData } from '@/src/stores/onboardingStore';
import type { Concern } from '@/src/stores/onboardingStore';

interface SyncParams {
  birthData: BirthData;
  nameData: NameData | null;
  concerns: Concern[];
  urgencyContext: string | null;
}

export async function syncBirthData(params: SyncParams) {
  const { birthData, nameData, concerns, urgencyContext } = params;

  const timeStr = birthData.timeOfBirth
    ? `${String(birthData.timeOfBirth.hour).padStart(2, '0')}:${String(birthData.timeOfBirth.minute).padStart(2, '0')}:00`
    : null;

  const { error } = await supabase.from('birth_data').upsert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    date_of_birth: birthData.dateOfBirth,
    time_of_birth: timeStr,
    time_approximate: birthData.timeApproximate,
    place_name: birthData.placeOfBirth.name,
    latitude: birthData.placeOfBirth.latitude,
    longitude: birthData.placeOfBirth.longitude,
    country: birthData.placeOfBirth.country,
    gender: birthData.gender ?? null,
    full_name: nameData?.fullName ?? null,
    phone_number: nameData?.phoneNumber ?? null,
    car_plate: nameData?.carPlate ?? null,
    concerns,
    urgency_context: urgencyContext,
  });

  if (error) throw error;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Note: The `Concern` type needs to be exported from `onboardingStore.ts`. If it's not exported, add `export` before its type declaration.

- [ ] **Step 3: Commit**

```bash
git add src/services/birth-data.ts
git commit -m "feat: add birth data sync service for Supabase"
```

---

### Task 8: Create daily pulse service and hook

**Files:**
- Create: `src/services/pulse.ts`
- Create: `src/hooks/useDailyPulse.ts`

- [ ] **Step 1: Create the pulse API service**

Create `src/services/pulse.ts`:

```typescript
import { supabase } from '@/src/lib/supabase';
import type { DailyPulseResponse } from '@shared/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function fetchDailyPulse(): Promise<DailyPulseResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const response = await fetch(
    `${API_BASE_URL}/api/pulse/daily?date=${today}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );

  if (!response.ok) {
    throw new Error(`Pulse API error: ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 2: Create the useDailyPulse hook**

Create `src/hooks/useDailyPulse.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { fetchDailyPulse } from '@/src/services/pulse';
import { computeReading } from '@shared/compute-reading';
import type { DailyPulseResponse } from '@shared/types';

function computeLocalReading(
  userId: string,
  birthData: { dateOfBirth: string },
  fullName?: string,
): DailyPulseResponse {
  const today = new Date().toISOString().split('T')[0];
  return computeReading({
    userId,
    dateOfBirth: birthData.dateOfBirth,
    fullName,
    currentDate: today,
  });
}

export function useDailyPulse() {
  const authMode = useAuthStore((s) => s.authMode);
  const userId = useAuthStore((s) => s.userId);
  const birthData = useOnboardingStore((s) => s.birthData);
  const nameData = useOnboardingStore((s) => s.nameData);
  const today = new Date().toISOString().split('T')[0];

  return useQuery<DailyPulseResponse>({
    queryKey: ['dailyPulse', userId, today],
    queryFn: async () => {
      // Guest users: compute locally
      if (authMode === 'guest') {
        if (!birthData) throw new Error('No birth data available');
        return computeLocalReading(userId!, birthData, nameData?.fullName);
      }

      // Account users: try API, fall back to local
      try {
        return await fetchDailyPulse();
      } catch {
        if (birthData) {
          return computeLocalReading(userId!, birthData, nameData?.fullName);
        }
        throw new Error('No pulse data available');
      }
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    enabled: !!userId && !!birthData,
  });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/services/pulse.ts src/hooks/useDailyPulse.ts
git commit -m "feat: add daily pulse service and React Query hook"
```

---

### Task 9: Add birth data sync to onboarding completion

**Files:**
- Modify: `app/(onboarding)/soul-snapshot.tsx`

- [ ] **Step 1: Add birth data sync to handleEnterRealms**

In `app/(onboarding)/soul-snapshot.tsx`:

Add import at the top:

```typescript
import { syncBirthData } from '@/src/services/birth-data';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
```

Note: `useOnboardingStore` is already imported. Only add `syncBirthData`.

Inside the component, add selectors for birth data:

```typescript
const birthData = useOnboardingStore((s) => s.birthData);
const nameData = useOnboardingStore((s) => s.nameData);
const concerns = useOnboardingStore((s) => s.concerns);
const urgencyContext = useOnboardingStore((s) => s.urgencyContext);
```

Update `handleEnterRealms` to sync birth data for account users:

```typescript
const handleEnterRealms = async () => {
  completeOnboarding();
  if (!authMode) {
    setGuestAuth();
  } else if (authMode === 'account' && birthData) {
    // Sync birth data to Supabase in background — don't block navigation
    syncBirthData({ birthData, nameData, concerns, urgencyContext }).catch(() => {
      // Silent fail — will retry on next app launch or can use local computation
    });
  }
  router.replace('/(main)/pulse');
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/soul-snapshot.tsx
git commit -m "feat: sync birth data to Supabase on onboarding completion"
```

---

### Task 10: Update Pulse screen with real data

**Files:**
- Modify: `app/(main)/pulse/index.tsx`

- [ ] **Step 1: Replace hardcoded data with useDailyPulse hook**

In `app/(main)/pulse/index.tsx`:

Add imports:

```typescript
import { useDailyPulse } from '@/src/hooks/useDailyPulse';
import { ActivityIndicator } from 'react-native';
```

Inside the `PulseScreen` component, add the hook call:

```typescript
const { data: pulse, isLoading, error, refetch } = useDailyPulse();
```

Remove these hardcoded constants (delete entirely):
- `LUCKY_ELEMENTS`
- `POWER_WINDOWS`
- `COSMIC_INSIGHTS`

Keep these constants (decorative):
- `STARS`
- `LINES`

**Replace the Energy Score section** — change the hardcoded `score={73}` to use `pulse?.energyScore ?? 0`:

```tsx
<EnergyScoreRing
  score={pulse?.energyScore ?? 0}
  size={192}
  label="Prana Index"
/>
```

Replace the hardcoded insight text with `pulse?.insight`.

**Replace the Lucky Elements section** with dynamic data:

```tsx
{pulse && (
  <View style={styles.luckyGrid}>
    <LuckyCard
      iconType="color"
      label="Lucky Color"
      value={pulse.luckyColor.name}
      colorHex={pulse.luckyColor.hex}
    />
    <LuckyCard
      iconType="number"
      label="Lucky Number"
      value={String(pulse.luckyNumber)}
    />
    <LuckyCard
      iconType="direction"
      label="Lucky Direction"
      value={pulse.luckyDirection}
    />
  </View>
)}
```

**Replace the sub-scores** in the Energy Score card (if displayed) with `pulse?.subScores`.

**Add loading state** — wrap the main content below the star map:

```tsx
{isLoading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
    <Text style={styles.loadingText}>Reading the stars...</Text>
  </View>
) : error && !pulse ? (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>Could not read your pulse today</Text>
    <GoldButton title="Try Again" onPress={() => refetch()} variant="outlined" />
  </View>
) : (
  /* existing content sections using pulse data */
)}
```

Add loading/error styles:

```typescript
loadingContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 80,
  gap: 16,
},
loadingText: {
  fontFamily: fonts.body.regular,
  fontSize: fontSizes.lg,
  color: colors.onSurfaceVariant,
  fontStyle: 'italic',
},
errorContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 80,
  gap: 20,
},
errorText: {
  fontFamily: fonts.body.regular,
  fontSize: fontSizes.lg,
  color: colors.onSurfaceVariant,
  textAlign: 'center',
},
```

**Remove the Power Windows and Cosmic Insights sections entirely** (V2 features).

**Update the star map date display** to show today's date instead of hardcoded "12 OCT 2024":

```typescript
const today = new Date();
const dateStr = today.toLocaleDateString('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).toUpperCase();
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add app/(main)/pulse/index.tsx
git commit -m "feat: update Pulse screen with dynamic daily readings"
```

---

## Chunk 4: Database & Documentation

### Task 11: Update Supabase setup docs with new tables

**Files:**
- Modify: `docs/supabase-setup.md`

- [ ] **Step 1: Add birth_data and daily_readings table migrations**

Append to `docs/supabase-setup.md` after the existing profiles migration:

```markdown
## 5. Run Birth Data Migration

In Supabase Dashboard → SQL Editor, run:

\`\`\`sql
CREATE TABLE public.birth_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,
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
\`\`\`

## 6. Run Daily Readings Cache Migration

\`\`\`sql
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
\`\`\`

## 7. Vercel API Deployment

1. Create a new Vercel project pointing to the `api/` directory
2. Set the root directory to `api/` in Vercel project settings
3. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy
5. Update `.env.local` in the React Native project:
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-vercel-deployment.vercel.app
   ```
```

- [ ] **Step 2: Commit**

```bash
git add docs/supabase-setup.md
git commit -m "docs: add birth_data and daily_readings migrations and Vercel setup"
```

---

### Task 12: Export Concern type and verify full build

**Files:**
- Modify: `src/stores/onboardingStore.ts` (if Concern type is not exported)

- [ ] **Step 1: Ensure Concern type is exported**

In `src/stores/onboardingStore.ts`, check if `Concern` type has an `export` keyword. If not, add it:

```typescript
export type Concern = 'love' | 'career' | 'money' | 'health' | 'family' | 'spiritual';
```

- [ ] **Step 2: Final TypeScript verification**

Run: `npx tsc --noEmit`

Verify zero errors across the entire project.

- [ ] **Step 3: Rebuild native project and test**

```bash
npx expo prebuild --clean
```

Then build and run:

```bash
xcodebuild -workspace ios/mordoo.xcworkspace -scheme MorDoo -configuration Debug -destination 'platform=iOS Simulator,id=7D79EFAD-9822-47F0-A34B-F98674A1E1D8' -derivedDataPath ios/build build
```

Install and launch:

```bash
xcrun simctl install 7D79EFAD-9822-47F0-A34B-F98674A1E1D8 ios/build/Build/Products/Debug-iphonesimulator/MorDoo.app
xcrun simctl launch 7D79EFAD-9822-47F0-A34B-F98674A1E1D8 ai.mordoo.app
```

Verify the Pulse screen shows:
- Loading state briefly (or local computation for guest)
- Energy Score ring with computed value
- Lucky Color, Number, Direction cards
- Insight text
- No Power Windows or Cosmic Insights sections

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A ':!ios' ':!android' ':!.env.local' ':!api/.env.local'
git commit -m "feat: complete data flow and dynamic pulse integration"
```
