# V1/V2 Feature Split — Landing Page Simplification

**Date:** 2026-03-20
**Status:** Approved

## Problem

The current landing page promises 20+ features across five "realms," three pricing tiers, and four micro-transactions. For MVP, we need to ship a focused v1 and defer the rest to v2 while still teasing what's coming.

## Decision

Approach B: Collapse to 2 full realm cards for v1 features, replace the remaining 3 realms with a compact "Coming Soon" teaser strip. Simplify pricing to 2 tiers.

---

## V1 Scope (Ship It)

### Realm Cards (full display)

These are the **exact bullet points** to show on each realm card:

**The Pulse**
- Daily Energy Score (0-100)
- Lucky color, number & direction

Remove from current card: "Power Windows" and "Cosmic news correlated with market data" (both deferred to v2).

**The Oracle**
- AI chat reading (Thai, Chinese & Western astrology)
- Digital Siam Si (fortune stick ceremony)
- Shareable Soul Snapshot

Remove from current card: "Full 78-card Tarot with context-aware meanings" (v2), "Persistent memory across sessions" (keep only in Standard pricing, not on realm card), "Prediction tracker with accuracy scoring" (v2). Add: "AI chat reading" and "Shareable Soul Snapshot" which are not on the current card.

### Pricing (2 tiers)

| Freemium (฿0) | Standard (฿149/mo) |
|---|---|
| Daily Energy Score | Everything in Free |
| 1 Oracle question per day | Unlimited Oracle questions |
| Single tarot card draw | Siam Si (unlimited) |
| Lucky color, number & direction | Persistent AI Memory |
| Siam Si (5x per month) | |
| Shareable Soul Snapshot | |

"Sweet Spot" badge stays on Standard.

**Standard keeps:** Everything in Free, Unlimited Oracle questions, Siam Si (unlimited), Persistent AI Memory.

**Remove from Standard tier:** Full 78-card Tarot spreads, Power Windows (hourly chart), Auspicious Date Finder, Partner Compatibility, GPS Temple Recommendations, Weekly Digital Amulet.

**Remove entirely:** Premium tier (฿299/mo) and all micro-transaction pills (Custom Amulet Pack ฿79, Deep Dive Report ฿149, Year Ahead Forecast ฿299, Gift Reading ฿199).

### Section Titles

- Realms section: Update "Five Realms of Insight" → "Realms of Insight" / Thai: "ภพแห่งปัญญา"
- Pricing section: No title change needed

### Unchanged Sections
- **How It Works** — 3-step flow (Enter Birth Data → Choose Your Concern → Receive Soul Snapshot)
- **Why Mor Doo** — No changes needed (price reference already shows ฿149 vs ฿599+)
- **Hero, CTAs, footer, testimonial** — No changes

---

## V2 Scope (Coming Soon)

Deferred features tracked in `docs/v2-roadmap.md`.

### Coming Soon Teaser Strip

Appears below the two v1 realm cards. Layout: **horizontal row on desktop (3 columns), vertical stack on mobile**. Each item:

- Realm icon (reuse existing `realm-*.webp` images, displayed smaller)
- Realm name
- One-line description:
  - **The Compass:** "Auspicious dates, compatibility & lucky numbers"
  - **The Sanctuary:** "Temple finder, digital amulets & ritual guides"
  - **The Archive:** "Life Map, chart comparisons & prophecy log"
- "Coming Soon" badge (small pill-style label)

Styling: Same card background/border as realm cards but ~50% the height. No feature bullet lists. Follows existing 768px breakpoint for mobile.

### Removed from Landing Page
- **Premium tier** (฿299/mo) — all its features are v2
- **Micro-transactions** — all four pills
- V2-only features from Pulse and Oracle realm cards (listed above)
- CSS for removed elements: `.pricing-cta-elite`, `.micro-tx`, `.micro-tx-pill`, `.micro-tx-price` — remove dead styles

---

## Ancillary Changes

- **JSON-LD structured data** (head): Remove the Premium ฿299 offer, keep only Freemium and Standard ฿149
- **CSS pricing grid**: Change `grid-template-columns: repeat(3, 1fr)` → `repeat(2, 1fr)` (or equivalent for 2-column layout)
- **Dead CSS cleanup**: Remove styles for Premium tier and micro-transaction elements

---

## Implementation Summary

1. Update Pulse realm card — remove 2 v2 features, keep 2
2. Update Oracle realm card — remove 3 v2 features, add 2 v1 features
3. Replace Compass/Sanctuary/Archive cards with "Coming Soon" teaser strip
4. Update section title ("Five Realms" → "Realms of Insight")
5. Remove Premium pricing tier
6. Slim down Standard tier features (remove 6 items)
7. Add "Single tarot card draw" to Freemium if not already worded correctly
8. Remove micro-transaction pills
9. Update JSON-LD structured data (remove Premium offer)
10. Update CSS: pricing grid columns, remove dead styles
11. `docs/v2-roadmap.md` created with all deferred features
12. Add Thai translations (`data-i18n-th`) for all new/changed text strings

### i18n Note

All elements use `data-i18n-en` / `data-i18n-th` attributes. Thai translations are needed for:
- New Oracle card bullets: "AI chat reading" and "Shareable Soul Snapshot"
- Coming Soon one-liners for Compass, Sanctuary, Archive
- "Coming Soon" badge text → "เร็วๆ นี้"
- Updated section title "Realms of Insight" → "ภพแห่งปัญญา"
