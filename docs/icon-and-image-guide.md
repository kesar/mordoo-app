# Icon & Image Guide

## Why No Emoji

Custom fonts (CinzelDecorative, CormorantGaramond, NotoSansThai) override emoji glyphs in React Native's `<Text>`, rendering them as `?`. All decorative characters must use SVG icons or images instead.

## When to Use What

| Element | Solution | Example |
|---------|----------|---------|
| Small UI icons (< 32px) | SVG icon component | Navigation arrows, status indicators |
| Decorative/thematic art | Tarot-style WebP image | Concern chips, soul gate emblem |
| Animated elements | SVG (supports RN Animated) | Twinkling stars, loading indicators |

## SVG Icons

**Location:** `src/components/icons/TarotIcons.tsx`

All icons follow this pattern:

```tsx
import { StarIcon } from '@/src/components/icons/TarotIcons';

<StarIcon size={24} color={colors.gold.DEFAULT} />
```

**Adding a new icon:**

1. Add to `TarotIcons.tsx` with the standard signature:
   ```tsx
   export function MyIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
     return (
       <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
         <Path d="..." fill={color} />
       </Svg>
     );
   }
   ```
2. Use a 24x24 viewBox by default
3. Accept `size` and `color` props
4. Export as a named export

**Available icons:** StarIcon, LockIcon, BambooIcon, SendArrowIcon, OracleHeartIcon, CalendarIcon, LocationPinIcon, SearchIcon, InfoCircleIcon, SparkleIcon, ArrowRightIcon, ArrowLeftIcon, ChevronRightIcon, ChevronLeftIcon, QuoteIcon, BusinessStarIcon, HeartIcon, BodyDiamondIcon, CheckIcon

## Tarot-Style Images

**Location:** `assets/images/tarot/`

**Format:** WebP (smaller file size, good quality)

**Loading:**
```tsx
import { Image } from 'react-native';

<Image
  source={require('@/assets/images/tarot/my-image.webp')}
  style={{ width: 48, height: 48 }}
  resizeMode="contain"
/>
```

Note: `resizeMode` is a **prop**, not a style property.

**Recommended sizes:**
- Concern chips: 128x128px source → rendered at 40x40
- Card icons: 128x128px source → rendered at 48x48
- Emblems: 256x256px source → rendered at 96x96

**Naming:** `<category>-<name>.webp` (e.g., `concern-love.webp`, `powerup-location.webp`)

### Generating with Gemini CLI

```bash
/opt/homebrew/bin/gemini -p "Generate a 128x128 mystical tarot-style icon of [SUBJECT].
Dark background (#0a0a14), gold (#c9a84c) and warm amber tones.
Ornate borders, celestial/mystical symbolism.
Transparent or dark background, suitable for dark UI.
Style: vintage tarot card art meets cosmic mysticism." \
  --save "assets/images/tarot/[name].webp"
```

Adjust dimensions for emblems (256x256) or larger decorative elements.

## Existing Images

| File | Used In | Size |
|------|---------|------|
| `emblem-soul-gate.webp` | soul-gate.tsx | 96x96 |
| `concern-love.webp` | life-context.tsx | 40x40 |
| `concern-career.webp` | life-context.tsx | 40x40 |
| `concern-money.webp` | life-context.tsx | 40x40 |
| `concern-health.webp` | life-context.tsx | 40x40 |
| `concern-family.webp` | life-context.tsx | 40x40 |
| `concern-spiritual.webp` | life-context.tsx | 40x40 |
| `powerup-location.webp` | power-ups.tsx | 48x48 |
| `powerup-notifications.webp` | power-ups.tsx | 48x48 |
