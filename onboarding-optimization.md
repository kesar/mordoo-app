# Onboarding Optimization — Mor Doo (หมอดู)

*Generated: 2026-03-24 | Status: Pre-launch*

---

## Current Flow Analysis

### Flow Map

```
App Open
  → Screen 1: Soul Gate (language + auth choice)
    → Screen 2: Phone Auth (OTP send + verify) [or Apple/Google skip]
      → Screen 3: Birth Data (date, time, place, gender — 7 fields)
        → Screen 4: Name Numbers (name, phone, car plate — 3 fields)
          → Screen 5: Life Context (concerns + urgency — optional)
            → Screen 6: Power-Ups (notifications + location — skippable)
              → MAIN APP (Pulse screen) ← ACTIVATION EVENT

Total screens: 6 (7 if counting OTP as separate step)
Estimated time: 3-5 minutes
```

### Activation Event

**First Pulse reading** — the moment the user sees their personalized Prana Index, lucky elements, and daily insight based on their birth data. This is the first "wow, this is about ME" moment.

### Screen-by-Screen Audit

| # | Screen | Type | Fields | Required? | Drop-off Risk | Verdict |
|---|--------|------|:------:|:---------:|:-------------:|---------|
| 1 | Soul Gate | Auth | 2 | Yes | Low (2%) | **Keep** — clean, fast |
| 2 | Phone Auth | Auth | 2 | Yes | Medium (10-15%) | **Keep** — required for auth |
| 3 | Birth Data | Personalization | 7 | Mostly | **High (15-25%)** | **Simplify** |
| 4 | Name Numbers | Personalization | 3 | Partial | Low (5%) | **Defer optional fields** |
| 5 | Life Context | Personalization | 2 | No | Low (5%) | **Defer entirely** |
| 6 | Power-Ups | Permissions | 2 | No | Low (5%) | **Move post-activation** |

### Estimated Funnel (Current)

```
100% → Soul Gate
 98% → Phone Auth
 85% → Birth Data        ← SMS failures + friction
 65% → Name Numbers      ← Birth data form is heavy (7 fields)
 60% → Life Context
 57% → Power-Ups
 55% → Main App (Pulse)  ← ACTIVATION

Estimated activation rate: ~55% of app opens
```

---

## Issues Found

### Critical Issues

| # | Issue | Impact | Screen |
|---|-------|--------|--------|
| 1 | **7-field form before any value** — Birth Data asks for date, time (h/m/AM-PM), place, gender | 15-25% dropout | Screen 3 |
| 2 | **Orphaned Soul Snapshot** — soul-snapshot.tsx exists but isn't in the flow. Users miss the "reveal" moment that validates all the data they just entered | Missed activation boost | After Screen 6 |
| 3 | **No inline validation** — form errors only show in alerts, not next to the field | Re-entry frustration | Screen 3 |
| 4 | **Life Context feels required** — UI doesn't communicate that concerns + urgency are optional | Unnecessary cognitive load | Screen 5 |
| 5 | **Progress bar shows 1/3 on Soul Gate** but actual flow is 6 screens — sets wrong expectations | Trust erosion | Screen 1 |

### Moderate Issues

| # | Issue | Impact | Screen |
|---|-------|--------|--------|
| 6 | **Location toggle doesn't actually request permission** — visual only | Broken feature | Screen 6 |
| 7 | **No server sync until end** — if user quits mid-onboarding, data is only local | Data loss risk | All |
| 8 | **Name Numbers screen collects car plate** — unusual ask that may confuse non-Thai users | Slight friction | Screen 4 |
| 9 | **No birth place autocomplete** — text input only, no Google Places or similar | Data quality | Screen 3 |

---

## Recommended Changes

### Change 1: Reorder — Move Permissions After Activation (HIGH IMPACT)

**Current:** Permissions (Screen 6) → Main App
**Proposed:** Main App → Permissions (contextual, after first Pulse)

**Why:** Users who've seen their first Pulse reading understand WHY they'd want notifications ("get your daily reading every morning"). Permission grant rates improve 2-3x when asked in context.

**Implementation:**
- Remove power-ups.tsx from onboarding flow
- After first Pulse view, show a bottom sheet: "Get your daily Prana reading every morning" → Enable Notifications
- Request location when it's needed (e.g., v2 temple finder)

**Expected lift:** +15-20% notification grant rate

---

### Change 2: Activate Soul Snapshot (HIGH IMPACT)

**Current:** Orphaned — not in the navigation flow
**Proposed:** Insert after Power-Ups (or after Name Numbers in optimized flow)

**Why:** The Soul Snapshot is the "reveal" moment. Users entered all this data — showing them their first reading INSIDE onboarding validates the effort and creates an emotional peak before entering the main app. This IS the activation event.

**Implementation:**
- Wire soul-snapshot.tsx into the onboarding flow as the final screen
- Call the Pulse API to generate a real reading (not hardcoded)
- The "ENTER" button leads to the main app
- This screen becomes the activation moment

**Expected lift:** +10-15% completion rate (users who see results are motivated to finish)

---

### Change 3: Simplify Birth Data (HIGH IMPACT)

**Current:** 7 fields on one screen (day, month, year, hour, minute, AM/PM, place, gender)
**Proposed:** Split into 2 lighter screens or reduce fields

**Option A — Split into 2 screens:**
- Screen 3a: Date of Birth (day/month/year) + Gender — 4 fields, familiar
- Screen 3b: Time + Place — 3 fields, with clear "skip time" option

**Option B — Reduce fields (recommended):**
- Keep: Date (day/month/year), Birth Place — 4 fields required
- Move to optional: Time of birth (ask later in settings), Gender
- Label time/gender as "enhance your reading" in settings

**Why:** The birth time question (hour + minute + AM/PM) is the #1 friction point. Most people don't know their exact birth time. Making it truly optional (not just "approximate") removes 3 fields.

**Expected lift:** +10-15% screen completion rate

---

### Change 4: Defer Life Context (MEDIUM IMPACT)

**Current:** Screen 5 — concerns grid + urgency text (both optional)
**Proposed:** Remove from onboarding. Ask on first Oracle chat instead.

**Why:** Concerns are only used by the Oracle AI. Users haven't seen the Oracle yet, so they can't understand why this data matters. Ask when they first open Oracle chat: "What would you like guidance on?" — same UI, better context.

**Implementation:**
- Remove life-context.tsx from onboarding flow
- Add a "first Oracle visit" prompt that shows the concerns selector
- Store in the same onboarding store location

**Expected lift:** 1 fewer screen = faster to activation = +5% completion

---

### Change 5: Defer Optional Name Numbers Fields (LOW IMPACT)

**Current:** Full name (required) + phone + car plate on one screen
**Proposed:** Only ask for full name. Defer phone/car plate to settings.

**Why:** Phone numerology and car plate numerology are niche features. Asking for them during onboarding adds cognitive load ("why do they want my car plate?"). Users who care about these will find them in settings.

**Expected lift:** Faster screen completion, less confusion for non-Thai users

---

### Change 6: Fix Progress Indicator (LOW IMPACT)

**Current:** Soul Gate shows "1/3" but there are 6 screens
**Proposed:** Show accurate progress based on actual remaining screens

**If implementing all changes above, new flow is 4 screens:**
- Soul Gate (1/4) → Phone Auth (2/4) → Birth Data (3/4) → Soul Snapshot (4/4)

---

## Optimized Flow

### Proposed Flow (4 screens to activation)

```
App Open
  → Screen 1: Soul Gate (1/4)
      Language + auth choice
      [2 taps]

  → Screen 2: Phone Auth (2/4)
      Phone number → OTP verify
      [2-3 taps + typing]

  → Screen 3: Birth Data (3/4)
      Date of birth (day/month/year) + full name + birth place
      Gender optional toggle at bottom
      [4-5 taps + typing]

  → Screen 4: Soul Snapshot (4/4) ← ACTIVATION EVENT
      First Pulse reading revealed!
      Energy ring, lucky elements, insight
      "ENTER THE REALM" button

  → MAIN APP (Pulse screen)
      ↓ (after first Pulse view, contextual prompt)
      Notification permission bottom sheet
      ↓ (on first Oracle visit)
      Life concerns selector
```

### Estimated Funnel (Optimized)

```
100% → Soul Gate
 98% → Phone Auth
 85% → Birth Data        ← SMS failures (unchanged)
 78% → Soul Snapshot     ← Simpler form = less dropout
 75% → Main App (Pulse)  ← ACTIVATION

Estimated activation rate: ~75% of app opens (+20% improvement)
```

### Comparison

| Metric | Current | Optimized | Improvement |
|--------|:-------:|:---------:|:-----------:|
| Screens to activation | 6-7 | 4 | -3 screens |
| Required fields | 12 | 6 | -50% |
| Time to activation | 3-5 min | 1.5-2.5 min | -50% |
| Estimated activation rate | ~55% | ~75% | +20% |
| Permission timing | Before value | After value | +15-20% grant rate |

---

## Deferred Items (Where They Go)

| Removed From Onboarding | New Location | Trigger |
|--------------------------|-------------|---------|
| Birth time (h/m/AM-PM) | Settings → Birth Data | "Enhance your reading" prompt |
| Phone number (numerology) | Settings → Numerology | Feature discovery |
| Car plate | Settings → Numerology | Feature discovery |
| Life concerns | Oracle first visit | Bottom sheet before first chat |
| Urgency context | Oracle first visit | Text field in concerns selector |
| Location permission | v2 temple feature | Contextual when feature used |
| Notification permission | After first Pulse | Bottom sheet: "Get daily readings" |

---

## Permission Prompt Copy

### Notification Permission (shown after first Pulse view)

```
✦

Your Daily Cosmic Reading Awaits

Get your Prana Index, lucky elements, and daily
insight delivered every morning.

[Enable Notifications]     [Maybe Later]

We'll only notify you once daily — no spam, ever.
```

### Life Concerns (shown on first Oracle visit)

```
What guides your path?

Select the forces that matter most to you.
The Oracle will personalize guidance to your journey.

[Love] [Career] [Money] [Health] [Family] [Spiritual]

[Ask the Oracle →]
```

---

## Implementation Priority

| Priority | Change | Effort | Impact |
|:--------:|--------|:------:|:------:|
| 1 | Wire Soul Snapshot into flow | Small | High |
| 2 | Move permissions post-activation | Medium | High |
| 3 | Simplify Birth Data (defer time) | Small | High |
| 4 | Defer Life Context to Oracle | Medium | Medium |
| 5 | Defer phone/car plate to settings | Small | Low |
| 6 | Fix progress indicator | Small | Low |

---

## Analytics Events to Track

Implement these before beta to measure the funnel:

```
onboarding_started          — Screen 1 loaded
onboarding_language_selected — Language chosen
onboarding_auth_method      — Phone/Apple/Google selected
onboarding_otp_sent         — OTP requested
onboarding_otp_verified     — OTP verified successfully
onboarding_otp_failed       — OTP verification failed
onboarding_birth_data_completed — Birth data submitted
onboarding_name_completed   — Name entered
onboarding_snapshot_viewed  — Soul Snapshot seen
onboarding_completed        — Entered main app
onboarding_abandoned        — App closed during onboarding (step number)
notification_prompt_shown   — Permission prompt displayed
notification_granted        — Permission granted
notification_denied         — Permission denied
```

---

## Next Steps

- `/rating-prompt-strategy` — When to ask for App Store review after activation
- `/monetization-strategy` — Where to show the paywall relative to onboarding
- `/app-analytics` — Set up the full analytics funnel
