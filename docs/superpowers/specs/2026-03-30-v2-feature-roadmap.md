# Mordoo v2 Feature Roadmap

**Last updated:** 2026-03-30
**Status:** Planning — implementation begins after App Store acceptance

---

## Design Philosophy

### Core Principle: Deepen, Don't Expand

The current 3-tab structure (Pulse / Oracle / Profile) is the app's strength. Users have a clear daily ritual: open → check Pulse → ask Oracle. Every new feature must enhance this ritual or live quietly behind it — never compete with it.

### UX Rules

1. **One screen per visit, not five** — The user opens, sees Pulse, gets their number. Everything below the fold is optional discovery.
2. **Features appear, not announce** — No tutorials, no modals, no "NEW!" badges. Features show up naturally in the flow.
3. **No new tabs** — Adding a 4th tab is the single biggest UX mistake we could make. New features go inside existing tabs.
4. **Notifications are features, not settings** — Celestial events and transit alerts don't need screens — they're push notifications that deep-link to contextual content.
5. **The one-line test** — Every feature must pass: "Can I explain where to find it in one sentence without saying 'go to a new screen'?"

---

## Current App Structure

```
Tab 1: PULSE        — Daily energy score, sub-scores, lucky elements, share card
Tab 2: ORACLE       — AI chat, Siam Si fortune sticks
Tab 3: PROFILE      — Birth data, zodiac signs, settings, subscription
```

## Proposed v2 Structure (same 3 tabs, richer layers)

```
Tab 1: PULSE
  ├── Energy Score Ring (existing)
  ├── Card of the Day (NEW — inline, below score)
  ├── Life Phase banner (NEW — small, tappable)
  ├── Sub-scores (existing)
  └── Streak counter (NEW — subtle bottom bar)

Tab 2: ORACLE
  ├── Segment control: [ Chat | Siam Si | Match ]
  │   ├── Chat (existing AI Oracle)
  │   ├── Siam Si (existing fortune sticks)
  │   └── Match (NEW — compatibility)
  └── After any reading: optional reflection prompt (NEW)

Tab 3: PROFILE
  ├── Your Numbers (existing)
  ├── Journal (NEW — entry point to reflections)
  ├── Year-Ahead Forecast (NEW — premium)
  ├── Learn (NEW — educational content)
  └── Settings / Subscription / Account (existing)
```

---

## Phase 1: Deepen the Daily Ritual (v2.0)

Target: 3-4 weeks after App Store acceptance. Zero new screens to navigate — enriches existing ones.

### 1.1 Daily Check-in Streaks

| Attribute | Detail |
|---|---|
| **What** | Track consecutive days the user views their Pulse. Show streak count on Pulse screen. Milestones at 7, 30, 100 days with subtle celebration animations. |
| **Where** | Bottom of Pulse screen — small bar showing flame icon + streak count. |
| **Why** | Duolingo proved streaks drive daily retention better than any other mechanism. Apps that added streaks saw 40%+ improvement in D7 retention. Mordoo already has a natural daily ritual (Pulse) — just needs the streak wrapper. |
| **Complexity** | Low |
| **Effort** | ~3-5 days |
| **Changes** | New Zustand store (`streakStore.ts`), new DB column on `profiles` table (`current_streak`, `longest_streak`, `last_streak_date`), small UI component on Pulse screen. |
| **Adoption likelihood** | High (80%) — passive feature, user doesn't need to do anything new |
| **Revenue impact** | Indirect — increases daily opens → more subscription conversions |
| **Monetization** | Free for all users. Streaks increase engagement which drives upgrades. |

### 1.2 Card of the Day

| Attribute | Detail |
|---|---|
| **What** | Daily wisdom card drawn from a pool of ~50-100 cards themed around Thai proverbs, Buddhist teachings, and numerology insights. Beautiful illustration, brief meaning, ties to daily reading. Not full tarot — lighter, quicker. |
| **Where** | Inline on Pulse screen, between Energy Score and Sub-scores. Card appears with a subtle fade-in. One tap to flip/reveal. |
| **Why** | Nebula's "Card of the Day" is their most-opened feature. It's a 5-second daily ritual that creates habit. Siam Si already exists but costs a "draw" — this is a free daily micro-ritual that gives users a second reason to open beyond the energy score. |
| **Complexity** | Low |
| **Effort** | ~3-5 days (content creation for cards is the main effort) |
| **Changes** | New shared module with card data (similar to `siam-si.ts`), deterministic daily selection based on user+date hash, inline component on Pulse screen. No new API endpoint needed — computed client-side from shared logic. |
| **Adoption likelihood** | High (80%) — appears automatically, no opt-in needed |
| **Revenue impact** | Low direct, high retention impact |
| **Monetization** | Free. Could gate "card history" or "card collection" behind Standard tier later. |

### 1.3 Compatibility / Relationship Matching

| Attribute | Detail |
|---|---|
| **What** | User enters a partner or friend's name + birth date → generates compatibility report with scores across 5 dimensions: Love, Communication, Conflict, Growth, Spiritual Connection. Beautiful shareable card. |
| **Where** | Oracle tab → third segment in a segment control: `[ Chat | Siam Si | Match ]`. Tapping Match opens inline form to enter partner data, then shows results. |
| **Why** | This is the #1 growth driver in every successful astrology app. Co-Star, The Pattern, and Sanctuary all credit compatibility features for viral growth. Users screenshot results and share them on LINE/Instagram, driving organic installs. |
| **Complexity** | Medium |
| **Effort** | ~2-3 weeks |
| **Changes** | New computation logic in `shared/` (extend numerology engine for two-person comparison), new API endpoint (`api/oracle/compatibility`), new screen within Oracle tab, new share card component, save partner data for repeat comparisons. |
| **Adoption likelihood** | Very High (90%) — relationship curiosity is universal |
| **Revenue impact** | High — gate detailed breakdowns behind Standard; basic score free |
| **Monetization** | Free: overall compatibility score + 1 dimension detail. Standard: all 5 dimensions + AI Oracle interpretation of the match + shareable detailed card. Premium: unlimited saved partners. |

### 1.4 LINE Sharing Integration

| Attribute | Detail |
|---|---|
| **What** | Deep link sharing via LINE with rich message previews. Share compatibility results, daily readings, Siam Si draws directly as LINE messages. |
| **Where** | Existing share buttons everywhere — add LINE as primary share target (detect if LINE installed, show as first option). |
| **Why** | LINE has 54M users in Thailand. Instagram sharing works globally but LINE is how Thais share. This is table-stakes for the Thai market. |
| **Complexity** | Low |
| **Effort** | ~3-5 days |
| **Changes** | LINE SDK integration, rich link preview meta tags for deep links, update share sheet to prioritize LINE on Thai locale devices. |
| **Adoption likelihood** | Very High in Thailand (85%), low elsewhere |
| **Revenue impact** | Medium — primary organic growth channel for target market |
| **Monetization** | Free. Growth feature. |

---

## Phase 2: Depth for Engaged Users (v2.1)

Target: 3-4 weeks after Phase 1. Adds medium-term engagement hooks and premium value.

### 2.1 Life Cycles / Monthly Phases

| Attribute | Detail |
|---|---|
| **What** | Based on birth data + numerology, compute what larger life phase the user is in. Phases last 2-6 weeks: "Creativity Cycle", "Relationship Transformation", "Financial Growth", "Inner Reflection", etc. Show current phase with days remaining, guidance, and what to expect next. Notify when entering a new phase. |
| **Where** | Small banner on Pulse screen (below Card of the Day). Tapping opens a detail sheet showing current phase description, guidance, and upcoming phases calendar. |
| **Why** | The Pattern's "cycles" feature is their stickiest feature — users keep coming back to see if their current phase explains their life experience. Creates medium-term engagement (weeks) vs. daily readings (hours). Users say "The Pattern knew I was going through something before I did." |
| **Complexity** | Medium |
| **Effort** | ~2-3 weeks |
| **Changes** | New computation logic in `shared/` (phase calculation from birth data + current date), new API endpoint, banner component on Pulse, detail sheet, push notification for phase transitions. |
| **Adoption likelihood** | High (80%) — passive discovery, appears on Pulse |
| **Revenue impact** | High — strong retention driver, phase details can be gated |
| **Monetization** | Free: phase name + "You're in a Creativity Cycle." Standard: full guidance, upcoming phases, phase history. Premium: AI Oracle deep-dive on current phase. |

### 2.2 Reflection Journal

| Attribute | Detail |
|---|---|
| **What** | After viewing Pulse or completing an Oracle reading, a subtle prompt appears: "How does this resonate with you?" User can write a short reflection (optional, dismissable). Reflections are saved and viewable alongside the reading they were tied to. Monthly reflection summary generated by AI. |
| **Where** | Prompt appears inline after readings (Pulse, Oracle, Siam Si). Journal archive lives in Profile tab → "Journal" section. |
| **Why** | CHANI's journaling feature is their #2 retention driver. Transforms passive consumption into active engagement. Users who journal 3+ times/week retain at 4x the rate of passive users (industry data from wellness apps). Also strengthens the "self-discovery" positioning vs. "fortune telling." |
| **Complexity** | Low-Medium |
| **Effort** | ~1-2 weeks |
| **Changes** | New DB table (`journal_entries`), journal input component (appears inline after readings), journal archive screen in Profile, monthly summary endpoint (AI-generated). |
| **Adoption likelihood** | Medium-High (70%) — optional prompt, some users will love it, others will dismiss |
| **Revenue impact** | Medium — premium feature for monthly summaries |
| **Monetization** | Free: write reflections, view last 7 days. Standard: full journal archive + search. Premium: AI-generated monthly reflection summary. |

### 2.3 Transit & Celestial Event Notifications

| Attribute | Detail |
|---|---|
| **What** | Push notifications for: full moons, new moons, Mercury retrograde, eclipses, and Thai Buddhist holidays (Wan Phra, Songkran, Loy Krathong). Personalized: "Full Moon in your 7th house tonight — relationships in focus. Your energy peaks at 82." |
| **Where** | No dedicated screen. Notifications deep-link to Pulse with contextual banner at top showing the event. User configures notification preferences in Profile → Settings. |
| **Why** | These are the highest-engagement notifications across all astrology apps. Users opt-in because they feel relevant and timely. Thai Buddhist calendar integration is unique and culturally authentic — no competitor does this. |
| **Complexity** | Low-Medium |
| **Effort** | ~1 week |
| **Changes** | Celestial event calendar data (static JSON or computed), notification scheduling logic (server-side cron or Expo scheduled notifications), personalization based on birth chart, settings UI for notification preferences. |
| **Adoption likelihood** | High (75%) — users love celestial event alerts |
| **Revenue impact** | Medium — re-engagement driver for lapsed users |
| **Monetization** | Free: major events (full moon, new moon). Standard: all events + personalized interpretation. |

### 2.4 Premium Tier (฿299/mo)

| Attribute | Detail |
|---|---|
| **What** | Third subscription tier above Standard. Includes: AI Oracle with longer context window, year-ahead forecast, detailed compatibility reports, monthly AI-generated reflection summaries, exclusive monthly deep-reading, and priority AI responses. |
| **Where** | Profile → Subscription section. Premium features marked with subtle badge throughout app. |
| **Why** | Currently only Free (฿0) and Standard (฿149). A Premium tier captures users with higher willingness to pay. The Pattern, CHANI, and Nebula all have premium tiers representing 20-30% of revenue from 5-10% of paying users. Even 100 premium users = ฿29,900/mo extra revenue. |
| **Complexity** | Low |
| **Effort** | ~1 week |
| **Changes** | New RevenueCat product, update `tiers.ts`, update paywall UI, gate premium features behind new tier check. |
| **Adoption likelihood** | Medium (50%) of existing Standard users upgrading |
| **Revenue impact** | Very High — direct ARPU increase |
| **Monetization** | Direct revenue. |

---

## Phase 3: Premium Depth (v2.2)

Target: 4-6 weeks after Phase 2. Premium value features that justify subscription and build authority.

### 3.1 Year-Ahead Forecast

| Attribute | Detail |
|---|---|
| **What** | Comprehensive 12-month reading generated by AI based on birth data. Month-by-month predictions for career, love, health, finances. Generated once per year, cached, viewable anytime. Regenerated when a new year begins or user's birthday passes. |
| **Where** | Profile tab → "Your 2026 Forecast" section with premium badge. |
| **Why** | CHANI's yearly readings are their biggest subscription conversion driver. Users sign up specifically to get the year-ahead forecast. Creates anticipation and long-term value. Natural marketing moment: Thai New Year (Songkran, April) and calendar New Year. |
| **Complexity** | Medium |
| **Effort** | ~2 weeks |
| **Changes** | New API endpoint using Claude for generation, caching layer (generate once, serve many times), dedicated forecast screen with month-by-month navigation, premium gate. |
| **Adoption likelihood** | Medium-High (65%) — strong draw for premium subscribers |
| **Revenue impact** | High — primary premium subscription driver |
| **Monetization** | Premium tier only. |

### 3.2 Educational Content Library

| Attribute | Detail |
|---|---|
| **What** | Articles and guides explaining: Thai numerology basics, Siam Si tradition and history, zodiac meanings (Western + Chinese + Thai), Buddhist astrology concepts, how Life Path numbers work, the meaning of each Siam Si stick. |
| **Where** | Profile tab → "Learn" section. List of articles with categories. |
| **Why** | Builds authority, helps with ongoing App Store 4.3(b) positioning ("cultural education" not "fortune telling"), keeps casual users engaged while learning. Gives the app depth beyond daily utility. Also great for SEO if a web version is ever added. |
| **Complexity** | Low-Medium |
| **Effort** | ~2 weeks (mostly content writing) |
| **Changes** | Content files (markdown or JSON), article list screen, article detail screen in Profile tab. Could be generated by AI and curated. |
| **Adoption likelihood** | Medium (50%) — appeals to curious users, not daily ritual users |
| **Revenue impact** | Low direct, high strategic value |
| **Monetization** | Free (all content). Strategic value for positioning. |

### 3.3 Audio Affirmations

| Attribute | Detail |
|---|---|
| **What** | Short (2-5 min) guided affirmations tied to the day's reading. "Today your energy is in a creativity cycle — here's a 3-minute visualization to unlock it." Bilingual (Thai narrator + English narrator). |
| **Where** | Play button on Card of the Day component on Pulse screen. Audio plays inline (not a new screen). |
| **Why** | CHANI's audio Sunday readings are their most beloved feature. Audio content has higher perceived value than text. Thai meditation tradition (สมาธิ) ties naturally to the app's cultural identity. |
| **Complexity** | Medium |
| **Effort** | ~2-3 weeks (recording/generating audio is the main effort) |
| **Changes** | Audio files (hosted or generated), audio player component, download/cache logic for offline playback, content tied to card/reading types. |
| **Adoption likelihood** | Medium (55%) — niche but high value for those who use it |
| **Revenue impact** | Medium — strong premium perceived value |
| **Monetization** | Premium tier only. One free sample to demonstrate value. |

---

## Features Deliberately Excluded

| Feature | Reason |
|---|---|
| **Community / Social Feed** | Moderation burden too high for a small team. Let LINE/Instagram be the social layer. Revisit at 100K+ users. |
| **Apple Watch App** | Low adoption (~30%), high effort (~2 weeks native Swift). Revisit when user base exceeds 50K. |
| **Biorhythm Tracker** | Overlaps conceptually with Pulse energy score. Would confuse the narrative — "Is my energy 72 or is my biorhythm at a peak?" Pick one system. |
| **Live Activities** | Cool technology but users don't need their horoscope on the Dynamic Island. Lock screen widget already covers glanceable info. |
| **Full Tarot System** | Siam Si is the cultural differentiator. Adding Western tarot dilutes the Thai identity and puts us back in 4.3(b) territory. |
| **Video Content** | High production cost, unclear value over text/audio for this use case. |

---

## Revenue Model Summary

```
Free (฿0)
├── 1 Pulse reading/day
├── 1 Oracle question/day
├── 1 Siam Si draw/day
├── Card of the Day
├── Streak tracking
├── Basic compatibility score
├── Widgets
└── 7-day journal access

Standard (฿149/mo)
├── Everything in Free
├── Unlimited Oracle questions
├── Unlimited Siam Si draws
├── Persistent Oracle memory
├── Full compatibility reports (5 dimensions)
├── Full journal archive + search
├── All celestial event notifications
├── Life Phase full guidance
└── Shareable detailed cards

Premium (฿299/mo)
├── Everything in Standard
├── Year-Ahead Forecast (12-month AI reading)
├── Monthly AI reflection summary
├── Audio affirmations
├── Unlimited saved partners (compatibility)
├── AI deep-dive on current Life Phase
├── Priority AI responses
└── Exclusive monthly deep-reading
```

---

## Success Metrics

| Phase | Key Metric | Target |
|---|---|---|
| Phase 1 | D7 retention | +15% (streaks + card of the day) |
| Phase 1 | Organic installs | +25% (compatibility sharing via LINE) |
| Phase 2 | D30 retention | +20% (life cycles + journal) |
| Phase 2 | Subscription conversion | +10% (premium tier launch) |
| Phase 3 | ARPU | +30% (premium tier + year forecast) |
| Phase 3 | Churn reduction | -15% (audio + education depth) |

---

## Implementation Notes

- All new computation logic goes in `shared/` (reusable between app and API)
- All new features need bilingual support (add to `src/i18n/en/` and `src/i18n/th/`)
- New DB tables need RLS policies (users can only access their own data)
- New API endpoints follow existing auth pattern (Supabase bearer token)
- Feature flags in `src/config/features.ts` for gradual rollout
- PostHog events for all new feature interactions
