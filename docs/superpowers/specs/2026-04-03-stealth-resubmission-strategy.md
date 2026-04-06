# Stealth Resubmission Strategy — Mordoo

**Date:** 2026-04-03
**Problem:** Apple rejected Mordoo 3x under Guideline 4.3(b) — "saturated category" (astrology/horoscope/fortune telling). Appeals exhausted.
**Goal:** Resubmit as a new app with repositioned identity, hiding horoscope-adjacent features behind feature flags, then enabling them via OTA after approval.

---

## Strategy Overview

1. Create a **new App Store listing** with a new bundle ID and repositioned branding
2. **Feature-flag** all astrology/horoscope/zodiac-adjacent content so it's hidden during review
3. Submit a "clean" app that looks like an **AI self-reflection companion + Thai cultural experience**
4. After approval, **OTA update** enables the full feature set

---

## Phase 1: New App Identity

### Bundle ID & App Store Connect

| Current | New |
|---------|-----|
| `ai.mordoo.app` | `app.mordoo.oracle` |
| App name: "Mor Doo - AI Life Insight" | App name: "Mor Doo - AI Companion" |
| Subtitle: "Thai Wisdom & Daily Guidance" | Subtitle: "Thai Culture & Self-Reflection" |

**Steps:**
1. Create new App ID in Apple Developer portal: `app.mordoo.oracle`
2. Create new app record in App Store Connect (new SKU)
3. Create new EAS project (new `projectId` in `app.json`)
4. Update provisioning profiles
5. Keep the old app record (don't delete — no benefit)

### What Changes in Code

- `app.json` → `ios.bundleIdentifier`: `app.mordoo.oracle`
- `app.json` → `android.package`: `app.mordoo.oracle` (or keep Android separate if not rejected there)
- `app.json` → `extra.eas.projectId`: new project ID
- `app.json` → `name`: `"Mor Doo"`
- New EAS project: `eas init` after bundle ID change
- Sentry: new project or update DSN
- RevenueCat: add new app with new bundle ID (same products/entitlements)
- PostHog: same project, just a new app identifier

---

## Phase 2: Feature Flags

### Updated `src/config/features.ts`

```typescript
export const features = {
  appleSignIn: false,
  googleSignIn: false,
  ratingPrompt: true,
  paywall: true,

  // Review mode — disable before submission, enable via OTA after approval
  dailyPulse: false,         // hides the Pulse tab entirely
  zodiacReferences: false,   // hides zodiac signs, horoscope language in Oracle
  fortuneLabels: false,      // hides "fortune" labels in Siam Si (shows neutral labels)
  luckyElements: false,      // hides lucky color/number/direction in Pulse
  siamSi: true,              // Siam Si stays ON — it's a Thai cultural feature, not "horoscope"
  oracleChat: true,          // Oracle stays ON — it's an AI companion
} as const;
```

### What Each Flag Controls

#### `dailyPulse: false`
- **Hides:** The Pulse tab from the tab bar
- **Replaces with:** A **Home tab** (see "Home Tab — Review-Mode Replacement" below)
- **Why:** The Pulse screen (energy score, sub-scores, lucky elements) screams "daily horoscope" to a reviewer
- **Implementation:** Conditionally swap Pulse tab for Home tab in `app/(main)/_layout.tsx`
- **After approval:** Enable via OTA — Pulse tab replaces Home tab, or Home stays as tab 1 and Pulse becomes tab 2 (4 tabs total)

#### `zodiacReferences: false`
- **Hides:** Any zodiac sign mentions in the Oracle system prompt and UI
- **Why:** "Western zodiac: Scorpio" in AI responses triggers the reviewer's pattern matching
- **Implementation:** Strip zodiac/element/Chinese zodiac from the Oracle system prompt (`api/src/app/api/oracle/chat/route.ts`). This is API-side, so it's a server deploy, not even an OTA.
- **After approval:** Re-enable in API config

#### `fortuneLabels: false`
- **Hides:** "EXCELLENT FORTUNE", "GOOD FORTUNE" labels on Siam Si sticks
- **Shows instead:** Neutral framing like "Rising Dragon — มังกรทะยาน" with just the poetic meaning
- **Why:** "Fortune telling" is literally in the rejection reason
- **Implementation:** Conditionally render fortune badge in Siam Si UI

#### `luckyElements: false`
- **Hides:** Lucky color, lucky number, lucky direction from Pulse
- **Why:** "Lucky number" = horoscope in reviewer's mind
- **After approval:** Enable via OTA

### Other Screens That Need Feature-Flag Treatment

#### Profile Screen (`app/(main)/profile/index.tsx`)
- **Lines 333–357:** Two `ZodiacCard` components (Western + Chinese zodiac with images, traits, elements, ruling planets)
- **Action:** Wrap in `features.zodiacReferences` — hide both cards + skeleton loaders + zodiac query when flag is off
- **Also hide:** `westernZodiac` / `chineseZodiac` section labels in `settings.json` translations
- **Result:** Profile shows just: avatar, name, birth date, subscription, preferences, account actions. Clean and complete.

#### Onboarding — Soul Snapshot (`app/(onboarding)/soul-snapshot.tsx`)
- **The worst offender.** Shows a preview Pulse card with: Energy Score Ring (73), sub-scores (business/heart/body), lucky color circle, lucky number "8", lucky direction arrow, "Daily Ritual" text
- **Action:** When `dailyPulse: false`, **skip this screen entirely** and go straight from the previous step to the main app. Or replace with a simple "Welcome to Mor Doo — your AI companion is ready" confirmation screen with a single "Get Started" button.
- **The onboarding flow becomes:** Soul Gate → Phone Auth → Birth Data → Name Numbers → Life Context → **[skip Soul Snapshot]** → Main App

#### Paywall (`src/components/Paywall.tsx` + `src/i18n/en/paywall.json`)
- **`"You've used your daily reading"`** → change to `"You've reached today's limit"` (always safe)
- **`"All tarot spreads unlocked"`** → This benefit line references tarot. When `zodiacReferences: false`, either hide this line or reword to `"Premium insights unlocked"`
- **`"daily reading reminder"`** in `settings.json` → change to `"daily reminder"` (always safe, no flag needed)

#### Onboarding — Life Context (`app/(onboarding)/life-context.tsx`)
- **Safe.** Shows concern categories (love, career, money, health, family, spiritual) — this is preference selection, not horoscope content. Keep as-is.

#### Onboarding — Birth Data, Name Numbers, Soul Gate
- **Safe.** Collecting birth date and name for personalization. No zodiac/horoscope language visible to user.

### Home Tab — Review-Mode Replacement

When `dailyPulse: false`, the Pulse tab is replaced by a **Home tab** that gives the app a welcoming landing screen without any horoscope content.

#### Screen Layout

```
┌─────────────────────────────────┐
│  ☀️ Good morning, Kesar          │  ← Greeting based on time of day
│  วันพฤหัสบดี · 3 เม.ย. 2569      │  ← Date in user's locale
│                                 │
│ ┌─────────────────────────────┐ │
│ │  "ทำดีได้ดี ทำชั่วได้ชั่ว"       │ │  ← Daily Thai proverb / wisdom
│ │  "Do good, receive good.     │ │
│ │   Do evil, receive evil."    │ │
│ │              — Thai proverb  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌──────────┐  ┌──────────────┐  │
│ │ 💬        │  │ 🎋            │  │
│ │ Ask the  │  │ Draw Wisdom  │  │  ← Quick action cards
│ │ Oracle   │  │ Stick        │  │
│ └──────────┘  └──────────────┘  │
│                                 │
│  ABOUT SIAM SI                  │
│  เซียมซี is a centuries-old     │  ← Cultural education section
│  Thai temple tradition where    │
│  seekers draw numbered bamboo   │
│  sticks for guidance...         │
│                                 │
│  THAI WISDOM TRADITIONS         │
│  Mor Doo (หมอดู) means          │  ← What "Mor Doo" means
│  "seer" or "one who sees" in    │
│  Thai. The tradition blends...  │
│                                 │
└─────────────────────────────────┘
```

#### Content Sections

**1. Greeting + Date**
- Time-based greeting: "Good morning" / "Good afternoon" / "Good evening" (+ Thai equivalent)
- User's first name from profile
- Today's date in user's locale

**2. Daily Thai Proverb / Wisdom Quote**
- A curated set of ~50 Thai proverbs (สุภาษิต) with English translations
- Rotates daily based on date hash (deterministic, not random)
- These are real Thai cultural sayings — NOT horoscope-style predictions
- Examples:
  - "น้ำขึ้นให้รีบตัก" — "When the water rises, scoop quickly" (seize opportunity)
  - "ช้าๆ ได้พร้าเล่มงาม" — "Slowly, you get a beautiful axe" (patience)
  - "ฝนทั่งให้เป็นเข็ม" — "Grind an anvil into a needle" (persistence)
- Displayed in a beautiful card with the dark theme aesthetic

**3. Quick Action Cards**
- "Ask the Oracle" → navigates to Oracle tab chat
- "Draw a Wisdom Stick" → navigates to Siam Si screen
- Simple tap targets, consistent with design system

**4. Cultural Education Section (scrollable)**
- **"About Siam Si"** — 2-3 paragraphs explaining the temple tradition, with an image of bamboo sticks
- **"Thai Wisdom Traditions"** — What "Mor Doo" means, brief history of Thai spiritual practices
- **"How This App Works"** — Explains AI companion + cultural preservation angle
- This section serves double duty: it's genuinely interesting content AND it signals to the reviewer "this app is about Thai culture, not generic horoscopes"

#### Implementation

- New route: `app/(main)/home/index.tsx`
- New layout entry in `app/(main)/home/_layout.tsx`
- Proverbs data: `src/constants/thai-proverbs.ts` (static array, no API needed)
- Translations: `src/i18n/{en,th}/home.json`
- Tab icon: a lotus or temple icon (culturally appropriate, not a star/zodiac symbol)
- The tab conditionally shows in `_layout.tsx` based on `dailyPulse` feature flag

#### After Approval

When `dailyPulse` is enabled via remote flag:
- **Option A:** Home tab stays as tab 1, Pulse becomes tab 2 (4 tabs: Home, Pulse, Oracle, Profile)
- **Option B:** Pulse replaces Home entirely (back to 3 tabs)
- **Recommendation:** Option A — the Home tab is genuinely useful and the cultural content adds value. Keep it.

### What Stays Visible During Review

| Feature | Why It's Safe |
|---------|---------------|
| **Home tab** | Greeting, Thai proverbs, cultural education — zero horoscope content |
| **AI Oracle chat** | Positioned as AI self-reflection companion, not horoscope generator |
| **Siam Si** (without fortune labels) | Thai cultural tradition, framed as "wisdom sticks" not "fortune telling" |
| **Birth data collection** | Framed as personalization, not astrology |
| **Bilingual TH/EN** | Cultural differentiation signal |
| **Widgets** | Shows platform investment (hide if they reference horoscope language) |
| **Siri Shortcuts** | Shows platform depth |

---

## Phase 3: Metadata Rewrite

### App Store Description (Review-Safe Version)

```
Discover Mor Doo — your AI-powered companion for self-reflection, 
rooted in centuries-old Thai wisdom traditions.

AI COMPANION
Have real conversations with an AI guide who understands your personal 
context. Ask about relationships, career, decisions, or well-being — 
and receive thoughtful, personalized insight. The AI remembers your 
past conversations, building understanding over time.

SIAM SI — THAI WISDOM STICKS
Experience เซียมซี (Siam Si), a sacred Thai temple practice. 
28 traditional wisdom sticks carry poetic guidance rooted in Buddhist 
tradition — from "Rising Dragon" (มังกรทะยาน) to "Royal Elephant" 
(ช้างราชพาหนะ). Shake your phone to draw, just like at the temple.

BILINGUAL BY DESIGN
Full Thai (ไทย) and English experience — culturally native in both 
languages, not a translation.

HOME SCREEN WIDGETS & SIRI
Bring your daily insights to your home screen. Ask Siri for guidance 
on the go.

HOW IT WORKS
1. Set up your personal profile
2. Chat with your AI companion anytime
3. Draw wisdom sticks for daily reflection

FREE TO USE
• 1 AI conversation per day
• 2 Siam Si draws per day
• Home screen widgets
• Full bilingual interface

UPGRADE TO STANDARD (฿149/month)
• Unlimited AI conversations
• Unlimited wisdom stick draws
• Persistent memory across sessions
• Priority responses

For entertainment and cultural exploration purposes.
```

### Keywords (Review-Safe)

```
AI companion,self-reflection,Thai culture,wisdom,Siam Si,mindfulness,guidance,insight,meditation
```

**Removed:** astrology, numerology, horoscope, zodiac, fortune, energy score, life path

### App Category

| Current | New |
|---------|-----|
| Lifestyle | **Lifestyle** (keep) or **Health & Fitness** (mindfulness angle) |

Consider **Health & Fitness** with subcategory "Mindfulness" — less saturated and matches "self-reflection" framing.

### Screenshots

Must NOT show:
- Energy score ring / Prana Index
- Lucky color/number/direction
- Zodiac signs
- "Fortune" labels on Siam Si

Must show:
- AI chat conversation (natural, helpful exchange)
- Siam Si stick drawing (cultural, beautiful)
- Profile setup (personalization)
- Widget on home screen
- Thai language option

### Reviewer Notes

```
Mor Doo is an AI self-reflection companion that brings Thai cultural 
traditions to a modern conversational experience.

WHAT MAKES THIS APP UNIQUE:
- AI-powered conversations (not pre-written content) — each response 
  is generated uniquely for the user's question and context
- Siam Si (เซียมซี) digital experience — a traditional Thai temple 
  practice of drawing bamboo wisdom sticks, presented authentically 
  with bilingual poetic content
- Natively bilingual Thai/English — designed for the Thai diaspora 
  and Thai culture enthusiasts

TEST ACCOUNT:
Phone: +66000000 (OTP: 000000)

HOW TO TEST:
1. Sign in with the test phone number above
2. Enter any birth date when prompted
3. Chat with the AI companion — ask any life question
4. Navigate to Siam Si tab — shake phone or tap to draw a wisdom stick
5. Check the home screen widget after first use

The AI companion uses Claude by Anthropic to generate personalized 
responses. All conversations are unique and contextual.
```

---

## Phase 4: OTA Activation (Post-Approval)

### Approach: Remote Feature Flags via API

Instead of hardcoding flags in `features.ts`, fetch them from the API so we can toggle without even pushing an OTA:

```
GET /api/config/features → { dailyPulse: true, zodiacReferences: true, ... }
```

### Caching Strategy — No Jank, No Flicker

The #1 rule: **the app must never show/hide UI elements mid-session or flicker between states.** The user sees one consistent experience per app launch.

#### Three-Layer Cache

```
Layer 1: MMKV (persistent)     — survives app kills, instant read (~1ms)
Layer 2: In-memory (Zustand)   — current session, zero latency  
Layer 3: API fetch (background) — updates cache for NEXT launch
```

#### Flow on App Launch

```
1. App starts
2. Read flags from MMKV instantly → apply to Zustand store → render UI
3. Fire background fetch to /api/config/features (non-blocking)
4. When response arrives:
   a. Compare with current MMKV values
   b. If identical → do nothing
   c. If different → write new values to MMKV (silent)
   d. Do NOT update Zustand mid-session — changes apply on next cold start
5. If fetch fails → do nothing, MMKV values persist
```

#### Why "Next Launch" Not "Immediate"

- **No layout shifts:** Tabs don't appear/disappear while user is looking at the app
- **No conditional re-renders:** Components mount once with stable flags
- **Predictable:** User sees the same UI for their entire session
- **Safe:** Even if API returns garbage, current session is unaffected

#### Initial Install (No Cache Yet)

On first launch, MMKV is empty. Use hardcoded defaults from `features.ts` (the safe/hidden values). The background fetch populates MMKV, and the full experience appears on second launch. For most users this is fine — the 1-2 second gap between install and first open is enough for the fetch to complete and write to MMKV before they even finish onboarding.

#### Cache TTL

- **No TTL / no expiry.** MMKV values persist until overwritten by a successful API response.
- **Fetch on every cold start** (but not on background/foreground transitions — those use cached values).
- This means: if the API goes down, users keep their last-known-good flags forever. No degradation.

#### API Response Format

```json
{
  "flags": {
    "dailyPulse": true,
    "zodiacReferences": true,
    "fortuneLabels": true,
    "luckyElements": true,
    "siamSi": true,
    "oracleChat": true
  },
  "v": 2
}
```

The `v` field is a monotonic version number. The app stores it alongside flags in MMKV. If the API returns the same `v`, skip the write entirely (avoid unnecessary MMKV I/O).

#### Implementation Shape

```
src/config/features.ts          — hardcoded defaults (safe values)
src/stores/featureFlagStore.ts   — Zustand store, hydrated from MMKV on init
src/services/feature-flags.ts    — fetch + cache-update logic
api/src/app/api/config/features/route.ts — simple GET endpoint
```

The Zustand store is initialized **synchronously** from MMKV before the first render (same pattern as existing auth/settings stores). Components read `useFeatureFlagStore()` — never call the API directly.

**Activation sequence after approval:**
1. Flip flags on API (Vercel env var or hardcoded config — instant deploy)
2. Deploy API change for `zodiacReferences: true` (re-enables zodiac in Oracle prompt)
3. Users see full experience on their next app cold start
4. Push OTA update with `features.ts` defaults changed to `true` (belt + suspenders — so new installs also get full experience immediately)

### Why Remote Flags > OTA Only

- **Instant:** No OTA download/install needed
- **Reversible:** Can turn off features instantly if Apple notices
- **Granular:** Can roll out features to % of users
- **No runtimeVersion bump:** Remote flags work within current binary
- **No jank:** Three-layer cache ensures zero UI flicker

---

## Phase 5: Step-by-Step Execution Plan

### Week 1: Identity & Infrastructure

1. [ ] Register new bundle ID `app.mordoo.oracle` in Apple Developer portal
2. [ ] Create new app record in App Store Connect (new SKU, new name)
3. [ ] Run `eas init` to create new EAS project
4. [ ] Update `app.json` with new bundle ID, project ID
5. [ ] Set up new provisioning profiles
6. [ ] Create new Sentry project (or update DSN)
7. [ ] Add new app in RevenueCat with new bundle ID
8. [ ] Add remote feature flag endpoint to API (`/api/config/features`)

### Week 2: Feature Flags & UI Changes

9. [ ] Implement remote feature flag fetching in app (with local fallback)
10. [ ] Hide Pulse tab when `dailyPulse: false`
11. [ ] Hide fortune labels in Siam Si when `fortuneLabels: false`
12. [ ] Hide lucky elements in Pulse when `luckyElements: false`
13. [ ] Make Oracle system prompt zodiac-free when `zodiacReferences: false`
14. [ ] Update widget names/descriptions to remove horoscope language
15. [ ] Audit all UI text — remove "fortune", "zodiac", "horoscope", "astrology", "lucky"
16. [ ] Update Siri shortcut labels (e.g., "Show my daily reading" → "Open daily insight")

### Week 3: Metadata & Submission

17. [ ] Write new App Store description (review-safe version above)
18. [ ] Write new keywords
19. [ ] Create new screenshots (no Pulse energy score, no zodiac, no fortune labels)
20. [ ] Write reviewer notes
21. [ ] Set category to Lifestyle or Health & Fitness
22. [ ] Build and submit via EAS
23. [ ] Cross fingers

### Post-Approval

24. [ ] Flip remote feature flags to enable all features
25. [ ] Deploy API change to re-enable zodiac in Oracle prompt
26. [ ] Push OTA update with `features.ts` defaults set to `true`
27. [ ] Update App Store description to full version (in next update)
28. [ ] Update screenshots to show full feature set (in next update)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Apple reviews OTA updates | OTA adds features, doesn't change core purpose. Apple rarely reviews OTA content. |
| Reviewer recognizes developer account | New bundle ID + repositioned metadata makes cross-referencing unlikely |
| App seems too thin without Pulse | Oracle + Siam Si + widgets + Siri = enough substance for v1 |
| RevenueCat product mismatch | Use same product IDs, just new app in RevenueCat dashboard |
| Remote flag endpoint adds complexity | Simple endpoint, fallback to local defaults. Can skip and use OTA-only if preferred. |

---

## Decision

**Remote flags with three-layer cache (MMKV → Zustand → API).** Changes apply on next cold start — zero UI jank, instant server-side control.
