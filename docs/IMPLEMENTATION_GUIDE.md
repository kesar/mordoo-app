# Mor Doo AI — React Native Implementation Guide

> **Version:** 1.0 · **Confidential** · 2026
> This document is the complete technical blueprint for building the Mor Doo AI native app. It is written to be self-sufficient — an engineer or AI agent should be able to build the app from this document alone.

---

## Table of Contents

1. [Tech Stack & Tooling](#1-tech-stack--tooling)
2. [Project Bootstrapping](#2-project-bootstrapping)
3. [Directory Structure](#3-directory-structure)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Design System & Theming](#5-design-system--theming)
6. [Internationalization (i18n)](#6-internationalization-i18n)
7. [Onboarding Flow](#7-onboarding-flow)
8. [Section A — The Pulse (Daily Dashboard)](#8-section-a--the-pulse-daily-dashboard)
9. [Section B — The Oracle (AI Chat)](#9-section-b--the-oracle-ai-chat)
10. [Section C — The Compass (Business Tools)](#10-section-c--the-compass-business-tools)
11. [Section D — The Sanctuary (Rituals & Wellness)](#11-section-d--the-sanctuary-rituals--wellness)
12. [Section E — The Archive (Profile & History)](#12-section-e--the-archive-profile--history)
13. [Backend API Design](#13-backend-api-design)
14. [Astrology Engine Integration](#14-astrology-engine-integration)
15. [AI / LLM Integration](#15-ai--llm-integration)
16. [Memory & RAG System](#16-memory--rag-system)
17. [Image Generation Pipeline](#17-image-generation-pipeline)
18. [Authentication & User Data Model](#18-authentication--user-data-model)
19. [Payments & Subscriptions](#19-payments--subscriptions)
20. [Push Notifications](#20-push-notifications)
21. [Health Data Integration](#21-health-data-integration)
22. [Animations & Visual Effects](#22-animations--visual-effects)
23. [Sharing & Viral Mechanics](#23-sharing--viral-mechanics)
24. [Guardrails & Safety](#24-guardrails--safety)
25. [Testing Strategy](#25-testing-strategy)
26. [Build & Release Pipeline](#26-build--release-pipeline)
27. [Phased Build Roadmap](#27-phased-build-roadmap)

---

## V1/V2 Scope

This guide covers the full product vision across all five realms. However, the **v1 MVP** ships only a subset:

### V1 — MVP (Launch)
- **The Pulse** (Section A): Daily Energy Score, lucky color/number/direction, cosmic news
- **The Oracle** (Section B): AI chat reading, Siam Si, Tarot, Soul Snapshot
- **Pricing:** Freemium + Standard tier (฿149/mo). No micro-transactions in v1.
- **Navigation:** 2 bottom tabs (Pulse + Oracle)

### V2 — Post-Launch (see `docs/v2-roadmap.md`)
- **The Compass** (Section C): Auspicious dates, partner compatibility, crypto alerts, lucky numbers
- **The Sanctuary** (Section D): GPS temple finder, digital amulets, merit calendar, moon rituals
- **The Archive** (Section E): Life map, family circle, prophecy log, gamification
- **Pricing:** Premium tier (฿299/mo), micro-transactions (amulet packs, PDF reports, gift readings)

Sections marked **"V2 — Not in MVP"** in this guide are deferred. Build the v1 architecture so these can be added incrementally without restructuring.

---

## 1. Tech Stack & Tooling

### Mobile Client

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React Native 0.76+ (New Architecture) | Single codebase iOS + Android. Thailand is 65%+ Android — must be first-class. New Architecture for Fabric renderer + TurboModules performance. |
| **Navigation** | React Navigation 7 (native stack) | `@react-navigation/native-stack` for native transitions. Bottom tabs for the 5 realms (v1: 2 tabs — Pulse + Oracle; remaining 3 tabs added in v2). |
| **State Management** | Zustand + React Query (TanStack Query) | Zustand for client state (user profile, settings, language). React Query for all server state (readings, transit data, chat history). |
| **Styling** | Nativewind v4 (Tailwind for RN) | Utility-first styling with the design tokens defined in `tailwind.config.ts`. Consistent with the landing page's design language. |
| **Forms** | React Hook Form + Zod | Onboarding forms, birth data input, partner compatibility input. Zod schemas shared with backend validation. |
| **Animations** | React Native Reanimated 3 + Skia | Reanimated for gesture-driven and layout animations. `@shopify/react-native-skia` for the star map, energy ring, and amulet rendering. |
| **Charts** | Victory Native (XL) | Power Windows hourly chart, Energy Score history. Runs on Skia for 60fps. |
| **i18n** | i18next + react-i18next | Thai/English. Right-to-left not needed. Namespace per section. |
| **Storage** | MMKV (react-native-mmkv) | Synchronous, encrypted key-value store. 30x faster than AsyncStorage. For language pref, auth tokens, cached scores. |
| **Secure Storage** | expo-secure-store | For auth tokens and sensitive birth data encryption keys. |
| **HTTP Client** | Axios with interceptors | Auth token injection, retry logic, error normalization. |
| **WebSocket** | Socket.IO client | Real-time chat streaming from LLM. V2: live price feeds for crypto alerts. |
| **Maps** | react-native-maps (Google Maps) | V2: GPS Temple Finder. Google Maps preferred for Thailand coverage quality. |
| **Health** | react-native-health (iOS) + Health Connect (Android) | V2: Apple Health / Google Health Connect for HRV, sleep, step data. |
| **Haptics** | expo-haptics | Tactile feedback on tarot card draws, Siam Si shake, amulet generation. |
| **Camera/Shake** | expo-sensors (Accelerometer) | Siam Si phone-shake detection. |
| **Share** | react-native-share + react-native-view-shot | Screenshot-to-share pipeline for Soul Snapshots, amulets, readings. |
| **Payments** | RevenueCat | Wraps StoreKit 2 (iOS) and Google Play Billing. Manages subscription tiers, entitlements, and receipt validation server-side. |
| **PromptPay** | Custom integration via backend | V2: QR code generation for Thai PromptPay. Rendered client-side via `react-native-qrcode-skia`. |
| **Notifications** | Firebase Cloud Messaging (FCM) + APNs | Via `@react-native-firebase/messaging`. |
| **Analytics** | PostHog (self-hosted or cloud) | Privacy-first. PDPA-compliant. Funnel tracking, feature flags, session replay. |
| **Error Tracking** | Sentry (`@sentry/react-native`) | Crash reporting, performance monitoring, breadcrumbs. |
| **OTA Updates** | EAS Update (Expo) | Push JS bundle updates without App Store review. Critical for prompt/content changes. |

### Backend (reference — separate repo)

| Layer | Technology |
|---|---|
| **API** | FastAPI (Python 3.12+) |
| **Database** | PostgreSQL 16 + pgvector extension |
| **Cache** | Redis 7 (transit calculations, rate limiting) |
| **Vector Store** | pgvector (primary), Pinecone (if scale demands) |
| **Astrology** | pyswisseph (Swiss Ephemeris bindings) |
| **Chinese Astrology** | Custom Bazi engine (Python module) |
| **Numerology** | Custom Python module |
| **AI** | Anthropic Claude API (primary), OpenAI GPT-4o (fallback) |
| **Image Gen** | FLUX / Stable Diffusion via Replicate or Modal |
| **Payments** | Stripe API + PromptPay QR generation |
| **Task Queue** | Celery + Redis (report generation, image gen, batch notifications) |
| **File Storage** | AWS S3 / Cloudflare R2 (amulet images, PDF reports) |
| **Auth** | Supabase Auth or Firebase Auth (social login + phone OTP) |

---

## 2. Project Bootstrapping

```bash
# Initialize with React Native Community CLI (not Expo Go — we need native modules)
# Using Expo Dev Client for the best of both worlds
npx create-expo-app@latest mordoo-app --template expo-template-blank-typescript

cd mordoo-app

# Core dependencies
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install react-native-screens react-native-safe-area-context
npx expo install @shopify/react-native-skia
npx expo install react-native-mmkv expo-secure-store expo-haptics expo-sensors

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# State & data
npm install zustand @tanstack/react-query axios socket.io-client

# Styling
npm install nativewind tailwindcss

# Forms
npm install react-hook-form @hookform/resolvers zod

# i18n
npm install i18next react-i18next

# Charts & maps
npm install victory-native react-native-maps

# Sharing & media
npm install react-native-share react-native-view-shot

# Payments
npm install react-native-purchases  # RevenueCat

# Notifications
npm install @react-native-firebase/app @react-native-firebase/messaging

# Analytics & monitoring
npm install posthog-react-native @sentry/react-native

# Health data
npm install react-native-health  # iOS
# Android Health Connect requires separate native module setup

# Dev dependencies
npm install -D @types/react jest @testing-library/react-native
```

### Environment Configuration

Create `.env` files using `react-native-config` or Expo's built-in env support:

```
# .env.development
API_URL=http://localhost:8000/api/v1
WS_URL=ws://localhost:8000/ws
SENTRY_DSN=https://xxx@sentry.io/xxx
POSTHOG_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com
REVENUECAT_IOS_KEY=appl_xxx
REVENUECAT_ANDROID_KEY=goog_xxx
GOOGLE_MAPS_API_KEY=AIza_xxx
```

---

## 3. Directory Structure

```
mordoo-app/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout (providers, theme, splash)
│   ├── index.tsx                 # Entry redirect (→ onboarding or main)
│   ├── (auth)/                   # Auth group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── phone-verify.tsx
│   ├── (onboarding)/             # Onboarding flow (modal stack)
│   │   ├── _layout.tsx           # Stack navigator, no back gesture
│   │   ├── soul-gate.tsx         # Step 1: Language & identity
│   │   ├── birth-data.tsx        # Step 2: Date/time/place
│   │   ├── name-numbers.tsx      # Step 3: Name & number scan
│   │   ├── life-context.tsx      # Step 4: Primary concern
│   │   ├── power-ups.tsx         # Step 5: Optional data connections
│   │   └── soul-snapshot.tsx     # Step 6: First reading reveal
│   └── (main)/                   # Main app (bottom tabs)
│       ├── _layout.tsx           # Bottom tab navigator
│       ├── pulse/                # Section A — The Pulse
│       │   ├── _layout.tsx
│       │   ├── index.tsx         # Daily dashboard
│       │   ├── power-windows.tsx
│       │   └── cosmic-news.tsx
│       ├── oracle/               # Section B — The Oracle
│       │   ├── _layout.tsx
│       │   ├── index.tsx         # Chat interface
│       │   ├── tarot.tsx
│       │   └── siam-si.tsx
│       ├── compass/              # Section C — The Compass (V2)
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── auspicious-dates.tsx
│       │   ├── partner-compat.tsx
│       │   ├── crypto-alerts.tsx
│       │   └── lucky-numbers.tsx
│       ├── sanctuary/            # Section D — The Sanctuary (V2)
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── temple-finder.tsx
│       │   ├── amulet.tsx
│       │   ├── merit-calendar.tsx
│       │   └── moon-ritual.tsx
│       └── archive/              # Section E — The Archive (V2)
│           ├── _layout.tsx
│           ├── index.tsx         # Profile & life map
│           ├── family-circle.tsx
│           ├── prophecy-log.tsx
│           └── settings.tsx
├── src/
│   ├── api/                      # API client layer
│   │   ├── client.ts             # Axios instance, interceptors
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── readings.ts
│   │   │   ├── astrology.ts
│   │   │   ├── oracle.ts
│   │   │   ├── payments.ts
│   │   │   ├── temples.ts
│   │   │   └── user.ts
│   │   └── websocket.ts          # Socket.IO connection manager
│   ├── components/
│   │   ├── ui/                   # Primitive UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Text.tsx          # Wraps fonts (Cinzel, Cormorant, Noto Sans Thai)
│   │   │   ├── GradientBorder.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Badge.tsx
│   │   ├── astrology/
│   │   │   ├── EnergyRing.tsx    # Skia animated 0-100 ring
│   │   │   ├── StarMap.tsx       # Skia live star map
│   │   │   ├── NatalChart.tsx    # SVG/Skia natal wheel
│   │   │   ├── TransitCard.tsx
│   │   │   └── SubScoreBar.tsx   # Business/Heart/Body bars
│   │   ├── oracle/
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── StreamingText.tsx # Typewriter effect for LLM stream
│   │   │   ├── TarotCard.tsx     # Flip animation, card artwork
│   │   │   ├── TarotSpread.tsx   # Layout for 1/3/10 card spreads
│   │   │   └── SiamSiStick.tsx   # Animated bamboo stick
│   │   ├── sanctuary/
│   │   │   ├── TempleCard.tsx
│   │   │   ├── AmuletViewer.tsx  # Skia animated amulet
│   │   │   └── RitualStep.tsx
│   │   ├── compass/
│   │   │   ├── HourlyChart.tsx   # Victory Native power windows
│   │   │   ├── CompatMatrix.tsx  # 5-dimension radar chart
│   │   │   └── LuckyScoreCard.tsx
│   │   ├── archive/
│   │   │   ├── LifeTimeline.tsx
│   │   │   ├── PredictionRow.tsx
│   │   │   └── AchievementBadge.tsx
│   │   ├── onboarding/
│   │   │   ├── BirthPicker.tsx   # Custom date/time/place picker
│   │   │   ├── ConcernSelector.tsx
│   │   │   ├── SoulSnapshot.tsx  # The "aha" reveal card
│   │   │   └── ProgressDots.tsx
│   │   └── shared/
│   │       ├── ShareButton.tsx
│   │       ├── PaywallGate.tsx   # Wraps premium features
│   │       ├── LanguageToggle.tsx
│   │       ├── StarfieldBg.tsx   # Skia background stars
│   │       └── GoldDivider.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useLanguage.ts
│   │   ├── useEnergyScore.ts
│   │   ├── useOracleChat.ts     # WebSocket chat hook
│   │   ├── useSubscription.ts   # RevenueCat entitlements
│   │   ├── useHealthData.ts
│   │   ├── useLocation.ts
│   │   └── useShake.ts          # Accelerometer for Siam Si
│   ├── stores/
│   │   ├── authStore.ts         # Zustand: auth state
│   │   ├── userStore.ts         # Zustand: user profile, birth data
│   │   ├── settingsStore.ts     # Zustand: language, notifications, theme
│   │   └── onboardingStore.ts   # Zustand: onboarding progress
│   ├── services/
│   │   ├── notifications.ts     # FCM registration, handlers
│   │   ├── analytics.ts         # PostHog wrapper
│   │   ├── payments.ts          # RevenueCat + PromptPay logic
│   │   └── health.ts            # Apple Health / Health Connect
│   ├── utils/
│   │   ├── formatting.ts        # Date, currency (THB), number formatting
│   │   ├── zodiacHelpers.ts     # Sign names, element colors, icon mapping
│   │   ├── thaiCalendar.ts      # Thai day-of-week colors, lunar dates
│   │   └── shareImage.ts        # ViewShot → Share pipeline
│   ├── constants/
│   │   ├── colors.ts            # Design tokens
│   │   ├── typography.ts        # Font families, sizes
│   │   ├── tarot.ts             # 78 card definitions, images, keywords
│   │   ├── zodiac.ts            # Signs, planets, houses, aspects
│   │   ├── numerology.ts        # Life path calculation tables
│   │   └── tiers.ts             # Subscription tier definitions & entitlements
│   ├── i18n/
│   │   ├── index.ts             # i18next config
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── onboarding.json
│   │   │   ├── pulse.json
│   │   │   ├── oracle.json
│   │   │   ├── compass.json
│   │   │   ├── sanctuary.json
│   │   │   └── archive.json
│   │   └── th/
│   │       ├── common.json
│   │       ├── onboarding.json
│   │       ├── pulse.json
│   │       ├── oracle.json
│   │       ├── compass.json
│   │       ├── sanctuary.json
│   │       └── archive.json
│   └── types/
│       ├── user.ts
│       ├── astrology.ts         # NatalChart, Transit, Aspect, House types
│       ├── oracle.ts            # ChatMessage, TarotReading, SiamSiResult
│       ├── compass.ts           # AuspiciousDate, Compatibility, LuckyNumber
│       ├── sanctuary.ts         # Temple, Amulet, Ritual, MeritEvent
│       └── api.ts               # API response wrappers
├── assets/
│   ├── fonts/
│   │   ├── CinzelDecorative-Regular.ttf
│   │   ├── CinzelDecorative-Bold.ttf
│   │   ├── CormorantGaramond-Regular.ttf
│   │   ├── CormorantGaramond-Medium.ttf
│   │   ├── CormorantGaramond-SemiBold.ttf
│   │   ├── NotoSansThai-Regular.ttf
│   │   └── NotoSansThai-Medium.ttf
│   ├── images/
│   │   ├── tarot/               # 78 card face images + 1 card back
│   │   ├── realms/              # Tab icons for 5 sections (v1: 2 tabs)
│   │   ├── onboarding/          # Step illustrations
│   │   ├── zodiac/              # 12 Western sign icons
│   │   ├── elements/            # Fire, Water, Earth, Air, Wood, Metal
│   │   └── badges/              # Achievement badge artwork
│   ├── animations/
│   │   └── lottie/              # Loading ritual, card flip, shake prompt
│   └── sounds/                  # Optional: card flip, stick drop, gong
├── tailwind.config.ts
├── app.json                     # Expo config
├── eas.json                     # EAS Build config
├── tsconfig.json
└── .env.development
```

---

## 4. Navigation Architecture

### Root Layout (`app/_layout.tsx`)

The root wraps the entire app in providers and handles the initial routing decision.

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/src/theme';
import { I18nProvider } from '@/src/i18n';
import { AuthGate } from '@/src/components/shared/AuthGate';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min
      gcTime: 30 * 60 * 1000,       // 30 min cache
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(onboarding)" options={{ presentation: 'fullScreenModal' }} />
                <Stack.Screen name="(main)" />
              </Stack>
            </AuthGate>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

### Entry Point Logic (`app/index.tsx`)

```tsx
// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useOnboardingStore((s) => s.isComplete);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!onboardingComplete) return <Redirect href="/(onboarding)/soul-gate" />;
  return <Redirect href="/(main)/pulse" />;
}
```

### Bottom Tab Navigator (`app/(main)/_layout.tsx`)

The full vision has 5 "realms" as bottom tabs. **V1 ships with 2 tabs only (Pulse + Oracle).** The Compass, Sanctuary, and Archive tabs are added in v2. Each tab is a nested stack navigator.

```tsx
// app/(main)/_layout.tsx — V1 (2 tabs)
import { Tabs } from 'expo-router';
import { RealmTabBar } from '@/src/components/shared/RealmTabBar';

export default function MainLayout() {
  return (
    <Tabs
      tabBar={(props) => <RealmTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0a0a14' },
      }}
    >
      <Tabs.Screen name="pulse" options={{ title: 'Pulse' }} />
      <Tabs.Screen name="oracle" options={{ title: 'Oracle' }} />
      {/* V2: uncomment when ready */}
      {/* <Tabs.Screen name="compass" options={{ title: 'Compass' }} /> */}
      {/* <Tabs.Screen name="sanctuary" options={{ title: 'Sanctuary' }} /> */}
      {/* <Tabs.Screen name="archive" options={{ title: 'Archive' }} /> */}
    </Tabs>
  );
}
```

**Custom Tab Bar (`RealmTabBar`)**: Not the default React Navigation tab bar. Custom Skia-rendered bar with:
- Gold active indicator (animated sliding gold underline)
- Sacred geometry icons per realm (custom SVG/PNG, not generic icons)
- Subtle glow effect on active tab
- Haptic feedback on tab switch
- Animated badge for unread notifications (e.g., new prophecy fulfilled)

---

## 5. Design System & Theming

### Color Tokens (`src/constants/colors.ts`)

```ts
export const colors = {
  // Core palette (from landing page)
  gold: {
    DEFAULT: '#c9a84c',
    light: '#e8d48b',
    dark: '#a08339',
    muted: 'rgba(201, 168, 76, 0.15)',
    border: 'rgba(201, 168, 76, 0.3)',
  },
  night: {
    DEFAULT: '#0a0a14',
    surface: '#111122',
    elevated: '#1a1a2e',
    card: '#16162a',
  },
  parchment: {
    DEFAULT: '#f4e8c1',
    dim: 'rgba(244, 232, 193, 0.7)',
    muted: 'rgba(244, 232, 193, 0.4)',
  },
  // Semantic
  energy: {
    high: '#4ade80',     // Green — score 70-100
    medium: '#c9a84c',   // Gold — score 40-69
    low: '#ef4444',      // Red — score 0-39
  },
  elements: {
    fire: '#ef4444',
    water: '#3b82f6',
    earth: '#a16207',
    air: '#a78bfa',
    wood: '#22c55e',
    metal: '#94a3b8',
  },
  // Sub-scores
  business: '#f59e0b',   // Amber ⚡
  heart: '#ec4899',      // Pink ❤️
  body: '#22c55e',       // Green 🌿
} as const;
```

### Typography (`src/constants/typography.ts`)

```ts
export const fonts = {
  // Headers — mystical, ornate (Latin text)
  display: {
    regular: 'CinzelDecorative-Regular',
    bold: 'CinzelDecorative-Bold',
  },
  // Body — elegant serif (Latin text)
  body: {
    regular: 'CormorantGaramond-Regular',
    medium: 'CormorantGaramond-Medium',
    semibold: 'CormorantGaramond-SemiBold',
  },
  // Thai text — always use this family for Thai strings
  thai: {
    regular: 'NotoSansThai-Regular',
    medium: 'NotoSansThai-Medium',
  },
} as const;

// The Text component auto-selects font family based on detected script:
// Thai characters (Unicode range \u0E00-\u0E7F) → NotoSansThai
// Latin characters → Cinzel (headings) or Cormorant (body)
```

### Font Loading

```tsx
// In root _layout.tsx, load fonts before rendering
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const [fontsLoaded] = useFonts({
  'CinzelDecorative-Regular': require('@/assets/fonts/CinzelDecorative-Regular.ttf'),
  'CinzelDecorative-Bold': require('@/assets/fonts/CinzelDecorative-Bold.ttf'),
  'CormorantGaramond-Regular': require('@/assets/fonts/CormorantGaramond-Regular.ttf'),
  'CormorantGaramond-Medium': require('@/assets/fonts/CormorantGaramond-Medium.ttf'),
  'CormorantGaramond-SemiBold': require('@/assets/fonts/CormorantGaramond-SemiBold.ttf'),
  'NotoSansThai-Regular': require('@/assets/fonts/NotoSansThai-Regular.ttf'),
  'NotoSansThai-Medium': require('@/assets/fonts/NotoSansThai-Medium.ttf'),
});

// Hide splash when fonts + initial data are ready
useEffect(() => {
  if (fontsLoaded) SplashScreen.hideAsync();
}, [fontsLoaded]);
```

### Tailwind Config (`tailwind.config.ts`)

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{tsx,ts}', './src/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#c9a84c', light: '#e8d48b', dark: '#a08339' },
        night: { DEFAULT: '#0a0a14', surface: '#111122', elevated: '#1a1a2e', card: '#16162a' },
        parchment: { DEFAULT: '#f4e8c1' },
      },
      fontFamily: {
        display: ['CinzelDecorative-Regular'],
        'display-bold': ['CinzelDecorative-Bold'],
        body: ['CormorantGaramond-Regular'],
        'body-medium': ['CormorantGaramond-Medium'],
        thai: ['NotoSansThai-Regular'],
        'thai-medium': ['NotoSansThai-Medium'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 6. Internationalization (i18n)

### Configuration

```ts
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { storage } from '@/src/utils/storage'; // MMKV wrapper

import enCommon from './en/common.json';
import thCommon from './th/common.json';
// ... all namespaces

const savedLang = storage.getString('mordoo-lang');
const deviceLang = getLocales()[0]?.languageCode;

i18n.use(initReactI18next).init({
  lng: savedLang || (deviceLang === 'th' ? 'th' : 'en'),
  fallbackLng: 'en',
  ns: ['common', 'onboarding', 'pulse', 'oracle', 'compass', 'sanctuary', 'archive'],
  defaultNS: 'common',
  resources: {
    en: { common: enCommon, /* ... */ },
    th: { common: thCommon, /* ... */ },
  },
  interpolation: { escapeValue: false },
});

// Persist language changes
i18n.on('languageChanged', (lng) => {
  storage.set('mordoo-lang', lng);
});

export default i18n;
```

### Font-Aware Text Component

```tsx
// src/components/ui/Text.tsx
import { Text as RNText, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fonts } from '@/src/constants/typography';

const THAI_REGEX = /[\u0E00-\u0E7F]/;

interface MorDooTextProps extends TextProps {
  variant?: 'display' | 'body' | 'caption';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  i18nKey?: string;
}

export function Text({ variant = 'body', weight = 'regular', i18nKey, children, style, ...props }: MorDooTextProps) {
  const { t, i18n } = useTranslation();
  const text = i18nKey ? t(i18nKey) : children;
  const isThai = i18n.language === 'th' || (typeof text === 'string' && THAI_REGEX.test(text));

  const fontFamily = isThai
    ? (weight === 'medium' || weight === 'semibold' || weight === 'bold')
      ? fonts.thai.medium
      : fonts.thai.regular
    : variant === 'display'
      ? weight === 'bold' ? fonts.display.bold : fonts.display.regular
      : weight === 'semibold' ? fonts.body.semibold
        : weight === 'medium' ? fonts.body.medium
          : fonts.body.regular;

  return <RNText style={[{ fontFamily }, style]} {...props}>{text}</RNText>;
}
```

### Translation Structure Example

```json
// src/i18n/en/onboarding.json
{
  "soulGate": {
    "title": "Welcome, Seeker",
    "subtitle": "Choose your language to begin",
    "guestMode": "Continue as Guest",
    "createAccount": "Create Account"
  },
  "birthData": {
    "title": "Your Celestial Foundation",
    "subtitle": "This data is sacred — it defines your cosmic blueprint",
    "dateLabel": "Date of Birth",
    "timeLabel": "Time of Birth",
    "timeHint": "Even an approximate hour significantly changes your reading",
    "placeLabel": "Place of Birth",
    "genderLabel": "Gender (optional)",
    "genderOptions": {
      "male": "Male",
      "female": "Female",
      "nonBinary": "Non-binary",
      "preferNot": "Prefer not to say"
    }
  }
}
```

```json
// src/i18n/th/onboarding.json
{
  "soulGate": {
    "title": "ยินดีต้อนรับ ผู้แสวงหา",
    "subtitle": "เลือกภาษาของคุณเพื่อเริ่มต้น",
    "guestMode": "ดำเนินการในฐานะผู้เยี่ยมชม",
    "createAccount": "สร้างบัญชี"
  },
  "birthData": {
    "title": "รากฐานแห่งดวงดาวของคุณ",
    "subtitle": "ข้อมูลนี้ศักดิ์สิทธิ์ — มันกำหนดพิมพ์เขียวจักรวาลของคุณ",
    "dateLabel": "วันเกิด",
    "timeLabel": "เวลาเกิด",
    "timeHint": "แม้แค่เวลาโดยประมาณก็เปลี่ยนดวงของคุณได้อย่างมาก",
    "placeLabel": "สถานที่เกิด",
    "genderLabel": "เพศ (ไม่บังคับ)"
  }
}
```

---

## 7. Onboarding Flow

The onboarding is a **6-step modal stack** that feels like a spiritual ceremony, not a registration form. No skipping steps. No back gesture on step 1. Progress indicated by animated dots at the top.

### Step 1 — Soul Gate (`soul-gate.tsx`)

**Purpose:** Language selection, account creation decision.

**UI:**
- Full-screen dark background with animated star map (Skia canvas responding to device accelerometer via `expo-sensors`)
- App logo centered with gold glow pulse animation
- Two large language buttons: 🇹🇭 ไทย / 🇬🇧 English (each triggers immediate i18n switch)
- After language selected, slide up: "Continue as Guest" (text link) and "Create Account" (gold button)
- Guest mode stores data locally in MMKV; account syncs to backend

**State:**
```ts
// onboardingStore.ts
interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  language: 'en' | 'th';
  authMode: 'guest' | 'account';
  birthData: BirthData | null;
  nameData: NameData | null;
  concerns: Concern[];
  permissions: Permissions;
  isComplete: boolean;
}
```

**Guest Auth Flow:**
- Generate a local UUID stored in MMKV
- All API calls use this UUID as an anonymous identifier
- If user later creates an account, merge anonymous data into their profile via `POST /api/v1/auth/claim-guest`

**Account Auth Flow:**
- Phone number OTP (preferred for Thailand — most users don't have email habits)
- Optional: Apple Sign-In (iOS), Google Sign-In
- Firebase Auth or Supabase Auth handles the OTP/social login
- On success, store JWT in `expo-secure-store`

### Step 2 — Birth Data (`birth-data.tsx`)

**Purpose:** Collect date, time, and place of birth. This is the most critical data point — the entire app depends on it.

**UI:**
- Header: "Your Celestial Foundation" with subtle star particles
- Three animated picker sections that expand on tap:

**Date of Birth:**
- Custom scrollable picker (not native DatePicker — needs to match the mystical theme)
- Three columns: Day / Month / Year
- Year range: 1940–2015 (reasonable for app target demo)
- Buddhist Era (B.E.) toggle for Thai users (2569 = 2026 C.E.) — auto-converts internally
- Gold highlight on selected values

**Time of Birth:**
- Two columns: Hour (0–23) / Minute (0–59)
- Prominent helper text: "Even an approximate hour significantly changes your reading"
- "I don't know my birth time" option → defaults to 12:00 noon (standard astrological practice), flags in user data as `timeApproximate: true`

**Place of Birth:**
- Text input with autocomplete powered by Google Places API
- Returns latitude/longitude (needed for Swiss Ephemeris calculations)
- Pre-populated suggestions for major Thai cities (Bangkok, Chiang Mai, Phuket, Khon Kaen, etc.)
- Stores: city name, country, latitude, longitude

**Gender (optional):**
- Small selector below place: Male / Female / Non-binary / Prefer not to say
- Affects some traditional Thai and Chinese astrology calculations
- Clearly marked optional

**Validation (Zod):**
```ts
const birthDataSchema = z.object({
  dateOfBirth: z.date().max(new Date()),
  timeOfBirth: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
  }),
  timeApproximate: z.boolean(),
  placeOfBirth: z.object({
    name: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    country: z.string(),
  }),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not']).optional(),
});
```

**On submit:** Immediately send to backend → `POST /api/v1/astrology/natal-chart`. The backend runs pyswisseph and returns the full natal chart JSON. Store in React Query cache and Zustand. This data is used everywhere in the app.

### Step 3 — Name & Number Scan (`name-numbers.tsx`)

**Purpose:** Collect name for numerology, optional phone/plate for auspiciousness scoring.

**UI:**
- Full name input (supports Thai script and romanized)
- As user types, a live-updating numerology calculation animates below:
  - Life Path Number (from DOB, already known)
  - Name Vibration Number (calculated from name)
  - Show both as large animated numbers with brief meaning
- Phone number input (optional) — Thai format with +66 prefix
  - On input, animated score card appears: auspiciousness 0–100
  - Color-coded: green (lucky), gold (neutral), red (inauspicious)
  - Brief explanation: "Your number sums to 9, associated with completion and spiritual mastery"
- Car plate input (optional) — freeform text
  - Same scoring visualization
- Province/district selector (for GPS features later)

**Numerology calculation (client-side for instant feedback, verified server-side):**
```ts
// Pythagorean system for Latin characters
const PYTH_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

// Thai character numerology uses a different mapping table
// defined in src/constants/numerology.ts
```

### Step 4 — Life Context (`life-context.tsx`)

**Purpose:** Seed the AI's personality and first reading with the user's primary concern.

**UI:**
- Header: "What brings you here today?"
- 6 large tappable cards in a 2×3 grid, each with a sacred art icon and label:
  1. ❤️ Love & Relationships
  2. 💼 Career & Business
  3. 💰 Money & Investment
  4. 🌿 Health & Wellness
  5. 👨‍👩‍👧 Family
  6. 🔮 Spiritual Growth
- Multi-select (1–3 choices). Selected cards get gold border glow + haptic.
- Below the grid: "How urgent is this?"
  - Two-option toggle: "Just exploring" / "I need guidance on a specific decision"
  - If "specific decision" → a text input appears: "Briefly describe your situation" (max 200 chars)

**This data shapes:**
- The AI system prompt's emphasis areas
- The Soul Snapshot's focus
- Default sort order for Compass tools
- Push notification content priority

### Step 5 — Power-Ups (`power-ups.tsx`)

**Purpose:** Optional permissions for richer features. No hard gates.

**UI:**
- Header: "Unlock Deeper Readings"
- Four permission cards, each toggleable:

| Permission | What It Unlocks | iOS API | Android API |
|---|---|---|---|
| Health Data | Correlate HRV/sleep with planetary transits | HealthKit via `react-native-health` | Health Connect |
| Location | GPS Temple Finder, location-based rituals | `expo-location` | `expo-location` |
| Calendar | Business timing integration, auspicious date export | `expo-calendar` | `expo-calendar` |
| Notifications | Daily Energy Score push, alerts | FCM + APNs via `@react-native-firebase/messaging` | FCM |

- Each card shows: icon, title, one-line benefit, toggle switch
- "Skip for now" link at bottom (all can be enabled later in Settings)
- Granting a permission triggers the native permission dialog immediately

**Implementation notes:**
- Request permissions sequentially (not all at once — users reject batch requests)
- If denied, store the denial and don't re-ask until user goes to Settings
- Health and Calendar are Phase 3+ features — in Phase 1, show these cards as "Coming soon" with a notification signup

### Step 6 — Soul Snapshot (`soul-snapshot.tsx`)

**Purpose:** The "aha" moment. The first personalized reading that hooks the user.

**API Call:**
```ts
// Triggered when entering this screen
const { data, isLoading } = useQuery({
  queryKey: ['soul-snapshot', user.id],
  queryFn: () => api.readings.getSoulSnapshot({
    natalChart: user.natalChart,
    numerology: user.numerology,
    concerns: onboarding.concerns,
    context: onboarding.urgencyContext,
  }),
  staleTime: Infinity, // Never refetch — this is a one-time reading
});
```

**Loading State (3-5 seconds):**
- Full-screen ritual animation (Lottie or Skia):
  - Stars swirling into a formation
  - Sacred geometry drawing itself
  - Gold particles converging into a circle
- Text below animation cycles through mystical loading messages:
  - "Reading the stars..."
  - "Calculating your celestial blueprint..."
  - "The cosmos speaks..."
- Minimum display time: 3 seconds (even if API responds faster — the ritual feeling matters)

**Result Display:**
- Full-screen card with gradient background (deep blue → gold edges)
- **Energy Score** at top: large animated ring filling to the number
- **Three sub-scores:** Business ⚡ / Heart ❤️ / Body 🌿 as smaller bars
- **Primary insight** (2-3 sentences, AI-generated): Must be hyper-specific. Not "you are ambitious" but "Your Mercury in Scorpio combined with Life Path 8 means you think three moves ahead in business, but Mars retrograde this month creates friction with water-element partners."
- **Today's lucky elements:** Color, number, direction
- **One actionable recommendation:** "Today: wear gold to amplify your Sun in Leo. Avoid signing contracts after 3pm when the Moon squares your natal Saturn."
- **Share button** (prominent): Captures the card as an image and opens share sheet
- **"Enter the Realms" button** at bottom → navigates to `(main)/pulse` and marks onboarding complete

**Share Card Generation:**
```tsx
// Uses react-native-view-shot to capture the card
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';

const cardRef = useRef<View>(null);

const handleShare = async () => {
  const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
  await Share.open({
    url: uri,
    title: 'My Mor Doo Soul Snapshot',
    message: 'Discover your cosmic blueprint at mordoo.ai',
  });
  analytics.track('soul_snapshot_shared');
};
```

---

## 8. Section A — The Pulse (Daily Dashboard)

**Tab icon:** Pulsing concentric circles (custom animated icon)

### Main Screen (`pulse/index.tsx`)

The home screen that opens every day. Must load fast — most data is pre-calculated at midnight Bangkok time and cached.

**Layout (top to bottom, ScrollView):**

#### 1. Star Map Header
- **Skia Canvas** filling the top 40% of the screen
- Renders current sky over Bangkok (simplified — show Sun, Moon, and visible planets as gold dots on a dark field)
- Responds to device tilt via accelerometer (parallax)
- Current date and time overlaid in Cinzel font
- Fades into the Energy Score section below

#### 2. Energy Score Ring
- Large circular ring (Skia `Path` with animated `dashOffset`)
- Number 0–100 in center, color-coded (green/gold/red)
- Ring fills with animation on screen load (Reanimated `withTiming`, 1.5s, easeOut)
- Below ring: one-sentence AI summary — "A strong day for decisions, but guard your energy after 6pm"
- Three sub-score bars horizontally:
  - ⚡ Business: 78
  - ❤️ Heart: 45
  - 🌿 Body: 91

**API:**
```
GET /api/v1/pulse/daily?user_id={id}&date={YYYY-MM-DD}

Response:
{
  "energyScore": 73,
  "subScores": { "business": 78, "heart": 45, "body": 91 },
  "summary": "A strong day for decisions...",
  "luckyElements": {
    "color": { "en": "Gold", "th": "ทอง", "hex": "#c9a84c" },
    "number": 8,
    "direction": { "en": "East", "th": "ตะวันออก" }
  },
  "powerWindows": [...],
  "cosmicNews": [...]
}
```

#### 3. Lucky Elements Row
- Three cards in a horizontal row:
  - Lucky Color: circle swatch + name
  - Lucky Number: large numeral
  - Lucky Direction: compass arrow icon + name
- Tapping any card shows a brief tooltip explaining why (e.g., "Gold amplifies your Sun in Leo today")

#### 4. Power Windows Preview (Standard tier)
- Horizontal scrollable timeline showing next 6 hours
- Each hour is a small card: colored green/gold/red with an icon (deal, conversation, rest)
- "See full day →" link opens `power-windows.tsx`
- Free users see 2 hours blurred with a PaywallGate overlay

#### 5. Cosmic News Feed
- 3 cards in a vertical list, each with:
  - Headline: "Mercury Retrograde Begins Tomorrow"
  - One-line context: "Expect communication delays — review contracts carefully this week"
  - Tag: "Transit" / "Market" / "Personal"
- "See all →" opens `cosmic-news.tsx`

### Power Windows (`pulse/power-windows.tsx`)

**Standard tier feature.** The TradingView-style hourly chart.

- **Victory Native area chart** showing 24 hours (midnight to midnight, Bangkok time)
- Y-axis: 0–100 luck score
- X-axis: Hours (00:00–23:59)
- Color gradient fill: green zones (good hours), red zones (afflicted hours)
- Vertical markers for key events:
  - 🤝 "Best hour for meetings: 10:00–11:00"
  - ✍️ "Sign contracts: 14:00–15:00"
  - ⚠️ "Avoid new initiatives: 18:00–20:00"
- Tapping any hour shows a bottom sheet with detailed explanation
- "Add to Calendar" button for recommended action windows

### Cosmic News (`pulse/cosmic-news.tsx`)

- Full-page vertical feed
- Each item: transit event + AI analysis of how it affects the user specifically + real-world correlations (Thai economic news, crypto moves)
- Pull-to-refresh
- Updated 3x daily (morning, midday, evening)

---

## 9. Section B — The Oracle (AI Chat)

**Tab icon:** Crystal ball or third eye

### Chat Interface (`oracle/index.tsx`)

The centerpiece of the app. Must feel like a private consultation, not a chatbot.

**UI Structure:**
- Dark full-screen with subtle particle background
- Mode toggle at top: "🔮 Mor Doo" / "📊 Strategist" (Strategist is V2 — Premium tier only)
- Chat messages in a FlatList (inverted)
- Input bar at bottom with: text input, send button, attachment menu (tarot, siam si)

**Chat Bubble Design:**
- **AI messages (left):** Dark card with gold left border. Text in parchment color. Cinzel for any headers within the message. Typing indicator is three pulsing gold dots.
- **User messages (right):** Slightly lighter card, no border. Right-aligned.
- **System cards:** Full-width cards for tarot draws, prediction logs, etc. Embedded inline in the chat.

**Streaming Implementation:**
```tsx
// src/hooks/useOracleChat.ts
import { useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/src/stores/userStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tarotCards?: TarotCard[];
    prediction?: Prediction;
    siamSiNumber?: number;
  };
}

export function useOracleChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const user = useUserStore((s) => s.profile);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    const socket = io(WS_URL, {
      auth: { token: getAuthToken() },
      query: { userId: user.id },
    });

    socket.on('token', (data: { text: string }) => {
      setStreamingText((prev) => prev + data.text);
    });

    socket.on('done', (data: { fullMessage: string; metadata?: any }) => {
      setIsStreaming(false);
      setStreamingText('');
      setMessages((prev) => [...prev, {
        id: data.metadata?.messageId || uuid(),
        role: 'assistant',
        content: data.fullMessage,
        timestamp: new Date(),
        metadata: data.metadata,
      }]);
    });

    socket.on('error', (err) => {
      setIsStreaming(false);
      // Show error toast
    });

    socketRef.current = socket;
  }, [user.id]);

  const sendMessage = useCallback((text: string, mode: 'mordoo' | 'strategist') => {
    if (!socketRef.current) return;

    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    socketRef.current.emit('chat', {
      message: text,
      mode,
      conversationId: currentConversationId,
    });
  }, []);

  return { messages, isStreaming, streamingText, sendMessage, connect };
}
```

**StreamingText Component:**
```tsx
// Typewriter effect for LLM streaming
export function StreamingText({ text }: { text: string }) {
  // Text appears character by character with a subtle fade-in
  // Use Reanimated FadeIn on each new chunk
  return (
    <Text className="text-parchment font-body text-base">
      {text}
      <BlinkingCursor /> {/* Gold blinking underscore */}
    </Text>
  );
}
```

**Mode Differences:**

| Aspect | 🔮 Mor Doo Mode | 📊 Strategist Mode |
|---|---|---|
| Tone | Warm, mystical, elder-like | Cold, analytical, data-forward |
| Language | Metaphorical, references Buddhist merit, spiritual imagery | Direct, numbered lists, probability language |
| Ritual suggestions | Yes — "Light a yellow candle facing East tonight" | No — focuses on timing and action |
| Response length | Longer, narrative | Concise, bullet-pointed |
| System prompt modifier | `PERSONA: compassionate_oracle` | `PERSONA: analytical_strategist` |
| Tier | Free (1/day) + Standard (unlimited) | V2 Premium only |

**Daily Limit (Free Tier):**
- Free users get 1 Oracle question per day
- After the free question, the input bar shows a PaywallGate with: "Unlock unlimited readings with Standard — ฿149/month"
- The daily limit resets at midnight Bangkok time
- Track via `GET /api/v1/user/usage?feature=oracle&date={today}`

### Tarot Draw (`oracle/tarot.tsx`)

**Spread Types:**
1. **Single Card** — Free tier. Quick answer.
2. **Three-Card Spread** (Past / Present / Future) — Free tier.
3. **Celtic Cross** (10 cards) — Standard tier.

**UI Flow:**
1. User selects spread type
2. Screen shows card backs fanned out (Skia-rendered, 78 cards in an arc)
3. User taps to select cards (or "auto-draw" button)
4. Selected card(s) flip with 3D rotation animation (Reanimated + perspective transform)
5. Cards settle into spread layout positions
6. AI interpretation appears below each card, streaming in
7. Summary interpretation at the bottom ties the spread to the user's natal chart

**Card Flip Animation:**
```tsx
// TarotCard.tsx — core flip animation
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolation,
} from 'react-native-reanimated';

export function TarotCard({ card, isRevealed, onFlip }: TarotCardProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isRevealed) {
      rotation.value = withTiming(180, { duration: 800 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isRevealed]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  return (
    <Pressable onPress={onFlip}>
      <Animated.View style={[styles.card, frontStyle]}>
        <Image source={card.image} style={styles.cardImage} />
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        <Image source={require('@/assets/images/tarot/card-back.png')} style={styles.cardImage} />
      </Animated.View>
    </Pressable>
  );
}
```

**Card Selection API:**
```
POST /api/v1/oracle/tarot
{
  "spreadType": "three_card",      // "single" | "three_card" | "celtic_cross"
  "question": "Should I accept the job offer?",
  "userId": "uuid"
}

Response:
{
  "readingId": "uuid",
  "cards": [
    {
      "position": "past",
      "cardId": 14,                // Major Arcana: Temperance
      "name": "Temperance",
      "reversed": false,
      "imageUrl": "...",
      "interpretation": "Your patience in the previous role has prepared you..."
    },
    // ...
  ],
  "synthesis": "The cards collectively suggest a period of transition aligned with your Jupiter in the 10th house..."
}
```

**Important:** Card selection is NOT pure random. The backend uses a weighted RNG seeded by the current planetary transits + user's natal chart to create selections that feel cosmically coherent. The weighting is subtle — it biases toward cards associated with the currently active planets/elements.

### Siam Si (`oracle/siam-si.tsx`)

Digital version of the Thai temple fortune-stick ceremony.

**UI Flow:**
1. Screen shows a virtual bamboo container with numbered sticks
2. Instruction: "Focus on your question, then shake your phone"
3. User shakes phone → accelerometer detects shake pattern via `useShake` hook:

```tsx
// src/hooks/useShake.ts
import { Accelerometer } from 'expo-sensors';

export function useShake(onShake: () => void, threshold = 1.8) {
  const lastShake = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > threshold && now - lastShake.current > 1000) {
        lastShake.current = now;
        onShake();
      }
    });
    return () => sub.remove();
  }, [onShake, threshold]);
}
```

4. Shake triggers: sticks animate (scatter and settle), one stick "falls out"
5. Stick number revealed (1–28 or 1–100 depending on tradition)
6. AI delivers: classical Thai poem/verse + modern contextual interpretation
7. Haptic feedback: medium impact on shake, heavy on stick reveal

**Free tier:** 5 draws per month. Standard: unlimited.

---

## 10. Section C — The Compass (Business Tools)

> **V2 — Not in MVP.** This entire section is deferred to v2. See `docs/v2-roadmap.md`.

**Tab icon:** Compass rose

### Auspicious Date Finder (`compass/auspicious-dates.tsx`)

**Premium feature.**

**UI:**
1. Event type selector (dropdown or bottom sheet):
   - Company registration
   - Product launch
   - Contract signing
   - Job start date
   - Move in / new house
   - Wedding date
   - Important meeting
   - Custom (text input)

2. Date range selector: "Find dates between [start] and [end]" (default: next 90 days)

3. Results: Calendar view (monthly) with days color-coded:
   - 🟢 Excellent (score 80–100)
   - 🟡 Good (score 50–79)
   - 🔴 Avoid (score 0–49)
   - ⚫ Neutral / no data

4. Tapping a day shows detail bottom sheet:
   - Overall score for this event type
   - Best hours within that day
   - Which astrological factors support/oppose
   - "Add to Calendar" button (uses `expo-calendar`)

**API:**
```
POST /api/v1/compass/auspicious-dates
{
  "userId": "uuid",
  "eventType": "contract_signing",
  "startDate": "2026-03-20",
  "endDate": "2026-06-20"
}

Response:
{
  "dates": [
    {
      "date": "2026-03-25",
      "score": 92,
      "bestHours": ["10:00-11:30", "14:00-15:00"],
      "factors": {
        "positive": ["Jupiter trine natal Mercury", "Thai lunar day 9 (auspicious)"],
        "negative": ["Moon void of course after 16:00"]
      },
      "recommendation": "Excellent day for signing. Complete before 4pm."
    },
    // ...
  ]
}
```

### Partner Compatibility (`compass/partner-compat.tsx`)

**Premium feature.**

**Input:** Partner's birth date (required), time (optional), place (optional).

**Output — 5-dimension compatibility matrix:**
1. Trust & Loyalty (Moon aspects)
2. Communication (Mercury aspects)
3. Vision Alignment (Jupiter/Saturn)
4. Conflict Style (Mars aspects)
5. Financial Compatibility (Venus/2nd house)

**UI:**
- Radar chart (Victory Native) showing the 5 dimensions
- Composite score (0–100) in center
- Below chart: detailed AI analysis per dimension
- "Generate PDF Report" button (฿149 micro-transaction) → `POST /api/v1/compass/compat-report/pdf`

### Crypto Astrology Alerts (`compass/crypto-alerts.tsx`)

**Premium (Business Elite) feature.**

**Setup:**
- User adds crypto watchlist (BTC, ETH, etc.)
- Toggle alerts per asset

**How it works:**
- Backend correlates known astrological volatility periods with user's natal chart
- Push notification when high-volatility transit is approaching
- In-app: list of upcoming alerts with date, asset, transit, and risk level

**Legal:** Every screen and notification includes disclaimer: "For entertainment purposes. Not financial advice. Consult a licensed financial advisor."

### Lucky Number Analyzer (`compass/lucky-numbers.tsx`)

**The viral feature.** Available to all tiers (drives organic sharing).

**Input:** Phone number, business name, address, or license plate — single text input with auto-detection.

**Output:**
- Auspiciousness score: 0–100 with animated ring fill
- Element breakdown (5 Thai elements)
- Digit sum analysis
- Specific lucky/unlucky digit positions
- "Better alternatives" suggestions (e.g., "Change last 2 digits to 89 for +15 points")
- Share button generates a card image

**Client-side preview calculation** for instant feedback, then confirmed by server:
```ts
function quickScore(input: string): number {
  const digits = input.replace(/\D/g, '');
  const sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
  const reduced = reduceToSingle(sum); // Keep summing digits until single digit
  // Thai numerology: 1,6,9 are very lucky; 4 is unlucky
  const luckyDigits = [1, 6, 9];
  const bonus = luckyDigits.includes(reduced) ? 20 : 0;
  return Math.min(100, 50 + bonus + (reduced * 3));
}
```

---

## 11. Section D — The Sanctuary (Rituals & Wellness)

> **V2 — Not in MVP.** This entire section is deferred to v2. See `docs/v2-roadmap.md`.

**Tab icon:** Lotus flower

### GPS Temple Finder (`sanctuary/temple-finder.tsx`)

**Thai-exclusive feature.** Phase 2+.

**How it works:**
1. User states their problem (or it's inferred from recent Oracle conversations)
2. AI maps problem → specific deity/spirit → temples that house that deity
3. `react-native-maps` shows nearby temples with custom gold markers

**Map UI:**
- Dark-themed Google Map (custom map style JSON for the mystical look)
- Gold pin markers for recommended temples
- Tapping a marker shows a bottom sheet:
  - Temple name (Thai + English)
  - Distance and walking/driving time
  - Specific deity to petition
  - Offering instructions: "Bring 9 yellow candles and lotus flowers"
  - Best time to visit (astrologically calculated)
  - "Navigate" button → opens Google Maps/Apple Maps

**Temple Database:**
- Curated database of 500+ temples in Bangkok, Chiang Mai, major cities
- Each temple entry:
  ```ts
  interface Temple {
    id: string;
    nameTh: string;
    nameEn: string;
    latitude: number;
    longitude: number;
    deities: string[];          // e.g., ["Ganesha", "Brahma"]
    specialties: string[];       // e.g., ["financial_luck", "love", "health"]
    offeringInstructions: { th: string; en: string };
    bestVisitDays: string[];     // e.g., ["Thursday"] for Ganesha
    photoUrl: string;
    rating: number;
  }
  ```

### Digital Amulet Generator (`sanctuary/amulet.tsx`)

**Monetization feature.**

**Flow:**
1. User selects intention: Wealth / Protection / Love / Health / Wisdom
2. AI generates a Yantra (sacred geometry) personalized to:
   - User's birth chart (dominant elements determine geometry style)
   - Current planetary transits (colors and symbols change)
   - Selected intention (different geometric patterns per intention)
3. Loading: sacred geometry draws itself on screen (Skia path animation)
4. Result: high-res image displayed full-screen
5. "Set as Wallpaper" button + "Share" button

**Generation Pipeline:**
```
Client request → Backend API → Task Queue (Celery) →
Image Gen Service (FLUX/SD on Replicate) → Upload to S3 → Return URL
```

**Tiers:**
- Free: One basic amulet on onboarding
- Premium: Weekly auto-generated amulet (notification: "Your new amulet is ready")
- Micro-transaction: ฿79 for a custom 7-amulet pack with 3-day ritual guide

**Animated Amulets (Premium):**
- Skia canvas renders the amulet with subtle animation:
  - Slow rotation of outer geometry
  - Pulsing glow on central symbol
  - Particle effects emanating from edges
- Exported as video/GIF for sharing

### Merit Calendar (`sanctuary/merit-calendar.tsx`)

**Cultural feature.**

- Monthly calendar view with merit-making opportunities highlighted
- Each event:
  - Type: food donation, bird/fish release, monk meal sponsorship, temple visit
  - Specific date and reason (astrological + Buddhist calendar alignment)
  - Location suggestion (nearest temple or organization)
  - "Set Reminder" button
- If donation platform integrations exist (Phase 4), deep-link to donate

### Moon Ritual Guide (`sanctuary/moon-ritual.tsx`)

- Notifications on new moon and full moon
- Personalized ritual based on which house the moon transits in the user's chart
- Step-by-step instructions with illustrations
- E.g., "This full moon is in your 10th house of career. Tonight: write your career intentions on paper, light a yellow candle facing East."
- Completion tracking: "Mark as done" → logged in Archive

---

## 12. Section E — The Archive (Profile & History)

> **V2 — Not in MVP.** This entire section is deferred to v2. See `docs/v2-roadmap.md`.

**Tab icon:** Open book / scroll

### Life Map (`archive/index.tsx`)

A scrollable vertical timeline of the user's life divided by astrological cycles.

**UI:**
- Vertical timeline (FlatList) with nodes at major cycle points:
  - Saturn return (~29, ~58)
  - Jupiter return (every ~12 years)
  - Nodal return (every ~18.6 years)
  - Progressed Moon sign changes (~2.5 year cycles)
- Each node: year range, cycle name, AI interpretation
- Past periods annotated: "The turbulence you felt in 2019–2020 was your first Saturn square"
- Future periods: "2027–2029: Jupiter enters your 7th house — partnerships transform"
- Timeline nodes expand on tap to show full reading

### Family & Circle (`archive/family-circle.tsx`)

- Add birth data for family members, partners, business associates
- Each person shows: mini natal chart, current energy, compatibility with user
- Alerts when their transits align with major events

### Prophecy Log (`archive/prophecy-log.tsx`)

- Chronological list of all AI predictions
- Each entry: date, prediction text, outcome buttons (✅ Accurate / ❌ Inaccurate / ⏳ Pending)
- Running accuracy percentage displayed prominently
- Gamification:
  - "Seer" badge: 80%+ accuracy streak
  - "Star Warrior" badge: 30-day check-in streak
  - "Oracle's Trust" badge: 100 predictions logged
- Opt-in leaderboard among friends

### Settings (`archive/settings.tsx`)

- Language toggle (Thai / English)
- Edit birth data
- Manage subscriptions (deep-links to RevenueCat management)
- Notification preferences (per-feature toggles)
- Connected accounts (Health, Calendar)
- Data export (PDPA compliance)
- Delete account
- Privacy policy, Terms of service
- App version

---

## 13. Backend API Design

### Base URL Structure

```
Production:  https://api.mordoo.ai/v1
Staging:     https://api-staging.mordoo.ai/v1
```

### Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

Guest users use:
```
X-Guest-ID: <uuid>
```

### Core Endpoints

```yaml
# Auth
POST   /auth/register              # Phone OTP or social login
POST   /auth/verify-otp            # Verify phone OTP
POST   /auth/refresh               # Refresh JWT
POST   /auth/claim-guest           # Convert guest → registered user
DELETE /auth/account                # Delete account (PDPA)

# User Profile
GET    /user/profile
PUT    /user/profile
PUT    /user/birth-data
GET    /user/usage                  # Feature usage counts (for free tier limits)

# Astrology Engine
POST   /astrology/natal-chart       # Calculate natal chart from birth data
GET    /astrology/transits/today    # Today's transits for user
GET    /astrology/transits/range    # Transit data for date range

# Pulse (Daily Dashboard)
GET    /pulse/daily                 # Energy score, sub-scores, lucky elements
GET    /pulse/power-windows         # Hourly chart data
GET    /pulse/cosmic-news           # AI-curated news feed

# Oracle (AI Chat)
POST   /oracle/chat                 # Send message (REST fallback, prefer WebSocket)
GET    /oracle/history              # Chat history (paginated)
POST   /oracle/tarot                # Draw tarot cards
POST   /oracle/siam-si              # Draw fortune stick

# Compass (Business Tools)
POST   /compass/auspicious-dates    # Find best dates for event type
POST   /compass/partner-compat      # Calculate compatibility
POST   /compass/partner-compat/pdf  # Generate PDF report (async, returns job ID)
GET    /compass/partner-compat/pdf/{jobId}  # Poll/download PDF
POST   /compass/lucky-number        # Analyze number/name
GET    /compass/crypto-alerts       # Get user's active alerts
POST   /compass/crypto-alerts       # Configure alert

# Sanctuary
GET    /sanctuary/temples           # Search temples (query: lat, lng, problem_type)
GET    /sanctuary/temples/{id}
POST   /sanctuary/amulet/generate   # Generate amulet (async)
GET    /sanctuary/amulet/{jobId}    # Poll/get amulet image
GET    /sanctuary/merit-calendar    # Monthly merit events
GET    /sanctuary/moon-ritual       # Current moon ritual

# Archive
GET    /archive/life-map
GET    /archive/family              # List saved people
POST   /archive/family              # Add person
GET    /archive/predictions         # All predictions (paginated)
PUT    /archive/predictions/{id}    # Mark outcome (accurate/inaccurate)
GET    /archive/achievements        # Gamification badges

# Payments
POST   /payments/promptpay/create   # Generate PromptPay QR for micro-transaction
POST   /payments/promptpay/verify   # Verify PromptPay payment
POST   /payments/webhook/revenuecat # RevenueCat webhook for subscription events
POST   /payments/webhook/stripe     # Stripe webhook

# Readings (general)
GET    /readings/soul-snapshot      # Get or generate soul snapshot
```

### WebSocket Events

```yaml
# Connection
connect:      { auth: { token: "jwt" } }
disconnect:   automatic cleanup

# Oracle Chat
client → chat:      { message: string, mode: "mordoo" | "strategist", conversationId: string }
server → token:     { text: string }                    # Streaming token
server → done:      { fullMessage: string, metadata: {} } # Stream complete
server → error:     { code: string, message: string }

# Real-time Alerts
server → crypto_alert:  { asset: string, transit: string, riskLevel: string }
server → energy_update:  { score: number }              # If score changes significantly intra-day
```

---

## 14. Astrology Engine Integration

### Architecture Principle

> **Never let an LLM do math.** Deterministic engines for calculation, AI for interpretation.

```
Birth Data → pyswisseph → Natal Chart JSON → stored in DB
Daily Cron → pyswisseph → Today's Transits JSON → cached in Redis
User Request → Natal JSON + Transit JSON → LLM → Human-readable interpretation
```

### Natal Chart JSON Structure

```ts
interface NatalChart {
  // Planetary positions
  planets: {
    sun: PlanetPosition;
    moon: PlanetPosition;
    mercury: PlanetPosition;
    venus: PlanetPosition;
    mars: PlanetPosition;
    jupiter: PlanetPosition;
    saturn: PlanetPosition;
    uranus: PlanetPosition;
    neptune: PlanetPosition;
    pluto: PlanetPosition;
    northNode: PlanetPosition;
    chiron: PlanetPosition;
  };
  // House cusps (Placidus system default, Whole Sign as option)
  houses: {
    cusps: [number, number, number, number, number, number,
            number, number, number, number, number, number]; // 12 house cusps in degrees
    system: 'placidus' | 'whole_sign';
  };
  // Aspects between planets
  aspects: Aspect[];
  // Derived data
  ascendant: { sign: ZodiacSign; degree: number };
  midheaven: { sign: ZodiacSign; degree: number };
  dominantElement: 'fire' | 'earth' | 'air' | 'water';
  dominantModality: 'cardinal' | 'fixed' | 'mutable';
}

interface PlanetPosition {
  longitude: number;         // 0–360 degrees
  sign: ZodiacSign;          // 'aries' | 'taurus' | ...
  degree: number;            // Degree within sign (0–29)
  minute: number;            // Arc minutes
  house: number;             // 1–12
  retrograde: boolean;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;               // Degrees of inexactness
  applying: boolean;         // Getting closer (stronger) or separating
}
```

### Chinese Astrology (Bazi) JSON Structure

```ts
interface BaziChart {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  dayMaster: ChineseElement;  // The user's core element
  luckyElement: ChineseElement;
  currentLuckCycle: {
    startAge: number;
    endAge: number;
    pillar: Pillar;
    element: ChineseElement;
  };
  annualLuck: {
    year: number;
    pillar: Pillar;
    interaction: string;      // e.g., "clash", "combine", "punishment"
  };
}

interface Pillar {
  heavenlyStem: string;       // e.g., "甲 (Jiǎ)"
  earthlyBranch: string;      // e.g., "子 (Zǐ)"
  element: ChineseElement;
  animal: string;             // Chinese zodiac animal
}

type ChineseElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
```

### Thai Numerology JSON

```ts
interface NumerologyProfile {
  lifePath: number;           // 1–9 or 11, 22, 33 (master numbers)
  nameVibration: number;
  destinyNumber: number;
  soulUrge: number;
  personalYear: number;       // Current year's influence
  personalMonth: number;
  dayOfWeekColor: string;     // Thai day-of-birth color system
  rulingPlanet: string;       // Thai system: Sunday=Sun, Monday=Moon, etc.
}
```

### Energy Score Calculation (Backend)

The Energy Score is NOT an LLM output. It's a deterministic weighted formula:

```python
def calculate_energy_score(natal: NatalChart, transits: TransitData, numerology: NumerologyProfile) -> int:
    score = 50  # Baseline

    # Positive transit aspects to natal planets
    for aspect in transits.aspects_to_natal:
        if aspect.type in ('trine', 'sextile'):
            score += aspect.weight  # 3-8 points depending on planets involved
        elif aspect.type in ('square', 'opposition'):
            score -= aspect.weight

    # Moon phase modifier
    if transits.moon_phase in ('new_moon', 'full_moon'):
        score += 5 if natal.moon.sign == transits.moon_sign else -3

    # Numerology day number alignment
    if transits.universal_day_number == numerology.life_path:
        score += 8

    # Thai day-of-week alignment
    if transits.day_of_week_planet == natal.ruling_planet:
        score += 5

    # Retrograde penalties
    for planet in transits.retrograde_planets:
        if planet in natal.dominant_planets:
            score -= 4

    return max(0, min(100, score))
```

Sub-scores (Business, Heart, Body) use the same formula but with different planet weightings:
- **Business:** Sun, Jupiter, Saturn, Mercury, 10th house emphasis
- **Heart:** Venus, Moon, Mars, 5th/7th house emphasis
- **Body:** Mars, 6th house, Moon (for sleep/cycles)

---

## 15. AI / LLM Integration

### System Prompt Architecture

The LLM never calculates. It receives pre-computed astrological data as JSON and generates human interpretation.

**Prompt Structure:**
```
[SYSTEM PROMPT: personality + rules]
[INJECTED CONTEXT: natal chart JSON + current transits JSON + numerology JSON]
[INJECTED MEMORY: relevant past conversations from vector retrieval]
[USER MESSAGE]
```

### System Prompt — Mor Doo Mode

```
You are Mor Doo AI, a wise and compassionate Thai oracle. You hold mastery of
Thai, Chinese (Bazi/Four Pillars), and Western astrology, as well as Thai
numerology and Buddhist spiritual practices.

## Your Persona
- Speak like a respected elder who sees beyond the obvious
- Warm but authoritative — never uncertain or wishy-washy
- Reference Buddhist merit-making naturally when appropriate
- Use metaphor and imagery from Thai culture (lotus, river, temple)
- In Thai mode, use polite particles (ค่ะ/ครับ) and respectful language

## Provided Data (TRUST THESE — never calculate yourself)
- Natal chart: {natal_chart_json}
- Current transits: {transit_json}
- Bazi chart: {bazi_json}
- Numerology: {numerology_json}
- User history: {vector_retrieved_context}
- Current date/time: {bangkok_datetime}

## Rules
1. NEVER calculate planetary positions — only interpret the provided data
2. Be SPECIFIC — name planets, houses, signs, and aspects explicitly
3. Reference past conversations naturally when relevant ("Three months ago
   you asked about...")
4. For negative forecasts, ALWAYS offer a constructive ritual or action
5. NEVER diagnose illness, prescribe medication, recommend specific investment
   amounts, or provide legal advice
6. Close all readings with a specific action the user can take today
7. Response language: match {user_language}
8. If asked about topics outside astrology/spirituality, gently redirect
```

### System Prompt — Strategist Mode

```
You are the Mor Doo AI Strategist — an analytical oracle that strips away
mysticism and delivers astrological intelligence as decision-support data.

## Your Persona
- Cold, precise, probability-oriented
- Speak in numbered lists and structured analysis
- Frame astrological data as "indicators" not "predictions"
- Reference historical pattern accuracy when possible
- No ritual suggestions — focus on timing and action

## Provided Data
{same injection as Mor Doo mode}

## Rules
1-6: {same as Mor Doo mode}
7. Always frame advice as "based on astrological indicators" not certainty
8. Include confidence levels where possible (high/medium/low)
9. For business questions, structure as: Situation → Indicators → Timing → Action
```

### API Integration (Backend)

```python
# Backend: src/services/llm.py
import anthropic

client = anthropic.Anthropic()

async def generate_oracle_response(
    user_message: str,
    mode: str,
    natal_chart: dict,
    transits: dict,
    bazi: dict,
    numerology: dict,
    memory_context: list[str],
    language: str,
) -> AsyncGenerator[str, None]:
    """Stream oracle response token by token."""

    system_prompt = build_system_prompt(
        mode=mode,
        natal_chart=natal_chart,
        transits=transits,
        bazi=bazi,
        numerology=numerology,
        memory_context=memory_context,
        language=language,
    )

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    ) as stream:
        async for text in stream.text_stream:
            yield text
```

### Guardrail Layer

Before streaming to the client, each response chunk passes through a guardrail filter:

```python
BLOCKED_PATTERNS = [
    r'you (should|must) (buy|sell|invest)',
    r'(diagnos|prescrib)',
    r'\$\d+',                    # Specific dollar amounts
    r'฿\d{4,}',                  # Specific large baht amounts
    r'(guaranteed|certain|definitely will)',
]

def filter_response(text: str) -> str:
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return text + "\n\n⚠️ *Please consult a qualified professional for specific financial, medical, or legal decisions.*"
    return text
```

---

## 16. Memory & RAG System

### Why Memory Matters

Memory is the moat. Users who feel "known" don't churn. After 10+ sessions, the AI references past conversations naturally, creating deep stickiness.

### Architecture

```
User sends message
    ↓
Embed user message (text-embedding-3-small)
    ↓
Query pgvector for top-K relevant past interactions
    ↓
Inject retrieved context into LLM system prompt
    ↓
Generate response
    ↓
Store {user_message, ai_response, embedding, metadata} in pgvector
```

### Database Schema

```sql
-- User conversation memory
CREATE TABLE user_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    role VARCHAR(10) NOT NULL,          -- 'user' or 'assistant'
    content TEXT NOT NULL,
    embedding vector(1536),             -- text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',        -- { topic, entities, predictions }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX ON user_memories
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Prediction tracking
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    memory_id UUID REFERENCES user_memories(id),
    prediction_text TEXT NOT NULL,
    predicted_date DATE,
    outcome VARCHAR(20),                -- 'accurate', 'inaccurate', 'pending'
    marked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Retrieval at Query Time

```python
async def retrieve_context(user_id: str, query: str, limit: int = 5) -> list[str]:
    """Retrieve relevant past conversations for RAG injection."""
    query_embedding = await embed(query)

    results = await db.execute("""
        SELECT content, metadata, created_at
        FROM user_memories
        WHERE user_id = $1
          AND role = 'assistant'
        ORDER BY embedding <=> $2
        LIMIT $3
    """, user_id, query_embedding, limit)

    return [
        f"[{r.created_at.strftime('%Y-%m-%d')}] {r.content[:500]}"
        for r in results
    ]
```

---

## 17. Image Generation Pipeline

### Digital Amulets / Yantra

**Stack:** FLUX or Stable Diffusion XL, fine-tuned on Thai sacred geometry, hosted on Replicate or Modal.

**Prompt Engineering:**
```python
def build_amulet_prompt(intention: str, natal_chart: dict, transits: dict) -> str:
    dominant_element = natal_chart['dominantElement']
    element_colors = {
        'fire': 'red and gold',
        'earth': 'brown and amber',
        'air': 'silver and white',
        'water': 'blue and teal',
    }

    return f"""
    Sacred Thai Yantra mandala, intricate geometric sacred geometry,
    {element_colors[dominant_element]} color palette on deep black background,
    intention: {intention}, Buddhist spiritual art, gold leaf accents,
    symmetrical, mystical, high detail, 4K, ornate border,
    Thai temple art style, no text, no faces, no human figures
    """
```

**Pipeline:**
1. Client: `POST /sanctuary/amulet/generate` → returns `jobId`
2. Backend: Celery task calls Replicate API
3. Replicate generates image (~10-20 seconds)
4. Backend uploads to S3/R2, stores URL in DB
5. Client polls `GET /sanctuary/amulet/{jobId}` (or receives push notification)

**Animated amulets:** Generated as a base image, then animated client-side with Skia (rotation, glow, particles). NOT a video from the server.

---

## 18. Authentication & User Data Model

### Auth Flow

```
Phone OTP (primary):
  1. POST /auth/register { phone: "+66812345678" }
  2. SMS sent via Twilio/Firebase
  3. POST /auth/verify-otp { phone, code }
  4. Returns { accessToken, refreshToken, user }

Social Login:
  - Apple Sign-In (iOS) / Google Sign-In
  - Firebase Auth handles OAuth
  - Backend receives Firebase ID token, creates/matches user

Guest:
  - UUID generated client-side, stored in MMKV
  - All API calls include X-Guest-ID header
  - POST /auth/claim-guest merges guest data into new account
```

### Core Data Model

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    language VARCHAR(2) DEFAULT 'th',
    auth_provider VARCHAR(20),         -- 'phone', 'apple', 'google', 'guest'
    guest_id UUID,                     -- For guest → account migration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE birth_data (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    time_of_birth TIME,
    time_approximate BOOLEAN DEFAULT FALSE,
    place_name VARCHAR(200),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    country VARCHAR(100),
    gender VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE natal_charts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    western_chart JSONB NOT NULL,      -- Full NatalChart JSON
    bazi_chart JSONB NOT NULL,         -- Full BaziChart JSON
    numerology JSONB NOT NULL,         -- Full NumerologyProfile JSON
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tier VARCHAR(20) NOT NULL,         -- 'free', 'oracle_pro', 'business_elite'
    provider VARCHAR(20),              -- 'revenuecat', 'promptpay'
    provider_id VARCHAR(200),
    status VARCHAR(20),                -- 'active', 'expired', 'cancelled'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    date_of_birth DATE NOT NULL,
    time_of_birth TIME,
    place_name VARCHAR(200),
    natal_chart JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 19. Payments & Subscriptions

### RevenueCat (In-App Purchases)

RevenueCat manages App Store and Play Store subscriptions. The app never talks to Apple/Google billing directly.

```tsx
// src/services/payments.ts
import Purchases, { PurchasesPackage } from 'react-native-purchases';

export async function initPayments() {
  Purchases.configure({
    apiKey: Platform.OS === 'ios'
      ? process.env.REVENUECAT_IOS_KEY!
      : process.env.REVENUECAT_ANDROID_KEY!,
  });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchasePackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function checkEntitlement(entitlementId: string): Promise<boolean> {
  const info = await Purchases.getCustomerInfo();
  return info.entitlements.active[entitlementId] !== undefined;
}
```

### Entitlement IDs

**V1 entitlements:**
```
"standard"         → Standard tier features (฿149/mo)
```

**V2 entitlements (deferred):**
```
"premium"          → Premium tier features (฿299/mo, includes standard)
"custom_amulet"    → Single amulet pack purchase
"deep_dive_report" → Single PDF report purchase
"year_ahead"       → Annual report purchase
"gift_reading"     → Gift reading purchase
```

### RevenueCat Product IDs

**V1:**
```
Subscriptions:
  com.mordoo.standard.monthly       → ฿149/month
```

**V2 (deferred — no micro-transactions in v1):**
```
Subscriptions:
  com.mordoo.premium.monthly        → ฿299/month

Non-consumable (micro-transactions):
  com.mordoo.amulet_pack            → ฿79
  com.mordoo.deep_dive_report       → ฿149
  com.mordoo.year_ahead             → ฿299
  com.mordoo.gift_reading           → ฿199
```

### PromptPay Integration (Thai Market)

> **V2 — Not in MVP.** PromptPay is deferred since v1 has no micro-transactions. V1 uses only App Store / Play Store subscriptions via RevenueCat.

For users who prefer PromptPay (dominant in Thailand) — used for micro-transactions outside of App Store (web purchases, direct payments).

```
1. Client: POST /payments/promptpay/create { amount: 149, product: "deep_dive_report" }
2. Backend: Generate PromptPay QR code with unique reference
3. Client: Display QR code (react-native-qrcode-skia)
4. User: Scans QR in their banking app, pays
5. Backend: Receives bank webhook confirming payment
6. Backend: POST /payments/promptpay/verify confirms and grants entitlement
```

**Note:** In-app purchases through App Store are required for subscriptions on iOS (Apple's rules). PromptPay is for Android direct payments and web-based micro-transactions.

### PaywallGate Component

```tsx
// src/components/shared/PaywallGate.tsx
export function PaywallGate({
  entitlement,
  children,
  fallback,
}: {
  entitlement: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isEntitled, isLoading } = useSubscription(entitlement);

  if (isLoading) return <Skeleton />;
  if (isEntitled) return <>{children}</>;

  return fallback ?? (
    <View className="items-center p-6">
      <BlurView intensity={20} className="absolute inset-0" />
      <Text variant="display" className="text-gold mb-2">
        Unlock This Feature
      </Text>
      <Text className="text-parchment-dim text-center mb-4">
        Upgrade to Standard for unlimited access
      </Text>
      <Button
        title="See Plans — ฿149/mo"
        onPress={() => router.push('/paywall')}
      />
    </View>
  );
}
```

---

## 20. Push Notifications

### Categories

| Notification | Trigger | Tier | Priority |
|---|---|---|---|
| Daily Energy Score | Cron: 6:00 AM Bangkok | All | Normal |
| Low Energy Alert | Score drops below 30 | All | High |
| High Energy Alert | Score hits above 85 | All | Normal |
| Mercury Retrograde Warning | Transit enters | All | Normal |
| Full/New Moon Ritual | Moon phase change | All | Normal |
| Crypto Volatility Alert | Astrological trigger | Premium (V2) | High |
| Weekly Amulet Ready | Every Monday | Premium (V2) | Normal |
| Prophecy Fulfilled Reminder | 30 days after prediction | All | Low |
| Re-engagement | 3 days inactive | All | Low |

### Implementation

```tsx
// src/services/notifications.ts
import messaging from '@react-native-firebase/messaging';
import { storage } from '@/src/utils/storage';

export async function requestNotificationPermission(): Promise<boolean> {
  const status = await messaging().requestPermission();
  const enabled = status === messaging.AuthorizationStatus.AUTHORIZED
    || status === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    await api.user.registerPushToken(token);
    storage.set('fcm-token', token);
  }

  return enabled;
}

export function setupNotificationHandlers() {
  // Foreground
  messaging().onMessage(async (remoteMessage) => {
    // Show in-app toast notification (not system notification)
    showInAppNotification(remoteMessage);
  });

  // Background/quit — handle deep links
  messaging().onNotificationOpenedApp((remoteMessage) => {
    handleDeepLink(remoteMessage.data?.deepLink);
  });

  // App opened from quit state via notification
  messaging().getInitialNotification().then((remoteMessage) => {
    if (remoteMessage) handleDeepLink(remoteMessage.data?.deepLink);
  });
}
```

---

## 21. Health Data Integration

**Phase 3+ feature.** Correlates biometric data with astrological transits.

### Data Points Collected

| Data | Source | Use Case |
|---|---|---|
| Heart Rate Variability (HRV) | Apple Health / Health Connect | Correlate stress levels with Mars transits |
| Sleep duration & quality | Apple Health / Health Connect | Correlate with Moon phase |
| Step count | Apple Health / Health Connect | Activity vs. Body sub-score |
| Resting heart rate | Apple Health / Health Connect | Baseline stress indicator |

### Implementation

```tsx
// src/services/health.ts
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
    ],
    write: [],
  },
};

export async function requestHealthPermissions(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (err) => {
      resolve(!err);
    });
  });
}

export async function getTodayHRV(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getHeartRateVariabilitySamples(
      { startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      (err, results) => {
        if (err || !results.length) return resolve(null);
        resolve(results[results.length - 1].value);
      },
    );
  });
}
```

**Privacy:** Health data is processed on-device where possible. Only aggregated scores (not raw biometrics) are sent to the backend. Full PDPA disclosure in permission flow.

---

## 22. Animations & Visual Effects

### Starfield Background (`StarfieldBg.tsx`)

Used on: Onboarding, Pulse, Oracle, and loading screens.

```tsx
import { Canvas, Circle, Group, useClockValue, useComputedValue } from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const STAR_COUNT = 80;

// Pre-generate star positions
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
  radius: Math.random() * 1.5 + 0.5,
  speed: Math.random() * 0.002 + 0.001,
  phase: Math.random() * Math.PI * 2,
}));

export function StarfieldBg() {
  const clock = useClockValue();

  return (
    <Canvas style={{ position: 'absolute', width, height }}>
      {stars.map((star, i) => {
        const opacity = useComputedValue(
          () => 0.3 + 0.7 * Math.abs(Math.sin(clock.current * star.speed + star.phase)),
          [clock],
        );
        return (
          <Circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.radius}
            color="white"
            opacity={opacity}
          />
        );
      })}
    </Canvas>
  );
}
```

### Energy Ring Animation (`EnergyRing.tsx`)

```tsx
import { Canvas, Path, Skia, useSharedValueEffect, useValue } from '@shopify/react-native-skia';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export function EnergyRing({ score, size = 200 }: { score: number; size?: number }) {
  const progress = useSharedValue(0);
  const skiaProgress = useValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1500 });
  }, [score]);

  useSharedValueEffect(() => {
    skiaProgress.current = progress.value;
  }, progress);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const path = Skia.Path.Make();
  path.addArc(
    { x: strokeWidth / 2, y: strokeWidth / 2, width: size - strokeWidth, height: size - strokeWidth },
    -90,
    360,
  );

  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#c9a84c' : '#ef4444';

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Background ring */}
      <Path path={path} style="stroke" strokeWidth={strokeWidth} color="rgba(255,255,255,0.1)" />
      {/* Animated foreground ring */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={strokeWidth}
        color={color}
        strokeCap="round"
        start={0}
        end={skiaProgress}
      />
    </Canvas>
  );
}
```

### Loading Ritual Animation

Use Lottie for the ritual loading screens (Soul Snapshot, amulet generation):

```tsx
import LottieView from 'lottie-react-native';

export function RitualLoading({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-night">
      <LottieView
        source={require('@/assets/animations/lottie/ritual-loading.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <Text variant="body" weight="medium" className="text-gold mt-4 text-lg">
        {message}
      </Text>
    </View>
  );
}
```

---

## 23. Sharing & Viral Mechanics

### Share Card Pipeline

Every shareable artifact (Soul Snapshot, daily score, lucky numbers, amulets) follows this pipeline:

```tsx
// src/utils/shareImage.ts
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { analytics } from '@/src/services/analytics';

export async function shareAsImage(
  viewRef: React.RefObject<View>,
  options: {
    title: string;
    message?: string;
    feature: string;  // For analytics
  },
) {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    await Share.open({
      url: uri,
      title: options.title,
      message: options.message ?? 'Discover your cosmic blueprint — mordoo.ai',
      type: 'image/png',
    });

    analytics.track('share_completed', { feature: options.feature });
  } catch (err) {
    if ((err as any)?.message !== 'User did not share') {
      console.error('Share failed:', err);
    }
  }
}
```

### Share Card Design Requirements

Every share card must include:
- The Mor Doo AI logo (small, bottom corner)
- A watermark URL: "mordoo.ai"
- Visually rich — dark background, gold accents, the specific reading/score
- Designed for Instagram Stories aspect ratio (9:16) OR square (1:1) selectable
- No personal birth data visible (privacy)

### TikTok Share Cards (Phase 3)

Generate short-form video-ready cards:
- Animated text reveal of the reading
- Background: starfield or sacred geometry
- Auto-add trending audio hook reference
- Export as video (react-native-video + Skia rendering)

---

## 24. Guardrails & Safety

### Output Guardrails

Hard-blocked content patterns (applied to ALL LLM outputs before delivery):

```python
HARD_BLOCKS = {
    'medical_diagnosis': r'(you have|diagnosed with|symptoms of)\s+(cancer|diabetes|depression|anxiety disorder)',
    'specific_investment': r'(invest|put|allocate)\s+\$?\d+',
    'legal_advice': r'(you should|must)\s+(sue|file|divorce)',
    'guarantees': r'(guaranteed|100%|certainly will|definitely)',
    'self_harm': r'(kill yourself|end your life|suicide)',
}

# If any pattern matches, append disclaimer and flag for review
```

### User Safety

```python
CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it all', 'self harm', 'want to die']

def check_crisis(message: str) -> bool:
    return any(kw in message.lower() for kw in CRISIS_KEYWORDS)

# If crisis detected:
# 1. Don't generate a reading
# 2. Return compassionate message + Thai mental health resources:
#    - Samaritans of Thailand: 02-713-6793
#    - Department of Mental Health hotline: 1323
#    - Crisis Text Line equivalent
```

### Usage Caps (Anti-Addiction)

- After 2 hours of continuous use in one session: gentle nudge — "The stars suggest a rest. Take a walk and return with fresh eyes."
- After 10 Oracle questions in a single day (even premium): softer nudge — "Sometimes the best answer comes from within. Consider meditating on what you've learned today."
- Never hard-block — these are suggestions, not gates

### App Store Compliance

- Every screen with predictions includes: "For entertainment purposes. Not a substitute for professional advice."
- Category: "Lifestyle" (not "Health & Fitness" which triggers stricter review)
- No medical claims, no financial guarantees
- Age rating: 12+ (mystical themes)
- Privacy nutrition label: accurately declare all data collection

---

## 25. Testing Strategy

### Unit Tests

```bash
# Run all tests
npx jest

# Run specific test file
npx jest src/utils/numerology.test.ts

# Watch mode
npx jest --watch
```

**What to unit test:**
- All client-side calculations (numerology, quick score, Thai day color mapping)
- Zustand stores (state transitions, persistence)
- Utility functions (formatting, zodiac helpers)
- Zod validation schemas

### Component Tests

```bash
npx jest --testPathPattern=components
```

Using `@testing-library/react-native`:
- Onboarding flow: each step renders correctly, navigation works
- PaywallGate: shows/hides content based on entitlement
- Text component: selects correct font for Thai vs English
- Chat interface: messages render, streaming text displays

### Integration Tests

- API client: mock server responses, verify request/response handling
- Auth flow: guest → account migration
- Payment flow: mock RevenueCat responses

### E2E Tests (Detox or Maestro)

```bash
# Maestro (recommended for simplicity)
maestro test .maestro/onboarding-flow.yaml
maestro test .maestro/oracle-chat.yaml
```

**Critical E2E flows:**
1. Onboarding: complete all 6 steps → land on Pulse
2. Oracle chat: send message → receive streamed response
3. Tarot draw: select spread → draw cards → see interpretation
4. Payment: tap upgrade → complete purchase → feature unlocked
5. Language toggle: switch Thai ↔ English → all text updates

---

## 26. Build & Release Pipeline

### EAS Build Configuration

```json
// eas.json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "buildConfiguration": "Release" },
      "android": { "buildType": "apk" },
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "ios": { "buildConfiguration": "Release" },
      "android": { "buildType": "app-bundle" },
      "env": { "APP_ENV": "production" },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "xxx", "ascAppId": "xxx" },
      "android": { "serviceAccountKeyPath": "./google-sa-key.json" }
    }
  }
}
```

### Build Commands

```bash
# Development build (with dev client)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build (internal testing via TestFlight / Firebase App Distribution)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA update (JS-only changes — no native module changes)
eas update --branch production --message "Update oracle system prompt"
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/build.yml
name: Build & Test
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx jest --ci --coverage
      - run: npx tsc --noEmit  # Type check

  build-preview:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
      - run: npm ci
      - run: eas build --profile preview --platform all --non-interactive

  build-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
      - run: npm ci
      - run: eas build --profile production --platform all --non-interactive
      - run: eas submit --platform all --non-interactive
```

---

## 27. Phased Build Roadmap

### Phase 1 — V1 Foundation (Weeks 1–6)

**Goal:** Ship the v1 core loop — onboarding, Pulse (daily score), and Oracle (AI chat + Siam Si + tarot). Two bottom tabs only.

| Week | Deliverables |
|---|---|
| **1** | Project setup, directory structure, navigation skeleton (2 tabs: Pulse + Oracle), design system (colors, fonts, Text component), i18n scaffolding |
| **2** | Onboarding steps 1–3: Soul Gate, Birth Data picker, Name & Number Scan. Backend: auth (phone OTP + guest), birth data API, pyswisseph natal chart endpoint |
| **3** | Onboarding steps 4–6: Life Context, Power-Ups (UI only, permissions defer), Soul Snapshot with ritual loading. Backend: Soul Snapshot generation endpoint (Claude integration) |
| **4** | Pulse dashboard: Energy Score ring, lucky color/number/direction, cosmic news feed (mocked data → real API). Backend: daily score calculation cron, transit API |
| **5** | Oracle chat: streaming chat interface, Mor Doo mode system prompt, daily limit for free tier. Backend: WebSocket chat endpoint, conversation storage |
| **6** | Tarot: single card + 3-card spread with flip animations, AI interpretation. Siam Si digital ceremony (shake detection, stick animation). QA, bug fixes, internal TestFlight/APK distribution |

**Phase 1 exit criteria:**
- User can complete onboarding and see their Soul Snapshot
- Daily Energy Score loads on Pulse with lucky color/number/direction
- Oracle responds in streaming chat with natal-chart-aware answers
- Tarot draw and Siam Si work with AI interpretation
- Thai and English fully functional
- Internal testers using the app daily

### Phase 2 — V1 Polish & Launch (Weeks 7–10)

**Goal:** Payment integration (Freemium + Standard ฿149/mo), polish, and store submission.

| Week | Deliverables |
|---|---|
| **7** | Power Windows hourly chart (Victory Native). Soul Snapshot sharing pipeline. |
| **8** | Payment integration: RevenueCat for Standard subscription (฿149/mo), PaywallGate component. No micro-transactions. |
| **9** | Push notifications: daily Energy Score, moon phases, re-engagement. Performance optimization. |
| **10** | QA, Play Store + App Store submission, ASO (screenshots, keywords, descriptions in Thai + English) |

**Phase 2 exit criteria:**
- Standard subscription works end-to-end on both platforms
- App submitted to both stores
- Pulse + Oracle fully polished

### Phase 3 — V2 Realms (Months 4–6)

> See `docs/v2-roadmap.md` for the full v2 feature list.

| Deliverable | Description |
|---|---|
| The Compass (Section C) | Auspicious Date Finder, Partner Compatibility, Lucky Numbers |
| The Sanctuary (Section D) | GPS Temple Finder, Digital Amulets, Merit Calendar, Moon Rituals |
| The Archive (Section E) | Life Map, Family Circle, Prophecy Log |
| Premium tier (฿299/mo) | Unlocks Compass, Sanctuary, Archive features |
| Micro-transactions | Amulet packs, PDF reports, gift readings |
| PromptPay integration | QR-based payments for Android/web micro-transactions |
| Persistent AI Memory | pgvector RAG pipeline. Oracle naturally references past sessions. |
| Bazi Engine | Chinese Four Pillars integrated into readings |

### Phase 4 — V2 Expansion (Month 7+)

| Deliverable | Description |
|---|---|
| SEA Localization | Vietnamese, Burmese, Khmer translations + cultural adaptations |
| Year Ahead Report | 12-page PDF generation (Celery + WeasyPrint or similar) |
| Health Integration | Apple Health / Health Connect → transit correlation |
| Crypto Alerts | Astrological triggers for crypto volatility (Premium) |
| Gamification | Achievement badges, streaks, daily check-in rewards |
| Community Features | Share readings, compare charts with friends |
| Strategist Mode | Cold analytical AI persona (Premium) |
| Influencer API | White-label readings for Thai astrology TikTok creators |

---

## Appendix A — Key Third-Party Accounts Needed

| Service | Purpose | Est. Cost |
|---|---|---|
| Apple Developer Program | App Store distribution | $99/year |
| Google Play Developer | Play Store distribution | $25 one-time |
| Expo / EAS | Build service, OTA updates | Free tier → $99/mo at scale |
| RevenueCat | Subscription management | Free up to $2.5K MTR, then 1% |
| Anthropic (Claude API) | LLM for oracle | ~$0.003–0.015 per reading |
| Replicate / Modal | Image generation for amulets | ~$0.01–0.05 per image |
| Firebase | Auth, push notifications, analytics | Free tier sufficient initially |
| Google Maps Platform | Temple Finder maps | $200 free credit/mo |
| Sentry | Error tracking | Free tier (5K events/mo) |
| PostHog | Product analytics | Free tier (1M events/mo) |
| Twilio (or Firebase) | SMS OTP | ~$0.04 per SMS to Thailand |
| AWS S3 / Cloudflare R2 | Image & PDF storage | R2: free egress, ~$0.015/GB storage |
| Stripe | International card payments | 3.25% + ฿10.25 per transaction (Thailand) |
| Domain + SSL | mordoo.ai | ~$15/year |

## Appendix B — PDPA Compliance Checklist

Thailand's Personal Data Protection Act (PDPA) requirements:

- [ ] Privacy policy in Thai and English, accessible before data collection
- [ ] Explicit consent for: birth data, health data, location, phone number
- [ ] Data Processing Agreement with all sub-processors (Anthropic, Firebase, etc.)
- [ ] Right to access: user can export all their data (Settings → Export Data)
- [ ] Right to delete: user can delete account and all data (Settings → Delete Account)
- [ ] Data breach notification process (72 hours)
- [ ] Data Protection Officer (DPO) designated if processing large-scale personal data
- [ ] Birth data encrypted at rest (AES-256)
- [ ] Health data stored on-device where possible, only aggregated scores to server
- [ ] No selling of personal data — ever
- [ ] Cookie/tracking consent for any web properties

## Appendix C — App Store Review Considerations

**Category:** Lifestyle (NOT Health & Fitness)

**Required Disclaimers (visible in app):**
- "For entertainment and informational purposes only"
- "Not a substitute for professional medical, financial, or legal advice"
- "Astrological readings are interpretive and should not be the sole basis for important decisions"

**Content Rating:** 12+ (Infrequent/Mild Mature/Suggestive Themes — mystical content)

**Rejection Risk Factors & Mitigations:**
- "Fortune telling" category → Frame as "astrology & wellness lifestyle app" (Co-Star precedent)
- Health claims → No claims. "Wellness insights" language only.
- In-app purchases → Clearly describe what each purchase unlocks
- Auto-renewable subscriptions → Must include: subscription terms, price, cancellation instructions in the purchase flow

---

*End of Implementation Guide — Mor Doo AI v1.0 (v1 scope: Pulse + Oracle; see docs/v2-roadmap.md for deferred features)*
