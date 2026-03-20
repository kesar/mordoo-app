# Stitch Design Screens Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all Stitch-designed screens as React Native components and wire up form logic, navigation, and state management.

**Architecture:** Translate Stitch HTML/Tailwind designs into React Native StyleSheet-based screens. Create shared UI components (ProgressIndicator, EnergyScoreRing, etc.) to reduce duplication across screens. Connect forms to Zustand stores via react-hook-form + zod validation. Use existing Expo Router file-based navigation.

**Tech Stack:** React Native 0.83, Expo 55, Expo Router, Zustand, react-hook-form, zod, react-native-reanimated, TypeScript

---

## Chunk 1: Design System & Shared Components

### Task 1: Extend Design System Colors

**Files:**
- Modify: `src/constants/colors.ts`

The Stitch designs use a richer color palette than what's currently defined. We need surface hierarchy colors, outline colors, and the on-* semantic tokens.

- [ ] **Step 1: Update colors.ts with full Stitch palette**

```typescript
export const colors = {
  gold: {
    DEFAULT: '#c9a84c',
    light: '#e6c364',
    dark: '#8c6d1f',
    muted: 'rgba(201, 168, 76, 0.15)',
    border: 'rgba(201, 168, 76, 0.3)',
  },
  night: {
    DEFAULT: '#0a0a14',
    surface: '#12121d',
    elevated: '#1f1f29',
    card: '#292934',
    cardHighest: '#34343f',
  },
  surface: {
    containerLowest: '#0d0d17',
    containerLow: '#1b1b25',
    container: '#1f1f29',
    containerHigh: '#292934',
    containerHighest: '#34343f',
  },
  parchment: {
    DEFAULT: '#f4e8c1',
    dim: 'rgba(244, 232, 193, 0.7)',
    muted: 'rgba(244, 232, 193, 0.4)',
  },
  onSurface: '#e4e1f0',
  onSurfaceVariant: '#d0c5b2',
  onPrimary: '#3d2e00',
  outline: '#99907e',
  outlineVariant: '#4d4637',
  energy: {
    high: '#4ade80',
    medium: '#c9a84c',
    low: '#ef4444',
  },
  elements: {
    fire: '#ef4444',
    water: '#3b82f6',
    earth: '#a16207',
    air: '#a78bfa',
    wood: '#22c55e',
    metal: '#94a3b8',
  },
  business: '#f59e0b',
  heart: '#ec4899',
  body: '#22c55e',
  error: '#ffb4ab',
} as const;
```

- [ ] **Step 2: Verify no import breakage**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

---

### Task 2: Create ProgressIndicator Component

**Files:**
- Create: `src/components/ui/ProgressIndicator.tsx`

The onboarding screens all show step dots with a label. Step 1 shows 3 dots, steps 2-6 show 6 dots.

- [ ] **Step 1: Create ProgressIndicator**

```typescript
// Props: currentStep (1-6), totalSteps (3 | 6), label (string)
// Active dot: gold with glow shadow, larger
// Inactive dots: surface-container-highest, smaller
// Label below: CinzelDecorative, tracking-widest, gold, uppercase
```

- [ ] **Step 2: Verify renders in soul-gate screen**

---

### Task 3: Create SacredCard Component

**Files:**
- Create: `src/components/ui/SacredCard.tsx`

Reusable card with the Stitch glass-morphic styling: surface background, gold border at 20% opacity, rounded corners, deep shadow.

- [ ] **Step 1: Create SacredCard**

```typescript
// Props: variant ('low' | 'high'), children, style
// low: surface-container-low bg, primary/20 border
// high: surface-container-high bg, primary/20 border
// Both: rounded-xl (12px), shadow, padding 24
```

---

### Task 4: Create EnergyScoreRing Component

**Files:**
- Create: `src/components/ui/EnergyScoreRing.tsx`

The circular energy ring showing a score 0-100. Used in Soul Snapshot and Pulse Dashboard.

- [ ] **Step 1: Create EnergyScoreRing**

Uses react-native `Svg` from react-native-svg (need to add dependency) to draw:
- Outer track circle (gray border)
- Score arc (gold, conic gradient simulated with SVG arc)
- Inner circle (dark bg) with score text and label

```typescript
// Props: score (number), size (number), label (string)
```

- [ ] **Step 2: Add react-native-svg dependency**

Run: `npx expo install react-native-svg`

---

### Task 5: Create GoldButton and GhostButton Components

**Files:**
- Create: `src/components/ui/GoldButton.tsx`

- [ ] **Step 1: Create GoldButton**

```typescript
// Props: title, onPress, icon?, loading?, fullWidth?, variant ('filled' | 'ghost')
// filled: gold bg, on-primary text, CinzelDecorative font, tracking-widest, shadow glow
// ghost: transparent bg, parchment text, underline on press
```

---

### Task 6: Create TopAppBar Component

**Files:**
- Create: `src/components/ui/TopAppBar.tsx`

The fixed header with MOR DOO title, menu button, and avatar. Used on main screens (not onboarding).

- [ ] **Step 1: Create TopAppBar**

```typescript
// Props: showBackButton?, onMenuPress?, onAvatarPress?
// Fixed height 56, bg night/90% opacity, backdrop blur
// Gold gradient line at bottom (1px)
// MOR DOO title: CinzelDecorative, gold, tracking-widest
```

---

## Chunk 2: Onboarding Screens

### Task 7: Implement Soul Gate Screen (Step 1)

**Files:**
- Modify: `app/(onboarding)/soul-gate.tsx`

Translating from Stitch screen: `MOR DOO - Soul Gate`. Key elements:
- Starfield ambient background with radial glow blurs
- Progress indicator (step 1 of 3 — initiation)
- Sacred geometry diamond emblem (use Unicode ◇ or a View with border rotation)
- "MOR DOO" title in CinzelDecorative, 5xl, gold, tracking-widest, text-shadow
- Subtitle: "Choose your language to begin" in Cormorant Garamond, italic
- Two language buttons: 🇹🇭 ไทย and 🇬🇧 ENGLISH as aspect-ratio cards with gold border
- Gold divider with sparkle
- CREATE ACCOUNT primary button (full-width, gold bg, shadow glow)
- "Continue as Guest" ghost button with underline hover
- Footer decoration with "The Soul Gate" label

- [ ] **Step 1: Rewrite soul-gate.tsx with full Stitch design**

Wire up existing logic:
- `selectLanguage(lang)` already sets i18n + onboarding store
- CREATE ACCOUNT → `router.push('/(onboarding)/birth-data')`
- Continue as Guest → set authMode to 'guest' via authStore, then `router.push('/(onboarding)/birth-data')`

- [ ] **Step 2: Run on simulator to verify**

Run: `npx expo start --ios` (or `--android`)

- [ ] **Step 3: Commit**

---

### Task 8: Implement Birth Data Screen (Step 2)

**Files:**
- Modify: `app/(onboarding)/birth-data.tsx`

Translating from Stitch screen: `MOR DOO - Birth Data (variant 2)`. Key elements:
- TopAppBar-style header (MOR DOO, menu, avatar)
- Progress indicator (step 2 of 6 — "Phase II of VI — The Blueprint")
- Title: "Your Celestial Foundation" + subtitle quote
- Date of Birth section: Day (number input), Month (picker), Year (number input) in SacredCard
- Time of Birth section: Hour:Minute inputs with AM/PM toggle in SacredCard
- Info note: "Even an approximate hour significantly changes your reading"
- Place of Birth: search input with location icon in SacredCard
- Gender: 4-button grid (Male/Female/Other/Secret) in SacredCard
- CTA: "CAST THE BLUEPRINT" gold button with magic icon
- Footer: privacy message

- [ ] **Step 1: Create birth-data form with react-hook-form + zod**

Schema:
```typescript
const birthDataSchema = z.object({
  day: z.number().min(1).max(31),
  month: z.number().min(0).max(11),
  year: z.number().min(1900).max(2026),
  hour: z.number().min(0).max(23).optional(),
  minute: z.number().min(0).max(59).optional(),
  isAM: z.boolean().default(true),
  birthPlace: z.string().min(1, 'Birth place is required'),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not']).optional(),
});
```

- [ ] **Step 2: Implement the full screen UI matching Stitch design**

- [ ] **Step 3: Wire up form submission**

On submit:
1. Construct `BirthData` object from form values
2. Call `onboardingStore.setBirthData(data)`
3. Call `onboardingStore.setStep(3)`
4. Navigate to `/(onboarding)/name-numbers`

- [ ] **Step 4: Run on simulator to verify**

- [ ] **Step 5: Commit**

---

### Task 9: Implement Name & Numbers Screen (Step 3)

**Files:**
- Modify: `app/(onboarding)/name-numbers.tsx`

No direct Stitch screen for this, but follow the same design language as Birth Data. Key form fields:
- Full Name input (required)
- Phone Number input (optional, Thai format)
- Car Plate input (optional)

- [ ] **Step 1: Create name-numbers form with react-hook-form + zod**

Schema:
```typescript
const nameDataSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().optional(),
  carPlate: z.string().optional(),
});
```

- [ ] **Step 2: Implement UI with SacredCard sections following Birth Data patterns**

- [ ] **Step 3: Wire up form submission → onboardingStore.setNameData → navigate to life-context**

- [ ] **Step 4: Commit**

---

### Task 10: Implement Life Context Screen (Step 4)

**Files:**
- Modify: `app/(onboarding)/life-context.tsx`

No direct Stitch screen, follow design language. Key elements:
- Title: "What brings you here today?"
- 6 concern chips in a 2x3 grid: love, career, money, health, family, spiritual
- Each chip toggleable (multi-select), gold border when active
- Optional urgency text input: "Tell us more about your situation..."
- CTA to continue

- [ ] **Step 1: Implement concern selection UI**

- [ ] **Step 2: Wire up → onboardingStore.setConcerns + setUrgencyContext → navigate to power-ups**

- [ ] **Step 3: Commit**

---

### Task 11: Implement Power-Ups Screen (Step 5)

**Files:**
- Modify: `app/(onboarding)/power-ups.tsx`

Permission requests screen. Key elements:
- Title: "Unlock Deeper Readings"
- Permission cards with icons and descriptions:
  - Location (for accurate astrology based on coordinates)
  - Notifications (daily energy score delivery)
- Each card has an enable/skip toggle
- CTA to continue

- [ ] **Step 1: Implement permission cards UI**

- [ ] **Step 2: Wire logic (request permissions with expo-location/expo-notifications when enabled)**

Note: For now, just track preference in state. Actual permission requests will use expo packages later.

- [ ] **Step 3: Navigate to soul-snapshot on continue**

- [ ] **Step 4: Commit**

---

### Task 12: Implement Soul Snapshot Screen (Step 6)

**Files:**
- Modify: `app/(onboarding)/soul-snapshot.tsx`

Translating from Stitch screen: `MOR DOO - Soul Snapshot`. Key elements:
- Back arrow + MOR DOO header
- "Ascension Complete" label + "Soul Snapshot" title
- EnergyScoreRing (score: 73, placeholder data)
- Sub-score bars: Business 78%, Heart 45%, Body 91%
- Primary insight quote in glass card with quote icon
- Lucky Elements row: Gold color, Number 8, Direction East
- Daily Ritual recommendation text
- Share button + "Enter the Realms" primary button
- Step 6 of 6 pagination indicator

- [ ] **Step 1: Implement full Soul Snapshot UI with EnergyScoreRing**

- [ ] **Step 2: Wire up "Enter the Realms" button**

On press:
1. Call `onboardingStore.completeOnboarding()`
2. Set auth (guest mode with UUID if not already set)
3. Navigate to `/(main)/pulse` with `router.replace`

- [ ] **Step 3: Run on simulator — verify full onboarding flow**

- [ ] **Step 4: Commit**

---

## Chunk 3: Main App Screens

### Task 13: Update Tab Bar Styling

**Files:**
- Modify: `app/(main)/_layout.tsx`

Update the tab bar to match Stitch design:
- Rounded top corners (2.5rem → 40px)
- Backdrop blur
- Gold border-top at 25% opacity
- Active tab: gold with glow indicator dot below
- Font: Manrope (need to add to fonts), uppercase, tracking-widest
- Icons: Use material symbols text (auto_awesome for Pulse, heart_connect for Oracle)

- [ ] **Step 1: Update tab bar styles to match Stitch bottom nav**

- [ ] **Step 2: Commit**

---

### Task 14: Implement Pulse Dashboard Screen

**Files:**
- Modify: `app/(main)/pulse/index.tsx`

Translating from Stitch screen: `MOR DOO - Pulse`. Key sections:
- Star Map header section (dark bg with SVG constellation dots, date/location overlay)
- Energy Score section: EnergyScoreRing (73 Prana Index) in glass container
- Insight quote: "A strong day for decisions..."
- Lucky Elements: 3-column grid (Color/Number/Direction)
- Power Windows: horizontal scroll of time-based energy windows (22:00 Prime, 23:00 Neutral, 00:00 Void)
- Cosmic Insights: news feed cards with icons and text

All data is placeholder/static for now — will be connected to API later.

- [ ] **Step 1: Create StarMapHeader component inline**

SVG constellation with circles and lines, location text overlay.

- [ ] **Step 2: Build Energy Score section with EnergyScoreRing**

- [ ] **Step 3: Build Lucky Elements grid**

- [ ] **Step 4: Build Power Windows horizontal scroll**

- [ ] **Step 5: Build Cosmic Insights news cards**

- [ ] **Step 6: Run on simulator to verify**

- [ ] **Step 7: Commit**

---

### Task 15: Implement Oracle Chat Screen

**Files:**
- Modify: `app/(main)/oracle/index.tsx`

Translating from Stitch screen: `MOR DOO - AI Chat`. Key elements:
- Mode toggle: Mor Doo / Strategist (locked) pills
- AI greeting message with gold left border, "Greeting from the Void" header
- User message bubble (dark bg, right-aligned)
- Tarot card spread (3 cards with icons, "Flipping the Sacred Arcana..." label)
- AI insight response with "The Revelation" header and "Save Wisdom" / "Resonated: 98%" footer
- Typing indicator (3 pulsing gold dots)
- Bottom input: ghost container with add button, text input, mic button, send button

- [ ] **Step 1: Create ChatMessage types and mode state**

```typescript
type ChatMode = 'mordoo' | 'strategist';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: 'text' | 'tarot';
}
```

- [ ] **Step 2: Build mode toggle UI**

- [ ] **Step 3: Build message rendering (AI bubble with gold border, user bubble dark)**

- [ ] **Step 4: Build tarot card spread system card**

- [ ] **Step 5: Build typing indicator**

- [ ] **Step 6: Build bottom input bar**

Position above tab bar using `bottom: 80` (tab bar height).

- [ ] **Step 7: Wire up message sending (placeholder AI responses for now)**

- [ ] **Step 8: Run on simulator to verify**

- [ ] **Step 9: Commit**

---

## Chunk 4: Polish & Integration

### Task 16: Ambient Background Component

**Files:**
- Create: `src/components/ui/AmbientBackground.tsx`

The Stitch designs use consistent ambient effects:
- Starfield dots (tiny white/gold dots scattered)
- Radial gold glow blurs at corners
- Used as absolute-positioned background layer

- [ ] **Step 1: Create AmbientBackground component**

- [ ] **Step 2: Add to Soul Gate and Soul Snapshot screens**

- [ ] **Step 3: Commit**

---

### Task 17: Wire Navigation Flow End-to-End

**Files:**
- Modify: `app/index.tsx`

Ensure the complete flow works:
1. Fresh user → Soul Gate → Birth Data → Name Numbers → Life Context → Power Ups → Soul Snapshot → Pulse
2. Returning user (onboarding complete) → Pulse directly
3. Guest mode generates UUID and sets auth

- [ ] **Step 1: Verify app/index.tsx routing logic is correct**

Current logic checks `isAuthenticated` and `onboardingComplete`. This should work as-is.

- [ ] **Step 2: Run full flow on simulator end-to-end**

- [ ] **Step 3: Fix any navigation issues found**

- [ ] **Step 4: Commit**

---

### Task 18: Add react-native-svg Dependency

**Files:**
- Modify: `package.json`

Required for EnergyScoreRing and StarMap components.

- [ ] **Step 1: Install**

Run: `npx expo install react-native-svg`

- [ ] **Step 2: Verify build succeeds**

---

## Dependencies Between Tasks

```
Task 1 (colors) → All other tasks
Task 18 (svg) → Task 4 (EnergyScoreRing) → Task 12 (Soul Snapshot), Task 14 (Pulse)
Task 2 (ProgressIndicator) → Tasks 7-12 (onboarding screens)
Task 3 (SacredCard) → Tasks 8-11 (form screens)
Task 5 (GoldButton) → Tasks 7-12 (onboarding screens)
Task 4 (EnergyScoreRing) → Task 12 (Soul Snapshot), Task 14 (Pulse)
Tasks 7-12 (onboarding) are sequential
Tasks 13-15 (main screens) can be parallelized
Task 17 (navigation) depends on all screens
```

## Execution Order

1. Tasks 1, 18 (foundations — colors + svg dependency)
2. Tasks 2, 3, 4, 5, 6 (shared components — parallelizable)
3. Tasks 7, 8, 9, 10, 11, 12 (onboarding — sequential)
4. Tasks 13, 14, 15 (main screens — parallelizable)
5. Tasks 16, 17 (polish — sequential)
