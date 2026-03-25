# Monetization Strategy — Mor Doo (หมอดู)

*Generated: 2026-03-24 | Status: Pre-launch*

---

## Current State

| Component | Status |
|-----------|--------|
| Tier definitions (free/standard) | Implemented |
| Server-side quota enforcement | Implemented |
| Quota display in UI | Implemented |
| Limit-reached messaging | Partial (no upgrade CTA) |
| **Paywall screen** | **Not implemented** |
| **Purchase flow (StoreKit/IAP)** | **Not implemented** |
| **Subscription management** | **Not implemented** |
| **Trial period** | **Not implemented** |

**Bottom line:** Users can hit limits but have no way to pay. This must be built before launch.

---

## Pricing Recommendation

### Current Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | ฿0 | 1 Oracle Q/day, 2 Siam Si/day, basic spreads |
| Standard | ฿149/mo | Unlimited everything, persistent memory |

### Recommended Pricing (Updated)

| Tier | Price | USD Equivalent | Notes |
|------|-------|:--------------:|-------|
| **Free** | ฿0 | $0 | Keep — generous enough for daily habit, limited enough to feel constrained |
| **Standard Monthly** | ฿149/mo | ~$4.20 | Keep — well below Western competitors (฿420-599) |
| **Standard Annual** | ฿1,190/yr | ~$33.60 | **Add this** — ฿99/mo effective (33% savings), pushes LTV up |
| **Free Trial** | 7 days | — | **Add this** — trial of Standard before committing |

### Why This Pricing Works

1. **฿149/mo is the sweet spot for Thailand** — affordable enough for mass market, premium enough to signal quality
2. **Annual at ฿1,190** (save ฿598/year = 33%) drives higher LTV — annual subscribers churn 3-5x less than monthly
3. **7-day trial** lets users experience unlimited Oracle before paying — they can't go back once they've had unlimited AI conversations
4. **No "Premium" tier yet** — keep it simple for v1. Add ฿299 tier in v2 with advanced features

### Competitor Price Comparison

| App | Monthly | Annual | Mordoo Advantage |
|-----|:-------:|:------:|-----------------|
| Co-Star | ~฿420 ($11.99) | ~฿2,800 ($79.99) | **64% cheaper** monthly |
| The Pattern | ~฿350 ($9.99) | ~฿2,450 ($69.99) | **57% cheaper** monthly |
| Sanctuary | ~฿525 ($14.99) | ~฿3,500 ($99.99) | **72% cheaper** monthly |
| Nebula | ~฿385 ($10.99) | ~฿1,750 ($49.99) | **61% cheaper** monthly |
| **Mor Doo** | **฿149** | **฿1,190** | — |

---

## Free Tier Optimization

Your free tier limits are critical — too generous and no one upgrades, too stingy and users leave.

### Current Free Limits

| Feature | Current Limit | Assessment |
|---------|:------------:|------------|
| Oracle questions | 1/day | **Correct** — enough to taste, not enough for a real conversation |
| Siam Si draws | 2/day | **Slightly generous** — consider 1/day to match Oracle |
| Daily Pulse | Unlimited | **Correct** — this is the daily habit hook, keep free |
| Persistent memory | No | **Correct** — memory is the premium differentiator |

### Recommended Adjustment

| Feature | Free | Standard | Rationale |
|---------|:----:|:--------:|-----------|
| Oracle questions | **1/day** | Unlimited | One question creates desire for more |
| Siam Si draws | **1/day** | Unlimited | Align with Oracle (1 each = simple mental model) |
| Daily Pulse | Unlimited | Unlimited | Daily habit driver — never gate this |
| Oracle memory | No | Yes | Key upgrade motivation ("the Oracle remembers you") |
| Tarot spreads | Single + 3-card | All | Gate Celtic Cross as premium |

**Why reduce Siam Si to 1/day:** Having 2 free Siam Si draws but only 1 Oracle question is asymmetric. Users feel the Oracle limit more because they can still do Siam Si. Making both 1/day creates a clean "you've used your daily cosmic reading" moment that naturally leads to the upgrade prompt.

---

## Paywall Strategy

### When to Show the Paywall

| Trigger | Priority | Expected Conversion |
|---------|:--------:|:-------------------:|
| **Quota exceeded** (hit daily limit) | Primary | 8-12% |
| **Feature gate** (taps locked feature like Celtic Cross) | Secondary | 5-8% |
| **Settings → Upgrade** (self-initiated) | Tertiary | 15-20% |
| ~~Onboarding~~ | **Never** | — |

**Primary trigger (80% of paywall views):** When the user hits their daily limit on Oracle or Siam Si, replace the generic "come back tomorrow" with the full paywall.

**Why NOT in onboarding:** Users haven't experienced value yet. Mordoo's conversion will come from the "I want more Oracle conversations" moment, not a cold pitch.

### Paywall Design

```
┌─────────────────────────────────────────┐
│                                         │
│              ✦                           │
│                                         │
│      UNLOCK YOUR FULL POTENTIAL         │
│                                         │
│   The Oracle has more to share with     │
│   you. Unlimited questions, unlimited   │
│   Siam Si, and a memory that grows      │
│   with your journey.                    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ✦ Unlimited Oracle questions     │  │
│  │  ✦ Unlimited Siam Si draws       │  │
│  │  ✦ Oracle remembers your journey  │  │
│  │  ✦ All tarot spreads unlocked    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─────────────────┐ ┌──────────────┐  │
│  │    ANNUAL        │ │   MONTHLY    │  │
│  │   ฿1,190/yr     │ │  ฿149/mo     │  │
│  │  ฿99/mo          │ │              │  │
│  │  ★ SAVE 33%      │ │              │  │
│  │  [highlighted]   │ │  [outlined]  │  │
│  └─────────────────┘ └──────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   START 7-DAY FREE TRIAL          │  │
│  │   [Gold filled button]            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Restore Purchases    Terms & Privacy   │
│                                         │
│              [X close]                  │
│                                         │
└─────────────────────────────────────────┘

Style: Full-screen modal
Background: #0a0a14 (night)
Accent: #c9a84c (gold)
Annual card: Gold border, highlighted, "SAVE 33%" badge
Monthly card: Outlined, secondary
CTA: Gold filled button, large
Close button: Top-right, visible (Apple requires this)
```

### Thai Paywall Copy

```
ปลดล็อกศักยภาพเต็มที่ของคุณ

หมอดู AI มีอีกมากที่อยากบอกคุณ
ถามไม่จำกัด เซียมซีไม่จำกัด
และหมอดูที่จดจำเส้นทางของคุณ

✦ ถามหมอดู AI ไม่จำกัด
✦ เซียมซีไม่จำกัด
✦ หมอดู AI จำบริบทการสนทนา
✦ ไพ่ทาโร่ทุกรูปแบบ

รายปี ฿1,190/ปี (฿99/เดือน) ★ ประหยัด 33%
รายเดือน ฿149/เดือน

[เริ่มทดลองฟรี 7 วัน]
```

---

## Free Trial Strategy

### 7-Day Free Trial

| Parameter | Value |
|-----------|-------|
| **Length** | 7 days |
| **Access** | Full Standard tier (unlimited everything) |
| **Billing** | Charged ฿149 or ฿1,190 at end of trial (depending on plan chosen) |
| **Cancellation** | Anytime before trial ends, no charge |

### Trial Communication Timeline

| Day | Action | Message |
|-----|--------|---------|
| 0 | Trial starts | "Your 7-day free trial has begun! Explore everything." |
| 1 | Value reminder | Push: "Your daily Prana reading is ready ✦" (normal daily push) |
| 3 | Mid-trial nudge | Push: "You've asked the Oracle 12 questions this week — unlimited access continues for 4 more days" |
| 5 | Countdown | Push: "2 days left in your trial. Keep your unlimited cosmic access." |
| 6 | Last day | Push: "Last day of your free trial — your subscription starts tomorrow" |
| 7 | Trial ends | Billing starts OR reverts to free tier |

### Trial-to-Paid Optimization

**Target:** 40-50% trial-to-paid conversion

**Key levers:**
1. **Usage depth during trial** — Users who ask 5+ Oracle questions during trial convert at 2x the rate of those who ask 1-2
2. **Persistent memory hook** — After 3+ conversations, Oracle has context. Losing that context on downgrade is painful
3. **Daily habit formation** — 7 days is enough to form the Pulse + Oracle ritual
4. **Loss aversion** — "You'll lose your conversation history" is more motivating than "Gain unlimited questions"

---

## Quota-Exceeded → Paywall Flow

### Current Experience (Broken)

```
User hits limit → "DAILY LIMIT REACHED" → "Come back tomorrow"
                                            ↑ Dead end — no upgrade path
```

### Recommended Experience

```
User hits limit → Paywall modal slides up
                  Shows: benefits + pricing + "Start Free Trial"

  ├─ User taps "Start Free Trial"
  │   → StoreKit/Play Billing purchase sheet
  │   → On success: tier upgraded, quota refreshed, continue using
  │
  ├─ User taps "Not now" / closes
  │   → Shows "Come back tomorrow for your next free reading"
  │   → Subtle "Upgrade anytime in Settings"
  │
  └─ User taps "Restore Purchases"
      → Checks for active subscription
      → If found: restore tier, refresh quota
```

---

## Revenue Projections

### Conservative Scenario (Month 1-3)

| Metric | Month 1 | Month 2 | Month 3 |
|--------|:-------:|:-------:|:-------:|
| Total installs | 2,000 | 3,500 | 6,000 |
| Active users | 1,200 | 2,500 | 4,500 |
| Trial starts (5% of active) | 60 | 125 | 225 |
| Trial-to-paid (45%) | 27 | 56 | 101 |
| Monthly subs (฿149) | 20 | 40 | 70 |
| Annual subs (฿1,190) | 7 | 16 | 31 |
| **Monthly revenue** | **฿11,310** | **฿24,990** | **฿47,320** |
| Cumulative subscribers | 27 | 83 | 184 |

### Key Assumptions
- 5% of active users see paywall and start trial
- 45% trial-to-paid conversion
- 70/30 split monthly/annual
- 10% monthly churn rate
- Revenue grows as subscriber base accumulates

---

## Implementation Roadmap

### Phase 1: Core Purchase Flow (MUST have for launch)

| Task | Priority | Effort |
|------|:--------:|:------:|
| Install RevenueCat or expo-iap | Critical | Medium |
| Create subscription products in App Store Connect + Google Play Console | Critical | Small |
| Build paywall screen component | Critical | Medium |
| Wire paywall to quota-exceeded trigger | Critical | Small |
| Add "Upgrade" button in Settings/Profile | Critical | Small |
| Add "Restore Purchases" functionality | Critical | Small |
| Server-side receipt validation | Critical | Medium |
| Update tier in profiles table on purchase | Critical | Small |

### Phase 2: Trial & Messaging (Launch week)

| Task | Priority | Effort |
|------|:--------:|:------:|
| Configure 7-day free trial in store products | High | Small |
| Build trial countdown notifications | High | Medium |
| Add trial status display in profile | Medium | Small |
| Track trial analytics events | Medium | Small |

### Phase 3: Optimization (Month 1-2)

| Task | Priority | Effort |
|------|:--------:|:------:|
| A/B test paywall copy/design | Medium | Medium |
| A/B test annual vs monthly as default | Medium | Small |
| Add promotional offers (first month ฿99) | Low | Medium |
| Add annual-only discount for trial users | Low | Small |
| Implement win-back offers for churned users | Low | Medium |

---

## RevenueCat vs expo-iap

### Recommendation: RevenueCat

| Factor | RevenueCat | expo-iap |
|--------|-----------|----------|
| Setup complexity | Easy (SDK + dashboard) | Medium (manual StoreKit/Billing) |
| Cross-platform | iOS + Android unified | Separate implementations |
| Receipt validation | Built-in server-side | You build it |
| Analytics | Built-in dashboard | You build it |
| Subscription management | Built-in | You build it |
| Price | Free up to $2,500/mo revenue | Free |
| Webhook support | Yes (for server-side tier updates) | No |

**RevenueCat is free until you hit $2,500/month** (then 1% of revenue). For a bootstrapped app, this is the right choice — it handles receipt validation, subscription status, cross-platform, and analytics that would take weeks to build manually.

### RevenueCat + Supabase Integration

```
User purchases → RevenueCat validates receipt
  → RevenueCat webhook fires → Vercel API endpoint
    → Updates profiles.tier = 'standard'
    → User's next API call gets unlimited quotas

User cancels → RevenueCat detects expiration
  → Webhook fires → API endpoint
    → Updates profiles.tier = 'free'
    → User reverts to free limits at next period
```

---

## Analytics Events

```
paywall_shown              — Paywall modal displayed (trigger source)
paywall_dismissed           — User closed without action
paywall_plan_selected      — User tapped monthly or annual
trial_started              — Free trial began
trial_converted            — Trial → paid subscription
trial_expired              — Trial ended without payment
subscription_started       — New paying subscriber
subscription_renewed       — Existing subscriber renewed
subscription_cancelled     — User cancelled (still active until period end)
subscription_expired       — Subscription ended (tier reverted)
restore_purchases_tapped   — User tapped restore
restore_purchases_success  — Active subscription found and restored
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Users upset by limits after being free | Free tier is generous (1 Q/day + 1 draw + unlimited Pulse). Messaging: "Your free daily reading is ready!" — frame as gift, not restriction |
| Low trial conversion | Push usage during trial via notifications. Show conversation count: "You've asked 8 questions this week" |
| App Store rejection (paywall) | Ensure close button is visible, restore purchases works, terms/privacy linked |
| Revenue too low to sustain API costs | Claude API costs ~$0.01-0.03 per Oracle question. At 1 free Q/day per user, costs are manageable. Standard subscribers generate ฿149/mo vs ~฿30-90/mo in API costs = healthy margin |

---

## Next Steps

- **Build the paywall + purchase flow** — this is the #1 pre-launch blocker for monetization
- `/app-analytics` — Set up revenue and conversion tracking
- `/subscription-lifecycle` — Optimize trial → paid → renewal → winback
- `/retention-optimization` — Reduce churn to maximize LTV
