# Sharing Feature — Design Spec

## Overview

Users can share their Pulse (daily reading) and Siam Si (fortune stick) results as branded image cards to any social platform via the native share sheet.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Share format | Image card (PNG) | Works on all platforms, no web frontend needed, high visual impact |
| Trigger | Share button on result screens | Lightweight, no flow interruption |
| Pulse card style | Rich | Shows full reading: score, sub-scores, lucky elements, insight |
| Siam Si card style | Mystical | Shows full fortune: stick number, badge, title, meaning |
| Image generation | `react-native-view-shot` | Reuses RN components, works with Expo, simple |
| Share mechanism | React Native `Share` API | Native share sheet, covers all platforms |
| Card orientation | Vertical (portrait) | Optimized for mobile screens and social stories |

## Components

### 1. `PulseShareCard` — Hidden renderable view

A React Native view (not displayed in the UI) that renders the Pulse reading as a shareable card.

**Layout (vertical, ~1080x1920 or 1080x1350 aspect ratio):**
- Mordoo branding header (subtle, top)
- Date label
- Energy score (large, centered, gold)
- Sub-scores row: Business / Heart / Body with colored values
- Divider
- Lucky elements row: Color (swatch + name), Number, Direction
- Insight text (italic, muted)
- Mordoo logo/wordmark (bottom)

**Props:**
```typescript
interface PulseShareCardProps {
  date: string
  energyScore: number
  subScores: { business: number; heart: number; body: number }
  luckyColor: { name: string; hex: string }
  luckyNumber: number
  luckyDirection: string
  insight: string
  lang: 'en' | 'th'
}
```

**Styling:** Uses the app's existing dark theme (night background, gold accents, parchment text). Background is a solid gradient (`#0a0a14` → `#1a1a2e`) with a subtle gold border.

### 2. `SiamSiShareCard` — Hidden renderable view

A React Native view that renders the Siam Si result as a shareable card.

**Layout (vertical, same aspect ratio as Pulse):**
- Mordoo branding header (subtle, top)
- "Siam Si · Fortune Stick" label
- Stick number (large, Roman numeral, gold)
- Fortune badge (color-coded: excellent/green, good/gold, fair/gray, caution/red)
- Title (italic, parchment)
- Divider
- Meaning text (muted parchment)
- Mordoo logo/wordmark (bottom)

**Props:**
```typescript
interface SiamSiShareCardProps {
  stickNumber: number
  fortune: 'excellent' | 'good' | 'fair' | 'caution'
  title: string
  meaning: string
  lang: 'en' | 'th'
}
```

### 3. `useShareCard` hook

Handles the capture-and-share flow.

```typescript
function useShareCard(): {
  cardRef: React.RefObject<View>
  shareCard: (message?: string) => Promise<void>
  isSharing: boolean
}
```

**Flow:**
1. `shareCard()` is called when user taps the share button
2. Uses `react-native-view-shot` to capture `cardRef` as a PNG (targeting ~1080px wide)
3. Saves to a temporary file via `expo-file-system`
4. Opens native share sheet via `Share.share()` with the image URI and optional message text
5. Cleans up temp file after sharing completes

### 4. Share button on result screens

**Pulse screen (`app/(main)/pulse/index.tsx`):**
- Add a share icon button in the header or below the reading content
- Only visible when a reading is loaded (not during loading/error states)
- Renders `PulseShareCard` off-screen (positioned absolutely, off-viewport)
- On tap: triggers `useShareCard.shareCard()`

**Siam Si screen (`app/(main)/oracle/siam-si.tsx`):**
- Add a share icon button on the result card (appears after stick is revealed)
- Only visible in the revealed state
- Renders `SiamSiShareCard` off-screen
- On tap: triggers `useShareCard.shareCard()`

## Dependencies

New packages:
- `react-native-view-shot` — capture RN views as images (Expo-compatible)

Already available:
- `expo-file-system` — temp file management
- `react-native` `Share` API — native share sheet

## File Structure

```
src/
  components/
    sharing/
      PulseShareCard.tsx      # Pulse image card component
      SiamSiShareCard.tsx     # Siam Si image card component
  hooks/
    useShareCard.ts           # Capture + share logic
```

## Translations

Add to both `src/i18n/en/` and `src/i18n/th/` (in relevant namespace files):

- Share button label / accessibility text
- Default share message text (e.g., "Check out my daily reading on Mordoo!")
- Siam Si share message (e.g., "I drew fortune stick #14 on Mordoo!")

## Edge Cases

- **Loading/error states:** Share button hidden until data is loaded
- **Share cancelled:** No-op, no error shown
- **Share failure:** Show brief toast/alert if capture fails
- **Thai text rendering:** Cards must handle Thai font (NotoSansThai) for `lang: 'th'`
- **Long insight text:** Truncate or reduce font size if insight exceeds card bounds

## Out of Scope (v1)

- Deep links / web preview pages
- Direct platform integrations (Instagram Stories API, LINE SDK)
- Card customization / themes
- Share analytics / tracking
- Oracle chat sharing
