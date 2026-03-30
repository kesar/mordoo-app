# Rating Prompt Strategy — Mor Doo (หมอดู)

*Generated: 2026-03-24 | Status: Pre-launch | Current Rating: N/A*

---

## Overview

| Parameter | Value |
|-----------|-------|
| **Current rating** | N/A (pre-launch) |
| **Target rating** | 4.7+ stars |
| **Platform** | iOS + Android |
| **Pre-prompt survey** | Yes (recommended) |
| **Library needed** | `expo-store-review` |

---

## Activation Event (Recap)

**First Pulse reading viewed** — when the user sees their personalized Prana Index, lucky elements, and daily insight. This is when they first feel "this app knows me."

---

## Success Moments Identified

These are the moments when users are most satisfied — the best times to prompt for a review.

| # | Success Moment | Why It's a Peak | When It Happens |
|---|---------------|-----------------|-----------------|
| 1 | **3rd Pulse viewing** | User has formed a daily habit — they came back 3 times | Day 3-5 |
| 2 | **Oracle gives a resonant answer** | Emotional connection — the AI "understood" them | After any Oracle session |
| 3 | **Siam Si draws "Excellent" fortune** | Positive emotion — user is happy with their result | After Siam Si draw |
| 4 | **Soul Snapshot reveal** (if wired in) | First "wow" moment — all their data visualized | End of onboarding |

**Primary trigger:** Success Moment #1 (3rd Pulse viewing)
**Secondary trigger:** Success Moment #3 (Excellent Siam Si draw)

---

## Prompt Trigger Logic

### Who Gets Prompted

```
ALL criteria must be true:

✓ app_sessions >= 3          — Not a first-time user
✓ days_since_install >= 3    — Enough time to form an opinion
✓ pulse_views >= 3           — Has experienced core value multiple times
✓ no_crash_last_3_sessions   — No frustration from technical issues
✓ no_error_this_session      — Clean session, no API failures
✓ not_rated_this_version     — Don't re-prompt same version
✓ not_dismissed_last_14_days — Respect "not now" for 2 weeks
```

### When to Show

```
TRIGGER when ANY of these happen (AND all criteria above are met):

1. User views their 3rd Pulse reading (primary)
   — Show after the energy ring animation completes (1.5s delay)

2. User draws an "Excellent" Siam Si stick (secondary)
   — Show after the result card spring animation (2s delay)

3. User completes 5th Oracle conversation (tertiary)
   — Show after AI response finishes streaming
```

### When NEVER to Show

```
NEVER prompt when:

✗ User just hit a quota limit ("You've used your daily questions")
✗ API error or timeout occurred this session
✗ User is mid-conversation in Oracle
✗ App just crashed or recovered from background
✗ User is on the subscription/paywall screen
✗ User just cancelled or declined a subscription
```

---

## Pre-Prompt Survey (Recommended)

Before triggering the native iOS/Android prompt, show an in-app survey to filter out unhappy users.

### Design

```
┌─────────────────────────────────────┐
│                                     │
│           ✦                         │
│                                     │
│   Are you enjoying Mor Doo?         │
│                                     │
│   Your feedback helps us improve    │
│   your cosmic journey.              │
│                                     │
│   ┌─────────────┐ ┌──────────────┐  │
│   │  Yes, I am! │ │  Not really  │  │
│   └─────────────┘ └──────────────┘  │
│                                     │
└─────────────────────────────────────┘

Style: Bottom sheet, dark surface, gold accent
Font: CinzelDecorative for headline, CormorantGaramond for body
```

### Thai Version

```
คุณชอบใช้ หมอดู ไหม?

ความคิดเห็นของคุณช่วยให้เราพัฒนาเส้นทางจักรวาลของคุณ

[ชอบมาก!]     [ยังไม่ค่อย]
```

### Flow

```
Pre-prompt survey shown
  │
  ├─ "Yes, I am!" / "ชอบมาก!"
  │   → Trigger native SKStoreReviewRequest / Play In-App Review
  │   → Log: rating_prompt_accepted
  │   → Set: lastPromptDate = now, promptedThisVersion = true
  │
  └─ "Not really" / "ยังไม่ค่อย"
      → Show feedback form (NOT the native rating prompt)
      → "We'd love to hear how we can improve"
      → Text input → send to support email or Supabase feedback table
      → Log: rating_prompt_declined, feedback_submitted
      → Set: lastPromptDate = now (wait 14 days before asking again)
```

**Expected impact:** Filtering unhappy users before the native prompt typically improves average rating by **+0.3 to 0.8 stars**.

---

## Implementation Guide

### 1. Install expo-store-review

```bash
npx expo install expo-store-review
```

### 2. Create Rating Service

**File:** `src/services/rating.ts`

```typescript
import * as StoreReview from 'expo-store-review';
import { storage } from '@/src/utils/storage';

const RATING_STORAGE_KEY = 'rating_prompt_state';

interface RatingState {
  sessionCount: number;
  pulseViewCount: number;
  firstInstallDate: string;
  lastPromptDate: string | null;
  promptedVersions: string[];
  dismissed: boolean;
}

function getState(): RatingState {
  const raw = storage.getString(RATING_STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return {
    sessionCount: 0,
    pulseViewCount: 0,
    firstInstallDate: new Date().toISOString(),
    lastPromptDate: null,
    promptedVersions: [],
    dismissed: false,
  };
}

function setState(state: RatingState) {
  storage.set(RATING_STORAGE_KEY, JSON.stringify(state));
}

export function incrementSession() {
  const state = getState();
  state.sessionCount++;
  setState(state);
}

export function incrementPulseView() {
  const state = getState();
  state.pulseViewCount++;
  setState(state);
}

export function shouldShowRatingPrompt(appVersion: string): boolean {
  const state = getState();
  const now = new Date();
  const installDate = new Date(state.firstInstallDate);
  const daysSinceInstall = (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24);

  // Check all criteria
  if (state.sessionCount < 3) return false;
  if (daysSinceInstall < 3) return false;
  if (state.pulseViewCount < 3) return false;
  if (state.promptedVersions.includes(appVersion)) return false;

  // Respect 14-day cooldown after dismiss
  if (state.lastPromptDate) {
    const daysSincePrompt = (now.getTime() - new Date(state.lastPromptDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePrompt < 14) return false;
  }

  return true;
}

export async function triggerNativeReviewPrompt(appVersion: string) {
  const isAvailable = await StoreReview.isAvailableAsync();
  if (isAvailable) {
    await StoreReview.requestReview();
  }
  const state = getState();
  state.promptedVersions.push(appVersion);
  state.lastPromptDate = new Date().toISOString();
  setState(state);
}

export function markDismissed() {
  const state = getState();
  state.lastPromptDate = new Date().toISOString();
  setState(state);
}
```

### 3. Integration Points

**In Pulse screen** (`app/(main)/pulse.tsx`):
```typescript
// After energy ring animation completes
useEffect(() => {
  incrementPulseView();
  if (shouldShowRatingPrompt(APP_VERSION)) {
    // Show pre-prompt survey bottom sheet after 1.5s delay
    setTimeout(() => setShowRatingPrompt(true), 1500);
  }
}, [readingData]);
```

**In Siam Si screen** (`app/(main)/oracle/siam-si.tsx`):
```typescript
// After result card revealed with "Excellent" fortune
if (result.fortune === 'excellent' && shouldShowRatingPrompt(APP_VERSION)) {
  setTimeout(() => setShowRatingPrompt(true), 2000);
}
```

---

## Launch Week Rating Strategy

### Day 1-3: Seed Initial Ratings

- Beta testers who committed to reviewing → remind them via message
- Target: **15-20 reviews** in first 3 days
- Respond to every review immediately (see `/review-management`)

### Day 4-7: Enable In-App Prompts

- Activate the rating prompt for users who meet all criteria
- Most Day 1 users will now have 3+ sessions and 3+ days since install
- Expected: 5-10 organic ratings per day

### Week 2+: Steady State

- Prompt continues for qualifying users
- Monitor rating trend in App Store Connect
- If rating drops below 4.5, investigate recent reviews immediately

---

## Rating Recovery Plan (If Needed)

### If rating drops below 4.5

```
Day 0:  Identify cause — read all 1-3 star reviews from last 7 days
Day 1:  Reply to every negative review acknowledging the issue
Day 3:  Ship fix in app update
Day 4:  Reply again: "Fixed in version X.X — please update!"
Day 7:  Enable aggressive prompt campaign:
        - Lower session threshold to 2 (from 3)
        - Lower day threshold to 2 (from 3)
        - Keep pre-prompt filter active
Day 14: Evaluate — should recover 0.3-0.5 stars
```

### iOS Version Rating Reset

If a specific version gets bad ratings:
1. Fix the issue
2. Ship new version
3. In App Store Connect → "Reset Rating Summary" for the new version
4. Run prompt campaign targeting most engaged users first
5. Only use this once — repeated resets look suspicious

---

## Analytics Events

```
rating_survey_shown         — Pre-prompt survey displayed
rating_survey_positive      — User tapped "Yes, I am!"
rating_survey_negative      — User tapped "Not really"
rating_native_prompt_shown  — Native review prompt triggered
rating_feedback_submitted   — Negative user submitted feedback text
rating_prompt_criteria_met  — User qualified but prompt not yet shown
```

---

## Expected Outcomes

| Timeframe | Target Rating | Target Count | How |
|-----------|:------------:|:------------:|-----|
| Week 1 | 4.8+ | 15-20 | Beta tester seeding |
| Month 1 | 4.7+ | 50-80 | In-app prompts (filtered) |
| Month 3 | 4.6+ | 150-250 | Steady organic + prompts |

The pre-prompt filter should keep your rating **0.3-0.5 stars higher** than it would be without filtering — the difference between 4.3 and 4.7 in search results.

---

## Next Steps

- `/monetization-strategy` — Optimize paywall placement and pricing
- `/review-management` — How to respond to reviews post-launch
- `/app-analytics` — Set up the full analytics stack including rating events
