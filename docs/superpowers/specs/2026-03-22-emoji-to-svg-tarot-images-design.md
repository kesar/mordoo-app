# Replace Emoji with SVG Icons & Tarot-Style Images

**Date:** 2026-03-22
**Status:** Approved

## Problem

Emoji characters (`📅`, `♥`, `◆`, etc.) render as `?` on devices where the app's custom fonts (CinzelDecorative, CormorantGaramond, NotoSansThai) override emoji rendering. This affects multiple screens, most notably the birth-data screen ("Phase 2 of 6").

## Decision

Hybrid approach: SVG icon components for small/functional UI elements, tarot-style generated WebP images for larger visual elements.

---

## SVG Icon Library

**File:** `src/components/icons/TarotIcons.tsx`

Single centralized file exporting all SVG icon components using `react-native-svg`. All icons accept `size` and `color` props with defaults (`size=24`, `color=colors.gold.DEFAULT`). Drawn with thin strokes and angular, tarot-inspired geometry.

### Icons

| Component | Replaces | Used in |
|-----------|----------|---------|
| `CalendarIcon` | `📅` | birth-data decorative |
| `LocationPinIcon` | `📍` | birth-data place row |
| `SearchIcon` | `🔍` | birth-data place search |
| `InfoCircleIcon` | `ℹ️` | birth-data info note, general |
| `SparkleIcon` | `✨` `✦` | name-numbers decorative, soul-gate divider/footer, pulse header |
| `ArrowRightIcon` | `→` | lucky direction (pulse, soul-snapshot) |
| `ArrowLeftIcon` | `←` | soul-snapshot back nav |
| `ChevronRightIcon` | `>` | oracle siam-si arrow |
| `QuoteIcon` | `❝` | soul-snapshot insight card |
| `BusinessStarIcon` | `★` | sub-scores (pulse, soul-snapshot) |
| `HeartIcon` | `♥` | sub-scores (pulse, soul-snapshot) |
| `BodyDiamondIcon` | `◆` | sub-scores (pulse, soul-snapshot) |
| `ChevronLeftIcon` | `<` | siam-si back nav |
| `CheckIcon` | `✓` | power-ups toggle enabled state |
| `SendArrowIcon` | (inline SVG) | oracle input send button |
| `StarIcon` | (moved from oracle) | oracle mode toggle, pulse tab bar |
| `LockIcon` | (moved from oracle) | oracle strategist mode |
| `BambooIcon` | (moved from oracle) | oracle siam-si card, siam-si screen cup icon (`🎋`) |
| `OracleHeartIcon` | (moved from _layout) | oracle tab bar icon |

---

## Tarot-Style Images

**Directory:** `assets/images/tarot/`
**Format:** WebP, single high-res file at 3x (288x288 for icons, 384x384 for emblem). Single file per image (no @1x/@2x variants) for simplicity — React Native scales down on lower-density devices.
**Generation:** Gemini CLI with consistent tarot card aesthetic prompt

### Images

| File | Replaces | Used in | Size |
|------|----------|---------|------|
| `emblem-soul-gate.webp` | `◆` diamond | soul-gate emblem | 384x384 |
| `concern-love.webp` | `♥` | life-context chip | 288x288 |
| `concern-career.webp` | `★` | life-context chip | 288x288 |
| `concern-money.webp` | `◈` | life-context chip | 288x288 |
| `concern-health.webp` | `✦` | life-context chip | 288x288 |
| `concern-family.webp` | `♦` | life-context chip | 288x288 |
| `concern-spiritual.webp` | `◎` | life-context chip | 288x288 |
| `powerup-location.webp` | `◉` | power-ups card | 288x288 |
| `powerup-notifications.webp` | `✧` | power-ups card | 288x288 |

### Gemini CLI Prompt Template

```
Generate a tarot card style icon on a transparent background.
Style: gold linework on dark/transparent, mystical, angular geometry,
thin ornate lines, inspired by Rider-Waite tarot illustrations.
Color palette: gold (#c9a84c), light gold (#f4e8c1), dark background (#0a0a14).
Subject: [DESCRIPTION]
Size: [WIDTH]x[HEIGHT]px, WebP format.
```

---

## Screens Affected

| Screen | File | Changes |
|--------|------|---------|
| Soul Gate | `app/(onboarding)/soul-gate.tsx` | `◆` → tarot emblem image, `✦` → `SparkleIcon` |
| Birth Data | `app/(onboarding)/birth-data.tsx` | `📅` → `CalendarIcon`, `📍` → `LocationPinIcon`, `🔍` → `SearchIcon`, `ℹ️` → `InfoCircleIcon` |
| Name Numbers | `app/(onboarding)/name-numbers.tsx` | `✨` → `SparkleIcon` |
| Life Context | `app/(onboarding)/life-context.tsx` | 6 concern emoji → tarot images |
| Power-Ups | `app/(onboarding)/power-ups.tsx` | `◉` `✧` → tarot images, `✓` → `CheckIcon` |
| Soul Snapshot | `app/(onboarding)/soul-snapshot.tsx` | `★♥◆` → SVG icons, `❝` → `QuoteIcon`, `→←` → arrow icons |
| Pulse | `app/(main)/pulse/index.tsx` | `✦` → `SparkleIcon`, `★♥◆` → SVG icons, `→` → `ArrowRightIcon` |
| Siam Si | `app/(main)/oracle/siam-si.tsx` | `🎋` → `BambooIcon`, `<` → `ChevronLeftIcon` |
| Oracle | `app/(main)/oracle/index.tsx` | Move inline SVGs to centralized file, `>` → `ChevronRightIcon`, send button SVG → `SendArrowIcon` |
| Tab Bar | `app/(main)/_layout.tsx` | Import `StarIcon`, `OracleHeartIcon` from centralized file |

---

## Documentation Deliverable

Create `docs/icon-and-image-guide.md` covering:
- When to use SVG icon vs tarot image
- How to add new SVG icons to `TarotIcons.tsx`
- Gemini CLI prompt template for generating new tarot images
- Asset naming conventions (`concern-*.webp`, `powerup-*.webp`, `emblem-*.webp`)
- Image sizing guidelines (288x288 for standard, 384x384 for emblems)
