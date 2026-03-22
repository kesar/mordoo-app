# Emoji to SVG Icons & Tarot Images — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all emoji/Unicode characters that render as `?` with SVG icon components and tarot-style generated images.

**Architecture:** Centralized SVG icon library (`src/components/icons/TarotIcons.tsx`) for small UI icons, plus tarot-style WebP images in `assets/images/tarot/` for larger visual elements. Screens import from these two sources instead of using inline emoji text.

**Tech Stack:** react-native-svg (already installed), React Native `<Image>` for WebP assets, Gemini CLI for image generation.

**Spec:** `docs/superpowers/specs/2026-03-22-emoji-to-svg-tarot-images-design.md`

---

## Chunk 1: SVG Icon Library + Tarot Image Generation

### Task 1: Create centralized SVG icon library

**Files:**
- Create: `src/components/icons/TarotIcons.tsx`

All icons use this interface pattern:
```tsx
type IconProps = { size?: number; color?: string };
```

- [ ] **Step 1: Create `src/components/icons/TarotIcons.tsx`**

Write the complete icon library file with all 18 SVG icon components. Each icon:
- Accepts `{ size = 24, color = colors.gold.DEFAULT }` props
- Uses `react-native-svg` (`Svg`, `Path`, `Circle`, `Rect`, `Line` as needed)
- Has mystical, angular, thin-stroke tarot-inspired geometry

Icons to implement (with SVG path guidance):

| Component | Visual description |
|-----------|-------------------|
| `CalendarIcon` | Mystical calendar with crescent moon accent |
| `LocationPinIcon` | Ornate map pin with star center |
| `SearchIcon` | Magnifying glass with celestial ring |
| `InfoCircleIcon` | Circle with centered `i`, thin ornate border |
| `SparkleIcon` | 4-pointed star burst (angular, not rounded) |
| `ArrowRightIcon` | Pointed arrow right, angular/tarot style |
| `ArrowLeftIcon` | Pointed arrow left, angular/tarot style |
| `ChevronRightIcon` | Simple right chevron `>` |
| `ChevronLeftIcon` | Simple left chevron `<` |
| `QuoteIcon` | Ornate opening quotation mark |
| `BusinessStarIcon` | 5-pointed star, thin stroke |
| `HeartIcon` | Heart shape, thin stroke |
| `BodyDiamondIcon` | Diamond/rhombus shape, thin stroke |
| `CheckIcon` | Simple checkmark |
| `SendArrowIcon` | Paper plane / send arrow (match existing oracle send SVG path: `M2.01 21L23 12 2.01 3 2 10l15 2-15 2z`) |
| `StarIcon` | 8-pointed star (move existing path from `oracle/index.tsx`: `M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z`) |
| `LockIcon` | Padlock (move existing path from `oracle/index.tsx`) |
| `BambooIcon` | Bamboo stalks (move existing path from `oracle/index.tsx`) |
| `OracleHeartIcon` | Heart outline (move existing path from `_layout.tsx`: the heart path with stroke) |

For moved icons (`StarIcon`, `LockIcon`, `BambooIcon`, `OracleHeartIcon`, `SendArrowIcon`), copy the exact SVG paths from their current locations to preserve visual consistency.

For new icons, use `viewBox="0 0 24 24"` and thin strokes (`strokeWidth={1.5}`).

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit` (must use project tsconfig for path alias resolution)
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/icons/TarotIcons.tsx
git commit -m "feat: add centralized TarotIcons SVG icon library"
```

### Task 2: Generate tarot-style images with Gemini CLI

**Files:**
- Create: `assets/images/tarot/` directory with 9 WebP images

- [ ] **Step 1: Create the `assets/images/tarot/` directory**

```bash
mkdir -p assets/images/tarot
```

- [ ] **Step 2: Generate each image using Gemini CLI**

Use this prompt template for each image, adjusting the `Subject` line:

```
Generate a tarot card style icon on a transparent background.
Style: gold linework on dark/transparent, mystical, angular geometry,
thin ornate lines, inspired by Rider-Waite tarot illustrations.
Color palette: gold (#c9a84c), light gold (#f4e8c1), dark background (#0a0a14).
Subject: [DESCRIPTION]
Size: [WIDTH]x[HEIGHT]px, WebP format.
```

Generate these 9 images:

| File | Subject description | Size |
|------|-------------------|------|
| `emblem-soul-gate.webp` | A sacred diamond emblem surrounded by celestial circles and radiating light beams, central mystical eye motif | 384x384 |
| `concern-love.webp` | A pair of intertwined sacred hearts with rose vines and thorns, romantic tarot symbolism | 288x288 |
| `concern-career.webp` | A tower or pentacles with ascending stairs, ambition and power tarot motif | 288x288 |
| `concern-money.webp` | Stacked golden coins with abundance symbols, flowing wealth streams | 288x288 |
| `concern-health.webp` | A radiant star of vitality with healing serpent (caduceus), life force energy | 288x288 |
| `concern-family.webp` | A sacred tree with deep roots and spreading branches, interconnected lives | 288x288 |
| `concern-spiritual.webp` | An all-seeing eye within a mandala, third eye chakra with lotus petals | 288x288 |
| `powerup-location.webp` | A celestial compass with cardinal directions and star navigation, mystical wayfinding | 288x288 |
| `powerup-notifications.webp` | An oracle bell with sound waves emanating as sacred geometry patterns | 288x288 |

Save each to `assets/images/tarot/`.

- [ ] **Step 3: Commit**

```bash
git add assets/images/tarot/
git commit -m "feat: add tarot-style images for concerns, power-ups, and emblem"
```

---

## Chunk 2: Update Onboarding Screens

### Task 3: Update soul-gate.tsx

**Files:**
- Modify: `app/(onboarding)/soul-gate.tsx`

- [ ] **Step 1: Replace emoji with SVG icons and tarot image**

Changes:
1. Add import (`Image` is already imported in this file):
   ```tsx
   import { SparkleIcon } from '@/src/components/icons/TarotIcons';
   ```
2. Replace the emblem diamond `<Text style={styles.emblemDiamond}>◆</Text>` (line 127) with:
   ```tsx
   <Image
     source={require('@/assets/images/tarot/emblem-soul-gate.webp')}
     style={styles.emblemImage}
   />
   ```
3. Add `emblemImage` style: `{ width: 96, height: 96 }` and add `resizeMode="contain"` as a prop on the `<Image>` component
4. Remove `emblemDiamond` style (no longer used)
5. Replace divider sparkle `<Text style={styles.dividerSparkle}>✦</Text>` (line 170) with:
   ```tsx
   <SparkleIcon size={14} color={colors.gold.DEFAULT} />
   ```
6. Replace footer sparkle `<Text style={styles.footerSparkle}>✦</Text>` (line 215) with:
   ```tsx
   <SparkleIcon size={12} color="rgba(201, 168, 76, 0.6)" />
   ```
7. Remove `dividerSparkle` and `footerSparkle` styles (no longer needed — icon handles its own sizing)

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/soul-gate.tsx
git commit -m "feat(soul-gate): replace emoji with SVG icons and tarot emblem image"
```

### Task 4: Update birth-data.tsx

**Files:**
- Modify: `app/(onboarding)/birth-data.tsx`

- [ ] **Step 1: Replace emoji with SVG icons**

Changes:
1. Add import:
   ```tsx
   import { CalendarIcon, LocationPinIcon, SearchIcon, InfoCircleIcon } from '@/src/components/icons/TarotIcons';
   ```
2. Replace `<Text style={styles.cardDecorativeIcon}>📅</Text>` (line 129) with:
   ```tsx
   <View style={styles.cardDecorativeIcon}>
     <CalendarIcon size={28} color={colors.gold.DEFAULT} />
   </View>
   ```
   Update `cardDecorativeIcon` style: remove `fontSize`, keep position/opacity, add `opacity: 0.2`
3. Replace `<Text style={styles.placeIcon}>📍</Text>` (line 328) with:
   ```tsx
   <LocationPinIcon size={18} color={colors.gold.DEFAULT} />
   ```
4. Replace `<Text style={styles.placeSearchIcon}>🔍</Text>` (line 347) with:
   ```tsx
   <SearchIcon size={18} color={colors.gold.DEFAULT} />
   ```
5. Replace `<Text style={styles.infoNoteIcon}>ℹ️</Text>` (line 313) with:
   ```tsx
   <InfoCircleIcon size={14} color={colors.gold.DEFAULT} />
   ```
6. Remove `placeIcon`, `placeSearchIcon`, `infoNoteIcon` styles (fontSize-only styles no longer needed)

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/birth-data.tsx
git commit -m "feat(birth-data): replace emoji with SVG icons"
```

### Task 5: Update name-numbers.tsx

**Files:**
- Modify: `app/(onboarding)/name-numbers.tsx`

- [ ] **Step 1: Replace emoji with SVG icon**

Changes:
1. Add import:
   ```tsx
   import { SparkleIcon } from '@/src/components/icons/TarotIcons';
   ```
2. Replace `<Text style={styles.cardDecorativeIcon}>✨</Text>` (line 96) with:
   ```tsx
   <View style={styles.cardDecorativeIcon}>
     <SparkleIcon size={28} color={colors.gold.DEFAULT} />
   </View>
   ```
3. Update `cardDecorativeIcon` style: remove `fontSize`, keep position/opacity

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/name-numbers.tsx
git commit -m "feat(name-numbers): replace emoji with SVG sparkle icon"
```

### Task 6: Update life-context.tsx

**Files:**
- Modify: `app/(onboarding)/life-context.tsx`

- [ ] **Step 1: Replace concern emoji with tarot images**

Changes:
1. Add `Image` to the `react-native` import (already imports `ScrollView`, etc.)
2. Replace the `CONCERNS` array emoji field with image sources:
   ```tsx
   const CONCERNS: { concern: Concern; image: number; label: string }[] = [
     { concern: 'love', image: require('@/assets/images/tarot/concern-love.webp'), label: 'Love' },
     { concern: 'career', image: require('@/assets/images/tarot/concern-career.webp'), label: 'Career' },
     { concern: 'money', image: require('@/assets/images/tarot/concern-money.webp'), label: 'Money' },
     { concern: 'health', image: require('@/assets/images/tarot/concern-health.webp'), label: 'Health' },
     { concern: 'family', image: require('@/assets/images/tarot/concern-family.webp'), label: 'Family' },
     { concern: 'spiritual', image: require('@/assets/images/tarot/concern-spiritual.webp'), label: 'Spiritual' },
   ];
   ```
3. In the chip render, replace `<RNText style={styles.chipEmoji}>{emoji}</RNText>` with:
   ```tsx
   <Image source={image} style={styles.chipImage} />
   ```
4. Add `chipImage` style: `{ width: 40, height: 40 }` and add `resizeMode="contain"` as a prop on the `<Image>` component
5. Remove `chipEmoji` style
6. Remove `Text as RNText` import if no longer used

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/life-context.tsx
git commit -m "feat(life-context): replace concern emoji with tarot images"
```

### Task 7: Update power-ups.tsx

**Files:**
- Modify: `app/(onboarding)/power-ups.tsx`

- [ ] **Step 1: Replace emoji with tarot images and SVG icons**

Changes:
1. Add imports:
   ```tsx
   import { Image } from 'react-native';
   import { CheckIcon } from '@/src/components/icons/TarotIcons';
   ```
2. Replace location card icon `<RNText style={styles.cardIcon}>◉</RNText>` (line 62) with:
   ```tsx
   <Image
     source={require('@/assets/images/tarot/powerup-location.webp')}
     style={styles.cardImage}
   />
   ```
3. Replace notifications card icon `<RNText style={styles.cardIcon}>✧</RNText>` (line 90) with:
   ```tsx
   <Image
     source={require('@/assets/images/tarot/powerup-notifications.webp')}
     style={styles.cardImage}
   />
   ```
4. Add `cardImage` style: `{ width: 48, height: 48, marginBottom: 12 }` and add `resizeMode="contain"` as a prop on the `<Image>` components
5. Remove `cardIcon` style
6. Replace `✓` in toggle text. Change `'Enabled ✓'` (lines 82, 109) to use a `CheckIcon` inline:
   ```tsx
   <View style={styles.toggleContent}>
     <Text style={[styles.toggleText, styles.toggleTextActive]}>Enabled</Text>
     <CheckIcon size={14} color={colors.onPrimary} />
   </View>
   ```
   Wrap the toggle content in a `flexDirection: 'row'` view with `gap: 4`.
7. Remove `Text as RNText` import if no longer used

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/power-ups.tsx
git commit -m "feat(power-ups): replace emoji with tarot images and check icon"
```

### Task 8: Update soul-snapshot.tsx

**Files:**
- Modify: `app/(onboarding)/soul-snapshot.tsx`

- [ ] **Step 1: Replace emoji/Unicode with SVG icons**

Changes:
1. Add import:
   ```tsx
   import {
     BusinessStarIcon,
     HeartIcon,
     BodyDiamondIcon,
     QuoteIcon,
     ArrowRightIcon,
     ArrowLeftIcon,
   } from '@/src/components/icons/TarotIcons';
   ```
2. Replace `SUB_SCORES` array icon strings with components. Change the type and data:
   ```tsx
   const SUB_SCORES = [
     { Icon: BusinessStarIcon, label: 'Business', value: 78 },
     { Icon: HeartIcon, label: 'Heart', value: 45 },
     { Icon: BodyDiamondIcon, label: 'Body', value: 91 },
   ] as const;
   ```
3. In the sub-score render, replace `<RNText style={styles.subScoreIcon}>{item.icon}</RNText>` with:
   ```tsx
   <item.Icon size={16} color={colors.gold.DEFAULT} />
   ```
4. Replace quote icon `<Text style={styles.quoteIcon}>❝</Text>` (line 85) with:
   ```tsx
   <QuoteIcon size={22} color={colors.gold.DEFAULT} />
   ```
5. Replace lucky direction `<RNText style={styles.luckyIcon}>→</RNText>` (line 110) with:
   ```tsx
   <ArrowRightIcon size={22} color={colors.gold.DEFAULT} />
   ```
6. Replace back arrow `<Text style={styles.backArrow}>←</Text>` (line 48) with:
   ```tsx
   <ArrowLeftIcon size={24} color={colors.gold.DEFAULT} />
   ```
7. Remove unused styles: `subScoreIcon`, `quoteIcon`, `luckyIcon`, `backArrow` (fontSize-based)
8. Remove `Text as RNText` import if no longer needed

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/soul-snapshot.tsx
git commit -m "feat(soul-snapshot): replace emoji with SVG icons"
```

---

## Chunk 3: Update Main App Screens

### Task 9: Update pulse/index.tsx

**Files:**
- Modify: `app/(main)/pulse/index.tsx`

- [ ] **Step 1: Replace emoji/Unicode with SVG icons**

Changes:
1. Add import:
   ```tsx
   import {
     SparkleIcon,
     BusinessStarIcon,
     HeartIcon,
     BodyDiamondIcon,
     ArrowRightIcon,
   } from '@/src/components/icons/TarotIcons';
   ```
2. Replace prana index sparkle in header `<RNText>{'✦ '}</RNText>` (line 156) with:
   ```tsx
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
     <SparkleIcon size={12} color={colors.onSurfaceVariant} />
     <Text style={styles.starMapMoon}>PRANA INDEX</Text>
   </View>
   ```
   Adjust line 156 to remove the wrapping `<Text>` that currently contains both the sparkle and "PRANA INDEX".
3. Replace lucky direction arrow `<RNText style={styles.luckyDirectionIcon}>→</RNText>` (line 205) with:
   ```tsx
   <ArrowRightIcon size={28} color={colors.gold.DEFAULT} />
   ```
4. In `SubScoreBar`, replace the `icon` string prop with an `Icon` component prop:
   ```tsx
   function SubScoreBar({ Icon, label, value, color }: {
     Icon: React.ComponentType<{ size?: number; color?: string }>;
     label: string;
     value: number;
     color: string;
   }) {
   ```
   Replace `<RNText style={styles.subScoreIcon}>{icon}</RNText>` with:
   ```tsx
   <Icon size={16} color={color} />
   ```
5. Update the three `SubScoreBar` usages (lines 214-216):
   ```tsx
   <SubScoreBar Icon={BusinessStarIcon} label="Business" value={pulse.subScores.business} color={colors.elements.fire} />
   <SubScoreBar Icon={HeartIcon} label="Heart" value={pulse.subScores.heart} color="#ec4899" />
   <SubScoreBar Icon={BodyDiamondIcon} label="Body" value={pulse.subScores.body} color={colors.elements.wood} />
   ```
6. Remove unused styles: `luckyDirectionIcon`, `subScoreIcon`
7. Remove `Text as RNText` import if no longer needed

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(main)/pulse/index.tsx
git commit -m "feat(pulse): replace emoji with SVG icons"
```

### Task 10: Update oracle/siam-si.tsx

**Files:**
- Modify: `app/(main)/oracle/siam-si.tsx`

- [ ] **Step 1: Replace emoji with SVG icons**

Changes:
1. Add import:
   ```tsx
   import { BambooIcon, ChevronLeftIcon } from '@/src/components/icons/TarotIcons';
   ```
2. Replace back button `<Text style={styles.backText}>{'<'}</Text>` (line 97) with:
   ```tsx
   <ChevronLeftIcon size={24} color={colors.gold.DEFAULT} />
   ```
3. Replace cup icon `<RNText style={styles.cupIcon}>🎋</RNText>` (line 158) with:
   ```tsx
   <BambooIcon size={48} color={colors.gold.DEFAULT} />
   ```
4. Remove unused styles: `backText`, `cupIcon`
5. Remove `Text as RNText` import if no longer needed

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(main)/oracle/siam-si.tsx
git commit -m "feat(siam-si): replace emoji with SVG icons"
```

### Task 11: Update oracle/index.tsx — consolidate inline SVGs

**Files:**
- Modify: `app/(main)/oracle/index.tsx`

- [ ] **Step 1: Replace inline SVG definitions with centralized imports**

Changes:
1. Add import:
   ```tsx
   import {
     StarIcon,
     LockIcon,
     BambooIcon,
     ChevronRightIcon,
     SendArrowIcon,
   } from '@/src/components/icons/TarotIcons';
   ```
2. Remove the three inline function definitions: `StarIcon` (lines 28-34), `LockIcon` (lines 36-42), `BambooIcon` (lines 44-50)
3. Remove `import Svg, { Path } from 'react-native-svg';` if the only remaining SVG usage was the send button (which is now `SendArrowIcon`)
4. Replace the siam-si arrow `<Text style={styles.siamSiArrow}>{'>'}</Text>` (line 116) with:
   ```tsx
   <ChevronRightIcon size={18} color={colors.gold.DEFAULT} />
   ```
5. Replace the send button inline SVG (lines 337-339) with:
   ```tsx
   <SendArrowIcon size={16} color={colors.onPrimary} />
   ```
6. Remove unused styles: `siamSiArrow`

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(main)/oracle/index.tsx
git commit -m "refactor(oracle): use centralized TarotIcons instead of inline SVGs"
```

### Task 12: Update tab bar _layout.tsx — consolidate inline SVGs

**Files:**
- Modify: `app/(main)/_layout.tsx`

- [ ] **Step 1: Replace inline SVG definitions with centralized imports**

Changes:
1. Add import:
   ```tsx
   import { StarIcon, OracleHeartIcon } from '@/src/components/icons/TarotIcons';
   ```
2. Simplify `TabIcon` function to use centralized icons:
   ```tsx
   function TabIcon({ name, color }: { name: string; color: string; focused: boolean }) {
     const size = 22;
     const icon =
       name === 'pulse' ? (
         <StarIcon size={size} color={color} />
       ) : name === 'oracle' ? (
         <OracleHeartIcon size={size} color={color} />
       ) : null;
     return <View style={tabStyles.iconWrap}>{icon}</View>;
   }
   ```
3. Remove `import Svg, { Path } from 'react-native-svg';`
4. Remove the fallback circle SVG (dead code — only 'pulse' and 'oracle' tabs exist)

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/(main)/_layout.tsx
git commit -m "refactor(tab-bar): use centralized TarotIcons instead of inline SVGs"
```

---

## Chunk 4: Documentation + Cleanup

### Task 13: Write icon and image guide

**Files:**
- Create: `docs/icon-and-image-guide.md`

- [ ] **Step 1: Write the guide**

Contents:
- **When to use SVG vs tarot image:** SVG for small functional icons (< 48px), tarot images for larger decorative/illustrative elements (> 48px, visually complex)
- **Adding new SVG icons:** Add to `src/components/icons/TarotIcons.tsx`, follow `IconProps` pattern, use `viewBox="0 0 24 24"`, thin strokes (`strokeWidth={1.5}`)
- **Generating new tarot images:** Gemini CLI prompt template (copy from spec), save to `assets/images/tarot/`, use WebP at 3x resolution
- **Naming conventions:** `concern-*.webp`, `powerup-*.webp`, `emblem-*.webp` for images; `PascalCaseIcon` for SVG components
- **Sizing:** 288x288 standard, 384x384 emblems; render at 40-96px in app

- [ ] **Step 2: Commit**

```bash
git add docs/icon-and-image-guide.md
git commit -m "docs: add icon and image guide for SVG/tarot image conventions"
```

### Task 14: Final cleanup — remove dead styles and unused imports

**Files:**
- Modify: All previously updated screen files

- [ ] **Step 1: Scan all modified files for unused styles and imports**

Check each file for:
- `RNText` import still used? Remove if not.
- `react-native-svg` import still used? Remove if not.
- Unused style keys (fontSize-only styles for removed emoji). Remove.
- `modeBtnEmoji` style in oracle/index.tsx (line 397) — unused, remove it.

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove dead styles and unused imports from emoji migration"
```
