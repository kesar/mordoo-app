# Zodiac Profile Cards

**Date:** 2026-03-25
**Status:** Draft

## Summary

Add Western zodiac and Chinese zodiac cards to the profile page, positioned directly below the user's avatar/name card. Each card displays a custom illustration, sign name, element, ruling planet (or guardian), and a brief personality trait — all served from the API so content can be updated without an app release. 24 custom zodiac illustrations are generated via Gemini CLI in the Mordoo gold-on-dark mystical style.

## Motivation

The profile page is currently settings-heavy. Adding personalized zodiac cards makes it feel richer and more personal — the user sees their astrological identity front and center.

## Design Decisions

- **API-served content:** Sign names, elements, traits, and translations come from the API so they can be modified server-side without app updates.
- **Shared computation logic:** The date-to-sign mapping lives in `shared/zodiac.ts` so both API and any future client usage share the same logic.
- **Two separate cards:** Each zodiac system (Western, Chinese) gets its own `SacredCard`, matching the existing profile card pattern.
- **No database table needed:** Zodiac is deterministic from birth date — no storage required.

## API

### `POST /api/zodiac/signs`

**Auth:** Supabase bearer token (required)

**Request body:**
```json
{
  "dateOfBirth": "1990-03-25",
  "lang": "en"
}
```

**Response:**
```json
{
  "western": {
    "sign": "aries",
    "name": "Aries",
    "element": "Fire",
    "rulingPlanet": "Mars",
    "dateRange": "Mar 21 – Apr 19",
    "traits": "Bold, courageous, and full of energy",
    "image": "aries"
  },
  "chinese": {
    "animal": "horse",
    "name": "Horse",
    "element": "Fire",
    "traits": "Energetic, free-spirited, and adventurous",
    "image": "horse"
  }
}
```

The `image` field is a key that maps to a local asset on the client (e.g., `aries` → `assets/images/zodiac/western/aries.webp`).

## Shared Logic — `shared/zodiac.ts`

### `getWesternZodiacSign(dateOfBirth: string): string`

Returns the sign key (e.g., `"aries"`, `"taurus"`) based on month and day. Standard date ranges for all 12 signs.

### `getChineseZodiacAnimal(dateOfBirth: string): string`

Returns the animal key (e.g., `"rat"`, `"ox"`) using the lunar year cycle. Simplified calculation using year modulo 12.

### Content Maps (API-side only)

Two lookup objects — one for Western signs, one for Chinese animals — containing bilingual content:

```typescript
const WESTERN_SIGNS: Record<string, {
  nameEn: string; nameTh: string;
  element: string; elementTh: string;
  rulingPlanet: string; rulingPlanetTh: string;
  dateRange: string;
  traitsEn: string; traitsTh: string;
}>;

const CHINESE_ANIMALS: Record<string, {
  nameEn: string; nameTh: string;
  element: string; elementTh: string;
  traitsEn: string; traitsTh: string;
}>;
```

These live in the API codebase so they can be updated via deployment without an app release.

## Image Assets

- **24 custom illustrations** generated via Gemini CLI
- **Style:** Gold-on-dark mystical aesthetic matching existing tarot assets (gold linework, deep purple/navy backgrounds, mystical atmosphere)
- **Format:** WebP, optimized for mobile
- **Location:**
  - `assets/images/zodiac/western/{sign}.webp` (12 files: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces)
  - `assets/images/zodiac/chinese/{animal}.webp` (12 files: rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig)
- **Size:** ~80x80 display size, generate at 2x (160x160) for retina

## UI Component — `src/components/ZodiacCard.tsx`

A reusable card component used for both Western and Chinese zodiac.

**Props:**
```typescript
interface ZodiacCardProps {
  systemLabel: string;     // "Western Zodiac" / "ราศีตะวันตก"
  signName: string;        // "Aries" / "ราศีเมษ"
  element: string;         // "Fire" / "ไฟ"
  detail: string;          // ruling planet or guardian
  traits: string;          // brief personality line
  image: ImageSourcePropType;
}
```

**Layout:**
- Wraps in `SacredCard` (variant `"low"`)
- Left: sign illustration (48x48, borderRadius 10, subtle gold border)
- Right column:
  - System label: gold, uppercase, xs font, letter-spacing
  - Sign name: parchment, lg font, display font
  - Detail line: outline color, sm font — "🔥 Fire · Mars · Bold & Courageous"

## Profile Integration

In `app/(main)/profile/index.tsx`:

1. Add React Query call to `fetchZodiacSigns(profile.dateOfBirth, language)`, enabled when `profile.dateOfBirth` exists
2. Place two `ZodiacCard` components between the profile card and the subscription section
3. Show a subtle loading shimmer while fetching (same pattern as profile card loading)
4. If no birth date or API error, zodiac cards are simply not rendered

## Client Service — `src/services/zodiac.ts`

```typescript
export async function fetchZodiacSigns(
  dateOfBirth: string,
  lang: string
): Promise<ZodiacSignsResponse>
```

Standard authenticated API call following existing service patterns.

## Translations

Add to `src/i18n/en/settings.json` and `src/i18n/th/settings.json`:

```json
{
  "westernZodiac": "Western Zodiac",
  "chineseZodiac": "Chinese Zodiac"
}
```

Section labels only — sign names, elements, and traits come from the API response.

## File Changes Summary

| File | Change |
|------|--------|
| `shared/zodiac.ts` | New — sign computation functions |
| `api/src/app/api/zodiac/signs/route.ts` | New — POST endpoint |
| `src/services/zodiac.ts` | New — API client |
| `src/components/ZodiacCard.tsx` | New — card UI component |
| `app/(main)/profile/index.tsx` | Modified — add zodiac cards |
| `src/i18n/en/settings.json` | Modified — add section labels |
| `src/i18n/th/settings.json` | Modified — add section labels |
| `assets/images/zodiac/western/*.webp` | New — 12 Western sign illustrations |
| `assets/images/zodiac/chinese/*.webp` | New — 12 Chinese animal illustrations |
