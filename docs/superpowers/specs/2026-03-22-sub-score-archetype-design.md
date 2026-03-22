# Sub-Score Archetype + Momentum Design

## Problem

Business, heart, and body sub-scores are calculated as `energyScore ± random(0..30) - 15`. Since all three share the same base, they cluster within ~15 points of each other for any given user on any given day. This makes readings feel generic — there's no personal signature and no narrative continuity between days.

## Goals

1. Each user has a recognizable **profile shape** — a fixed archetype derived from birth data that makes their readings feel personal.
2. Sub-scores **diverge meaningfully** (20-30+ points apart is common, not rare).
3. Scores have **momentum** — recent trends carry forward slightly, creating narrative streaks.
4. The function remains **pure** — no database calls, no external state.

## Design

### 1. Profile Weights

Three multipliers (one per dimension) derived from distinct birth data inputs. Each weight falls in the range **0.7–1.3**, so a strong dimension gets ~130% of the energy score and a weak one gets ~70%.

| Sub-score    | Primary input              | Secondary input |
|------------- |---------------------------|-----------------|
| **Business** | Name number (Pythagorean)  | Birth day       |
| **Heart**    | Birth month                | Name number     |
| **Body**     | Life path number           | Birth month     |

#### Inputs

- `lifePath`: single digit 1–9 (master numbers 11/22 are reduced to 2/4 before weight calculation)
- `namNum`: single digit 1–9
- `birthDay`: extracted as `parseInt(dateOfBirth.split('-')[2], 10)` (1–31)
- `birthMonth`: extracted as `parseInt(dateOfBirth.split('-')[1], 10)` (1–12)

#### Weight calculation

```typescript
function profileWeights(lifePath: number, namNum: number, birthDay: number, birthMonth: number) {
  // Reduce master numbers: 11→2, 22→4 (standard numerological reduction)
  const lp = lifePath === 11 ? 2 : lifePath === 22 ? 4 : lifePath;

  // Each raw value uses different modular offsets for variety
  const rawBusiness = namNum + (birthDay % 10);       // name-driven, range 1–18
  const rawHeart    = birthMonth + (namNum * 2 % 7);  // month-driven, range 1–18
  const rawBody     = lp + (birthMonth % 5) + (birthDay % 4); // lifePath-driven, range 1–18

  // Normalize: map to 0.7–1.3 range
  // Max possible raw value is 18, min is 1
  const normalize = (raw: number) => 0.7 + ((raw - 1) / 17) * 0.6;

  // Re-center so weights average to exactly 1.0
  const weights = [normalize(rawBusiness), normalize(rawHeart), normalize(rawBody)];
  const avg = (weights[0] + weights[1] + weights[2]) / 3;
  return {
    business: weights[0] / avg,
    heart:    weights[1] / avg,
    body:     weights[2] / avg,
  };
}
```

**Range proof:** `normalize` maps raw 1→0.7, raw 18→1.3. After recentering by dividing by the mean, the weights always average to exactly 1.0. This preserves the overall energy score while distributing it unevenly across dimensions.

Users without a `fullName` use the existing fallback (`namNum = 5`), which still produces a distinct profile shape from the other inputs.

### 2. Daily Base Score

```
baseSubScore[dim] = profileWeight[dim] * energyScore
```

For a user with weights `{business: 1.2, heart: 0.85, body: 0.95}` and energyScore 70:
- business: 84, heart: 60, body: 67 — a 24-point spread before any daily noise.

### 3. Daily Variation (±15)

Same mechanism as current code — seeded random offset per dimension:

```
variation[dim] = seededRandom(dailySeed, dimOffset, 31) - 15  // -15 to +15
```

Offset values: business=1, heart=2, body=3 (unchanged).

### 4. Momentum (previous 3 days)

Compute each dimension's base sub-score (profile weight × energy + variation, **no momentum**) for the past 3 days. This is pure — no DB needed since the algorithm is deterministic.

#### Implementation approach

Extract an internal helper `computeBaseSubScore(input, dateStr, dimOffset, profileWeight)` that returns just the base sub-score for one dimension on one date:

```typescript
function computeBaseSubScore(
  input: BirthDataInput,
  dateStr: string,
  dimOffset: number,
  profileWeight: number,
): number {
  const seed = hashCode(`${input.userId}:${dateStr}`);
  const energy = computeEnergyScore(input, seed);  // extract current energy calc to helper
  const base = profileWeight * energy;
  const variation = seededRandom(seed, dimOffset, 31) - 15;
  return Math.max(0, Math.min(100, Math.round(base + variation)));
}
```

This avoids recomputing the full reading (lucky color, direction, insights, etc.) for lookback days. Only the energy score and one sub-score are calculated per lookback day per dimension — 9 lightweight calls total.

#### Date arithmetic for lookback

```typescript
function subtractDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
```

This handles month/year boundaries and leap years correctly via the JS Date object.

#### Trend calculation

```typescript
function momentum(today: number, day1: number, day2: number, day3: number): number {
  // Weighted trend: more recent days matter more
  // today/day1/day2/day3 are base sub-scores (no momentum) for today through 3 days ago
  const diff1 = today - day1;  // vs yesterday
  const diff2 = day1 - day2;   // yesterday vs 2 days ago
  const diff3 = day2 - day3;   // 2 days ago vs 3 days ago

  const weightedTrend = (diff1 * 3 + diff2 * 2 + diff3 * 1) / 6;
  return Math.max(-1, Math.min(1, weightedTrend / 15));  // normalize to -1..1
}
```

**Momentum bonus:** `trend * 5` (so ±5 points max).

**No recursion:** Lookback days use `computeBaseSubScore` which has no momentum component. The call chain is flat: `computeReading` → `computeBaseSubScore` (×12: 3 dimensions × 4 dates) → done.

### 5. Final Formula

```
subScore[dim] = clamp(
    profileWeight[dim] * energyScore   // archetype shape
  + seededRandom(dailySeed, dim, 31) - 15  // daily noise ±15
  + momentum(dim) * 5                      // trend bonus ±5
, 0, 100)
```

### Score Spread Examples

**User A:** lifePath=4, namNum=8, birthDay=23, birthMonth=3
- rawBusiness=8+(23%10)=11, rawHeart=3+(16%7)=5, rawBody=4+(3%5)+(23%4)=7
- Weights after normalize+recenter: business≈1.22, heart≈0.80, body≈0.98
- With energyScore 70: business≈85, heart≈56, body≈69 → **29-point spread** before variation

**User B:** lifePath=1, namNum=6, birthDay=7, birthMonth=11
- rawBusiness=6+(7%10)=13, rawHeart=11+(12%7)=16, rawBody=1+(11%5)+(7%4)=5
- Weights after normalize+recenter: business≈0.99, heart≈1.17, body≈0.84
- With energyScore 70: business≈69, heart≈82, body≈59 → **23-point spread** before variation

These examples show how different birth data creates distinct profile shapes — User A is business-dominant while User B is heart-dominant.

## Changes Required

### Files modified

- `shared/compute-reading.ts` — replace sub-score calculation with profile weights + momentum

### No changes needed

- `shared/types.ts` — `DailyPulseReading.subScores` shape is unchanged
- API endpoints — no interface changes
- Frontend — consumes the same `subScores` object

### Performance

Computing momentum adds 9 lightweight calls per reading (3 dimensions × 3 lookback days). Each call computes only a hash, energy score, and one sub-score — no insights, colors, or directions. This is negligible compared to the API overhead.

## Edge Cases

- **No fullName:** `namNum` defaults to 5. Profile shape still varies via lifePath and birthMonth.
- **Master numbers (11, 22):** Reduced to single digits (2, 4) before weight calculation to keep inputs in a consistent 1–9 range.
- **First 3 days of use:** Momentum uses the same deterministic algo for past dates, so it works from day one — there's no "cold start" problem.
- **energyScore near boundaries (0 or 100):** Profile weighting could push a sub-score above 100 or below 0. The final clamp handles this.
- **Momentum recursion:** Past-day scores use `computeBaseSubScore` (no momentum). The call chain is flat — no recursion.
- **Identical birth data across users:** Two users with the same name and birth date get the same profile weights but different daily scores (daily seed includes `userId`).
- **Leap years / month boundaries:** Date subtraction uses `Date.setDate()` which handles these correctly.
