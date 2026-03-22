# Sub-Score Archetype + Momentum Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat sub-score calculation in `computeReading` with personality-based profile weights and 3-day momentum, so business/heart/body scores diverge meaningfully per user.

**Architecture:** Extract helper functions (`profileWeights`, `computeEnergyScore`, `computeBaseSubScore`, `subtractDays`, `momentum`) inside `shared/compute-reading.ts`. The public API (`computeReading` signature and return type) is unchanged. All new logic is internal to the file.

**Tech Stack:** TypeScript, vitest (new dev dependency for testing pure shared logic)

**Spec:** `docs/superpowers/specs/2026-03-22-sub-score-archetype-design.md`

**Note:** Sub-score values will change for existing users after deployment. Since readings are computed on-the-fly (not cached in DB), this is acceptable — users see new scores on their next visit. The `computeEnergyScore` helper takes pre-computed `lifePath`/`namNum` primitives rather than the full `BirthDataInput` (differs from spec) to avoid recomputing them 12 times during momentum lookback.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `shared/compute-reading.ts` | Modify | Add `profileWeights`, `computeEnergyScore`, `computeBaseSubScore`, `subtractDays`, `momentum` helpers; rewrite sub-score section of `computeReading` |
| `shared/__tests__/compute-reading.test.ts` | Create | Tests for all new helpers and integration test for `computeReading` sub-scores |
| `vitest.config.ts` | Create | Minimal vitest config for shared/ tests |
| `package.json` | Modify | Add `vitest` dev dependency and `test` script |

---

## Chunk 1: Test Setup + Profile Weights

### Task 1: Add vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['shared/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs (no tests yet)**

Run: `npm test`
Expected: "No test files found" or similar — confirms vitest is wired up.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for shared module tests"
```

---

### Task 2: Extract `computeEnergyScore` helper

**Files:**
- Modify: `shared/compute-reading.ts:89-97`
- Create: `shared/__tests__/compute-reading.test.ts`

- [ ] **Step 1: Write the failing test**

Create `shared/__tests__/compute-reading.test.ts` (create the `__tests__` directory if it doesn't exist):

```typescript
import { describe, it, expect } from 'vitest';
import { computeReading } from '../compute-reading';

const BASE_INPUT = {
  userId: 'test-user-1',
  dateOfBirth: '1990-06-15',
  fullName: 'John Smith',
  currentDate: '2026-03-22',
};

describe('computeReading', () => {
  it('returns deterministic results for the same input', () => {
    const a = computeReading(BASE_INPUT);
    const b = computeReading(BASE_INPUT);
    expect(a).toEqual(b);
  });

  it('energyScore is between 0 and 100', () => {
    const result = computeReading(BASE_INPUT);
    expect(result.energyScore).toBeGreaterThanOrEqual(0);
    expect(result.energyScore).toBeLessThanOrEqual(100);
  });
});
```

- [ ] **Step 2: Run test to verify it passes (existing code works)**

Run: `npx vitest run`
Expected: PASS — this confirms the test setup works with the existing code.

- [ ] **Step 3: Extract `computeEnergyScore` helper**

In `shared/compute-reading.ts`, extract lines 94-97 into a helper. The helper takes `lifePath`, `namNum`, and `dailySeed`:

```typescript
function computeEnergyScore(lifePath: number, namNum: number, dailySeed: number): number {
  const baseScore = ((lifePath * 7 + dailySeed) % 41) + 40;
  const nameModifier = ((namNum * 3 + dailySeed) % 21) - 10;
  return Math.max(0, Math.min(100, baseScore + nameModifier));
}
```

Update `computeReading` to call: `const energyScore = computeEnergyScore(lifePath, namNum, dailySeed);`

- [ ] **Step 4: Run tests to verify refactor is safe**

Run: `npx vitest run`
Expected: PASS — same output, just refactored.

- [ ] **Step 5: Commit**

```bash
git add shared/compute-reading.ts shared/__tests__/compute-reading.test.ts
git commit -m "refactor: extract computeEnergyScore helper, add initial tests"
```

---

### Task 3: Implement `profileWeights`

**Files:**
- Modify: `shared/compute-reading.ts`
- Modify: `shared/__tests__/compute-reading.test.ts`

- [ ] **Step 1: Write failing tests for profileWeights**

Add to the test file:

```typescript
// We need to export profileWeights for testing — add 'export' in compute-reading.ts
import { profileWeights } from '../compute-reading';

describe('profileWeights', () => {
  it('weights average to 1.0', () => {
    const w = profileWeights(4, 8, 23, 3);
    const avg = (w.business + w.heart + w.body) / 3;
    expect(avg).toBeCloseTo(1.0, 5);
  });

  it('all weights are between 0.63 and 1.45', () => {
    // Theoretical extremes: one weight at 1.3, others at 0.7 → 1.3/0.9=1.444, 0.7/1.1=0.636
    const cases = [
      [1, 1, 1, 1], [9, 9, 31, 12], [5, 5, 15, 6],
      [1, 9, 28, 11], [9, 1, 1, 1], [4, 8, 23, 3],
    ] as const;
    for (const [lp, nn, bd, bm] of cases) {
      const w = profileWeights(lp, nn, bd, bm);
      expect(w.business).toBeGreaterThanOrEqual(0.63);
      expect(w.business).toBeLessThanOrEqual(1.45);
      expect(w.heart).toBeGreaterThanOrEqual(0.63);
      expect(w.heart).toBeLessThanOrEqual(1.45);
      expect(w.body).toBeGreaterThanOrEqual(0.63);
      expect(w.body).toBeLessThanOrEqual(1.45);
    }
  });

  it('different birth data produces different shapes', () => {
    const a = profileWeights(4, 8, 23, 3);
    const b = profileWeights(1, 6, 7, 11);
    // At least one weight should differ by > 0.1
    const diffs = [
      Math.abs(a.business - b.business),
      Math.abs(a.heart - b.heart),
      Math.abs(a.body - b.body),
    ];
    expect(Math.max(...diffs)).toBeGreaterThan(0.1);
  });

  it('reduces master numbers (11→2, 22→4)', () => {
    const w11 = profileWeights(11, 5, 15, 6);
    const w2 = profileWeights(2, 5, 15, 6);
    // Master number 11 reduces to 2 (standard numerological reduction)
    expect(w11).toEqual(w2);

    const w22 = profileWeights(22, 5, 15, 6);
    const w4 = profileWeights(4, 5, 15, 6);
    expect(w22).toEqual(w4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — `profileWeights` is not exported / doesn't exist.

- [ ] **Step 3: Implement `profileWeights`**

Add to `shared/compute-reading.ts` (exported for testing):

```typescript
export function profileWeights(
  lifePath: number, namNum: number, birthDay: number, birthMonth: number,
): { business: number; heart: number; body: number } {
  const lp = lifePath === 11 ? 2 : lifePath === 22 ? 4 : lifePath;

  const rawBusiness = namNum + (birthDay % 10);
  const rawHeart    = birthMonth + (namNum * 2 % 7);
  const rawBody     = lp + (birthMonth % 5) + (birthDay % 4);

  const normalize = (raw: number) => 0.7 + ((raw - 1) / 17) * 0.6;

  const weights = [normalize(rawBusiness), normalize(rawHeart), normalize(rawBody)];
  const avg = (weights[0] + weights[1] + weights[2]) / 3;
  return {
    business: weights[0] / avg,
    heart:    weights[1] / avg,
    body:     weights[2] / avg,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add shared/compute-reading.ts shared/__tests__/compute-reading.test.ts
git commit -m "feat: add profileWeights function with birth data personality archetype"
```

---

## Chunk 2: Momentum + Integration

### Task 4: Implement `subtractDays` and `momentum` helpers

**Files:**
- Modify: `shared/compute-reading.ts`
- Modify: `shared/__tests__/compute-reading.test.ts`

- [ ] **Step 1: Write failing tests**

Add to the test file:

```typescript
import { subtractDays, momentum } from '../compute-reading';

describe('subtractDays', () => {
  it('subtracts days within a month', () => {
    expect(subtractDays('2026-03-22', 1)).toBe('2026-03-21');
    expect(subtractDays('2026-03-22', 3)).toBe('2026-03-19');
  });

  it('handles month boundary', () => {
    expect(subtractDays('2026-03-01', 1)).toBe('2026-02-28');
  });

  it('handles year boundary', () => {
    expect(subtractDays('2026-01-01', 1)).toBe('2025-12-31');
  });

  it('handles leap year', () => {
    expect(subtractDays('2024-03-01', 1)).toBe('2024-02-29');
  });
});

describe('momentum', () => {
  it('returns 0 for flat scores', () => {
    expect(momentum(50, 50, 50, 50)).toBe(0);
  });

  it('returns positive for rising scores', () => {
    const result = momentum(70, 60, 50, 40);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('returns negative for falling scores', () => {
    const result = momentum(40, 50, 60, 70);
    expect(result).toBeLessThan(0);
    expect(result).toBeGreaterThanOrEqual(-1);
  });

  it('computes correct value for known inputs', () => {
    // diff1=10, diff2=5, diff3=0 → weighted = (30+10+0)/6 = 6.67 → /15 = 0.444
    expect(momentum(60, 50, 45, 45)).toBeCloseTo(0.444, 2);
  });

  it('clamps to -1..1 range', () => {
    expect(momentum(100, 0, 0, 0)).toBeLessThanOrEqual(1);
    expect(momentum(0, 100, 100, 100)).toBeGreaterThanOrEqual(-1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — functions not exported / don't exist.

- [ ] **Step 3: Implement both helpers**

Add to `shared/compute-reading.ts` (exported for testing):

```typescript
export function subtractDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function momentum(today: number, day1: number, day2: number, day3: number): number {
  const diff1 = today - day1;
  const diff2 = day1 - day2;
  const diff3 = day2 - day3;
  const weightedTrend = (diff1 * 3 + diff2 * 2 + diff3 * 1) / 6;
  return Math.max(-1, Math.min(1, weightedTrend / 15));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add shared/compute-reading.ts shared/__tests__/compute-reading.test.ts
git commit -m "feat: add subtractDays and momentum helpers"
```

---

### Task 5: Wire up sub-score calculation in `computeReading`

**Files:**
- Modify: `shared/compute-reading.ts:89-105`
- Modify: `shared/__tests__/compute-reading.test.ts`

- [ ] **Step 1: Write failing tests for new sub-score behavior**

Add to the test file:

```typescript
describe('computeReading sub-scores', () => {
  it('sub-scores are between 0 and 100', () => {
    // Test across many dates and users
    const users = ['user-a', 'user-b', 'user-c'];
    const dates = ['2026-01-01', '2026-06-15', '2026-12-31'];
    for (const userId of users) {
      for (const currentDate of dates) {
        const result = computeReading({
          userId,
          dateOfBirth: '1990-06-15',
          fullName: 'Test User',
          currentDate,
        });
        expect(result.subScores.business).toBeGreaterThanOrEqual(0);
        expect(result.subScores.business).toBeLessThanOrEqual(100);
        expect(result.subScores.heart).toBeGreaterThanOrEqual(0);
        expect(result.subScores.heart).toBeLessThanOrEqual(100);
        expect(result.subScores.body).toBeGreaterThanOrEqual(0);
        expect(result.subScores.body).toBeLessThanOrEqual(100);
      }
    }
  });

  it('different users get different profile shapes', () => {
    // Users with different birth data should have different sub-score ratios
    const userA = computeReading({
      userId: 'user-a',
      dateOfBirth: '1990-03-23',
      fullName: 'Alice Johnson',
      currentDate: '2026-03-22',
    });
    const userB = computeReading({
      userId: 'user-b',
      dateOfBirth: '1985-11-07',
      fullName: 'Bob Williams',
      currentDate: '2026-03-22',
    });

    // Compare the relative ordering — at least one pair should differ
    const ratioA = userA.subScores.business / (userA.subScores.heart || 1);
    const ratioB = userB.subScores.business / (userB.subScores.heart || 1);
    expect(ratioA).not.toBeCloseTo(ratioB, 1);
  });

  it('sub-scores vary across days for the same user', () => {
    const days = ['2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23', '2026-03-24'];
    const scores = days.map(d => computeReading({
      ...BASE_INPUT,
      currentDate: d,
    }).subScores.business);

    // Not all the same
    const unique = new Set(scores);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('user without fullName still gets varied sub-scores', () => {
    const result = computeReading({
      userId: 'test-user-no-name',
      dateOfBirth: '1995-08-20',
      currentDate: '2026-03-22',
    });
    // All three should exist and be valid
    expect(result.subScores.business).toBeGreaterThanOrEqual(0);
    expect(result.subScores.heart).toBeGreaterThanOrEqual(0);
    expect(result.subScores.body).toBeGreaterThanOrEqual(0);
    // At least two should differ (profile weights are not all equal for most inputs)
    const { business, heart, body } = result.subScores;
    const allSame = business === heart && heart === body;
    expect(allSame).toBe(false);
  });

  it('remains deterministic', () => {
    const a = computeReading(BASE_INPUT);
    const b = computeReading(BASE_INPUT);
    expect(a.subScores).toEqual(b.subScores);
  });
});
```

- [ ] **Step 2: Run tests — some will pass, some may fail depending on current code**

Run: `npx vitest run`
Note which tests fail — the "different profile shapes" test is the key one that should start failing more reliably after the change.

- [ ] **Step 3: Implement the new sub-score calculation**

Replace the sub-score section of `computeReading` (lines 99-105). Add `computeBaseSubScore` as an internal helper and wire everything together:

```typescript
// Internal helper — computes one sub-score for a given date WITHOUT momentum
function computeBaseSubScore(
  input: BirthDataInput,
  dateStr: string,
  dimOffset: number,
  weight: number,
  lifePath: number,
  namNum: number,
): number {
  const seed = hashCode(`${input.userId}:${dateStr}`);
  const energy = computeEnergyScore(lifePath, namNum, seed);
  const base = weight * energy;
  const variation = seededRandom(seed, dimOffset, 31) - 15;
  return Math.max(0, Math.min(100, Math.round(base + variation)));
}
```

Then in `computeReading`, replace lines 99-105 with:

```typescript
  const birthDay = parseInt(input.dateOfBirth.split('-')[2], 10);
  const birthMonth = parseInt(input.dateOfBirth.split('-')[1], 10);
  const weights = profileWeights(lifePath, namNum, birthDay, birthMonth);

  // Compute base sub-scores for today and 3 previous days (for momentum)
  const dims = [
    { key: 'business' as const, offset: 1, weight: weights.business },
    { key: 'heart' as const, offset: 2, weight: weights.heart },
    { key: 'body' as const, offset: 3, weight: weights.body },
  ];

  const subScores = { business: 0, heart: 0, body: 0 };

  for (const dim of dims) {
    const todayBase = computeBaseSubScore(input, input.currentDate, dim.offset, dim.weight, lifePath, namNum);
    const day1 = computeBaseSubScore(input, subtractDays(input.currentDate, 1), dim.offset, dim.weight, lifePath, namNum);
    const day2 = computeBaseSubScore(input, subtractDays(input.currentDate, 2), dim.offset, dim.weight, lifePath, namNum);
    const day3 = computeBaseSubScore(input, subtractDays(input.currentDate, 3), dim.offset, dim.weight, lifePath, namNum);

    const trend = momentum(todayBase, day1, day2, day3);
    subScores[dim.key] = Math.max(0, Math.min(100, Math.round(todayBase + trend * 5)));
  }
```

**Important:** The existing code extracts `birthMonth` on line 108 for lucky color/direction. The new code extracts both `birthDay` and `birthMonth` earlier (for `profileWeights`). Remove the duplicate `birthMonth` extraction on line 108 — the lucky color and direction code below it should use the already-extracted `birthMonth` variable.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add shared/compute-reading.ts shared/__tests__/compute-reading.test.ts
git commit -m "feat: replace flat sub-scores with personality archetype + momentum"
```

---

### Task 6: Verify no regressions on non-sub-score fields

**Files:**
- Modify: `shared/__tests__/compute-reading.test.ts`

- [ ] **Step 1: Add regression tests for other reading fields**

```typescript
describe('computeReading non-sub-score fields', () => {
  it('luckyColor has name, nameTh, hex', () => {
    const result = computeReading(BASE_INPUT);
    expect(result.luckyColor.name).toBeTruthy();
    expect(result.luckyColor.nameTh).toBeTruthy();
    expect(result.luckyColor.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('luckyNumber is 1-9', () => {
    const result = computeReading(BASE_INPUT);
    expect(result.luckyNumber).toBeGreaterThanOrEqual(1);
    expect(result.luckyNumber).toBeLessThanOrEqual(9);
  });

  it('luckyDirection is a valid direction', () => {
    const result = computeReading(BASE_INPUT);
    const valid = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    expect(valid).toContain(result.luckyDirection);
  });

  it('insight strings are non-empty', () => {
    const result = computeReading(BASE_INPUT);
    expect(result.insightEn.length).toBeGreaterThan(0);
    expect(result.insightTh.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add shared/__tests__/compute-reading.test.ts
git commit -m "test: add regression tests for non-sub-score reading fields"
```
