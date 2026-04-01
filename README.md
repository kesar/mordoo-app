# Mor Doo (หมอดู)

A mystical Thai astrology mobile app that blends Thai, Chinese, and Western astrology with AI-powered readings.

## Features

- **The Pulse** — Daily cosmic guidance with energy scores, lucky colors, numbers, and directions based on your birth data
- **The Oracle** — AI-powered astrological chat using Claude, with context from your birth chart and life concerns
- **Siam Si** — Traditional Thai fortune stick drawing (28 sticks) with bilingual meanings
- **Zodiac Profiles** — Western and Chinese zodiac sign details
- **Push Notifications** — Daily reading reminders
- **Bilingual** — Full Thai and English support throughout

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native 0.83 + Expo 55 |
| Navigation | Expo Router (file-based) |
| State | Zustand + MMKV + React Query |
| Backend API | Next.js 15 on Vercel |
| Database | Supabase PostgreSQL (with RLS) |
| AI | Anthropic Claude (Sonnet 4.6) |
| Auth | Supabase (Phone OTP, Email) |
| Payments | RevenueCat |
| Analytics | PostHog |
| Error Tracking | Sentry |
| i18n | i18next (Thai, English) |
| CI/CD | GitHub Actions, EAS Build, EAS Update, Vercel |
| App Store | Fastlane (iOS submission) |

## Getting Started

### Prerequisites

- Node.js 22+
- iOS Simulator (Xcode) or Android Emulator
- Supabase project with tables configured (see `docs/supabase-setup.md`)
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install
cd api && npm install && cd ..

# Configure environment
cp .env.example .env.local          # Fill in mobile env vars
cp api/.env.example api/.env.local   # Fill in API env vars

# Start the mobile app
npm start

# Start the API (separate terminal)
cd api && npm run dev
```

### Running on Device

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# EAS Development Build (physical device)
eas build --profile development --platform ios
```

### Tests

```bash
npm test             # Run all shared tests (vitest)
npm run test:watch   # Watch mode
```

## Project Structure

```
app/                    Expo Router screens
  (onboarding)/         Auth + onboarding flow
  (main)/               Main tabs (pulse, oracle, profile)
src/
  components/
    ui/                 Design system components
    sharing/            Share card components (Pulse, Siam Si)
    icons/              Custom icon components
  config/               Feature flags
  constants/            Colors, typography, tiers
  hooks/                Custom React hooks
  i18n/{en,th}/         Translation JSON files (namespaced)
  lib/                  Supabase client init
  services/             API service functions
  stores/               Zustand stores (auth, onboarding, oracle, settings, subscription)
  types/                TypeScript type definitions
  utils/                Storage, haptics, scaling, Siri shortcuts, timezone, zustand-mmkv
  widgets/              iOS home screen widgets (Daily Pulse, Siam Si)
shared/                 Shared logic (numerology engine, fortune sticks, zodiac)
api/                    Next.js API backend (Vercel)
  src/app/api/
    account/delete/             DELETE — Account deletion
    account/sync-subscription/  POST — Sync subscription status
    notifications/register/     POST — Push notification token
    oracle/chat/        POST — SSE streaming Oracle chat
    oracle/history/     GET — Chat history
    oracle/siam-si/     POST — Fortune stick draw
    oracle/today/       GET — Today's oracle summary
    pulse/daily/        POST — Daily reading
    webhooks/revenuecat/  POST — Subscription webhook
    zodiac/signs/       GET — Zodiac sign data
sql/                    Database migration scripts
supabase/               Supabase config and edge functions
docs/                   Architecture & technical docs
  marketing/            ASO, monetization, launch, press strategy
  superpowers/          Feature plans & design specs
fastlane/               iOS App Store deployment automation
screenshots/            App Store screenshot assets
assets/                 App icons, splash, fonts, images
scripts/                Build scripts (env validation)
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) — Project conventions and architecture reference
- [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md) — Complete technical specification
- [Supabase Setup](docs/supabase-setup.md) — Database schema and migrations
- [Deployment](docs/deployment.md) — Deployment guide
- [Android Launch Guide](docs/android-launch-guide.md) — Google Play submission
- [V2 Roadmap](docs/v2-roadmap.md) — Future features (The Compass, Sanctuary, Archive)

## CI/CD

- **GitHub Actions** — Typecheck (mobile + API), tests, API build on every PR
- **EAS Build** — Native builds for iOS/Android
- **EAS Update** — OTA updates pushed to `production` channel on push to `main`
- **Vercel** — Auto-deploys API on push to `main` at `api.mordoo.app`
- **Fastlane** — iOS App Store submission automation

## License

Proprietary. All rights reserved.
