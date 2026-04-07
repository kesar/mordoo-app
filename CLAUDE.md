# Mordoo (หมอดู) — AI Astrology App

## Quick Reference

- **Mobile:** React Native 0.83 + Expo 55 + Expo Router (file-based routing)
- **API:** Next.js 15 on Vercel (`api/` directory)
- **Database:** Supabase PostgreSQL with RLS
- **AI:** Anthropic Claude (Sonnet 4.6) for Oracle chat
- **State:** Zustand + MMKV persistence, React Query for server state
- **Auth:** Supabase (Phone OTP + Email; Apple/Google behind feature flag)
- **Payments:** RevenueCat (subscriptions + webhook)
- **Analytics:** PostHog (React Native SDK)
- **Error Tracking:** Sentry (`@sentry/react-native`)
- **i18n:** i18next — Thai (`th`) and English (`en`), JSON files in `src/i18n/`
- **Styling:** Custom dark theme design system (gold + night palette)

## Project Structure

```
app/                    # Expo Router screens
  (onboarding)/         # Auth + onboarding flow (modal group)
  (main)/               # Main app tabs (pulse, oracle, profile)
src/
  components/
    ui/                 # Design system components
    sharing/            # Share card components (Pulse, Siam Si)
    icons/              # Custom icon components
  config/features.ts    # Feature flags
  constants/            # Colors, typography, tiers
  hooks/                # Custom React hooks
  i18n/{en,th}/         # Translation JSON files (namespaced)
  lib/supabase.ts       # Supabase client init
  services/             # API service functions (oracle, pulse, auth, birth-data, etc.)
  stores/               # Zustand stores (auth, onboarding, oracle, settings, subscription)
  types/                # TypeScript type definitions
  utils/                # Storage, haptics, scaling, Siri shortcuts, timezone, zustand-mmkv
  widgets/              # iOS home screen widgets (Daily Pulse, Siam Si)
shared/                 # Shared logic used by both RN app and API
  compute-reading.ts    # Numerology engine
  siam-si.ts            # 28 fortune sticks
  insight-templates.ts  # Bilingual insight text
  zodiac.ts             # Zodiac sign logic
  hash.ts               # Hashing utilities
  types.ts              # Shared TypeScript types
api/                    # Next.js API backend (deployed to Vercel)
  src/app/api/
    account/delete/             # DELETE — Account deletion
    account/sync-subscription/  # POST — Sync subscription status
    notifications/register/     # POST — Push notification token registration
    oracle/chat/        # POST — SSE streaming Oracle chat
    oracle/history/     # GET — Chat history
    oracle/siam-si/     # POST — Fortune stick draw
    oracle/today/       # GET — Today's oracle summary
    pulse/daily/        # POST — Daily reading
    webhooks/revenuecat/ # POST — Subscription lifecycle webhook
    zodiac/signs/       # GET — Zodiac sign data
sql/                    # Database migration scripts
supabase/               # Supabase config and edge functions
docs/                   # Architecture & technical docs
  marketing/            # ASO, monetization, launch, press strategy docs
  superpowers/          # Feature plans & design specs
fastlane/               # iOS App Store deployment automation
screenshots/            # App Store screenshot assets
scripts/                # Build scripts (env validation)
```

## Path Aliases

- `@/*` → project root (e.g., `@/src/hooks/useAuthListener`)
- `@shared/*` → `./shared/` (e.g., `@shared/types`)

## Commands

```bash
# Mobile app
npm start              # Start Expo dev server
npx expo run:ios       # Run on iOS simulator
npx expo run:android   # Run on Android emulator

# API backend
cd api && npm run dev   # Start API dev server (localhost:3001)
cd api && npm run build # Build for production

# Tests
npm test               # Run all shared tests (vitest)
npm run test:watch     # Run tests in watch mode

# OTA Updates
eas update --channel production --message "description"   # Push OTA update manually
eas workflow:run .eas/workflows/send-updates.yml           # Trigger OTA workflow manually
```

## Key Conventions

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Zustand for client state, React Query for server state
- All API calls go through `src/services/` — never call endpoints directly from components
- Quotas are tracked server-side (not client-side)
- Feature flags in `src/config/features.ts`

### Translations
- Always add strings to both `src/i18n/en/` and `src/i18n/th/`
- Use namespaced JSON files (e.g., `onboarding.json`, `oracle.json`, `pulse.json`)
- API endpoints accept `lang` param for bilingual responses

### Database
- All tables have RLS policies — users can only access their own data
- Tables: `profiles`, `birth_data`, `daily_readings`, `user_quotas`
- Auth trigger auto-creates profile on signup
- Migration scripts in `sql/`

### Design System
- Dark theme: background `#0a0a14`, gold accent `#c9a84c`, parchment text `#f4e8c1`
- Fonts: CinzelDecorative (headers), CormorantGaramond (body), NotoSansThai (Thai)
- UI components in `src/components/ui/`

### API Architecture
- All endpoints require Supabase bearer token auth
- Oracle chat uses SSE streaming (text/event-stream)
- API validates auth, checks quotas, and increments usage server-side
- RevenueCat webhook handles subscription lifecycle events
- Deployed to Vercel at `api.mordoo.app`

## Environment Variables

**When adding a new env var, you MUST do all three steps:**
1. Add it to `.env.local` (and/or `api/.env.local`)
2. Add it to EAS secrets: `eas secret:create --name <NAME> --value <VALUE>`
3. Add it to `scripts/validate-env.js` required array (for mobile vars)
4. Add it to `.env.example` (and/or `api/.env.example`)

### Mobile (`.env.local`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_BASE_URL=       # https://api.mordoo.app or http://localhost:3001
EXPO_PUBLIC_POSTHOG_KEY=        # PostHog project API key
EXPO_PUBLIC_POSTHOG_HOST=       # https://us.i.posthog.com (default)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=     # RevenueCat > Project > API Keys > iOS
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY= # RevenueCat > Project > API Keys > Android
EXPO_PUBLIC_SENTRY_DSN=             # Sentry > Project > DSN
SENTRY_AUTH_TOKEN=                  # Build-time only — for source map uploads
```

### API (`api/.env.local`)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
REVENUECAT_WEBHOOK_KEY=        # Secret for RevenueCat webhook auth (Bearer token)
```

## Testing

- **Runner:** Vitest (config in `vitest.config.ts`)
- **Test location:** `shared/__tests__/*.test.ts`
- **Scope:** All shared pure logic — compute-reading, siam-si, zodiac, hash, insight-templates
- Tests run in CI on every PR and push to `main`

## CI/CD

### GitHub Actions (`.github/workflows/ci.yml`)
Runs on every PR and push to `main` — 4 parallel jobs:
- **Typecheck (Mobile)** — `tsc --noEmit` on the RN app
- **Typecheck (API)** — `tsc --noEmit` on the Next.js API
- **Tests** — `vitest run` (shared tests)
- **Build (API)** — `next build` verification

### OTA Updates (EAS Update)
- **Package:** `expo-updates` handles checking/downloading updates on app launch
- **Config:** `runtimeVersion` in `app.json` + `channel` per build profile in `eas.json`
- **Channels:** `development`, `preview`, `production` (set per build profile in `eas.json`)
- **Automated:** `.eas/workflows/send-updates.yml` pushes OTA to `production` channel on push to `main` (only when mobile-relevant files change — `app/`, `src/`, `shared/`, `assets/`)
- **IMPORTANT:** `runtimeVersion` in `app.json` must be a hardcoded string (e.g., `"1.0.0"`), NOT a policy object — bare workflow doesn't support policies. Bump this value whenever native code changes (new native modules, SDK upgrades, etc.) so OTA updates only target compatible builds.

### Vercel (API)
- Auto-deploys `api/` on push to `main`
- Deployed at `api.mordoo.app`

### Fastlane (iOS)
- App Store submission automation in `fastlane/`
- Metadata and screenshots managed via `fastlane/metadata/`
- **IMPORTANT — Sentry source maps:** the build script tries to upload source maps to Sentry and will fail with `Auth token is required` unless `SENTRY_AUTH_TOKEN` is set. Until that token is configured locally, run release builds with `SENTRY_DISABLE_AUTO_UPLOAD=true` to skip the upload step:
  ```bash
  SENTRY_DISABLE_AUTO_UPLOAD=true fastlane ios release
  ```
- Fastlane is installed globally (no Gemfile) — invoke as `fastlane`, not `bundle exec fastlane`.

### Fastlane (Android)
- Google Play Store automation via `supply` in `fastlane/Fastfile` (platform :android)
- Metadata in `fastlane/metadata/android/{en-US,th}/`
- Screenshots in `fastlane/metadata/android/{locale}/images/{phoneScreenshots,sevenInchScreenshots,tenInchScreenshots}/`
- Service account key: `~/.google-play/service-account.json` (or `GOOGLE_PLAY_JSON_KEY_PATH` env var)
- **IMPORTANT — Draft app:** While the app is in draft status on Google Play (before first production release), both Fastlane and EAS Submit require `release_status: "draft"` / `releaseStatus: "draft"`. Once the app has a live production release, change these to `"completed"`:
  - `eas.json` → `submit.production.android.releaseStatus` (currently `"draft"`)
  - `fastlane/Fastfile` → `release_status` param in Android lanes (currently `"draft"`)
- Lanes: `upload_metadata`, `upload_screenshots`, `upload_build`, `promote`, `deliver_all`

### EAS Submit (Android)
- Config in `eas.json` → `submit.production.android`
- Service account key: `./google-play-service-account.json` (gitignored)
- Track: `internal`, release status: `draft` (change to `completed` after first production release)
- Command: `eas submit --platform android --profile production`

## Architecture Decisions
- Guest auth was removed — sign-in is required (phone OTP or email)
- Client-side quota tracking was removed — server handles all quota logic
- Siam Si and Pulse use API endpoints (no local computation fallback)
- Apple/Google sign-in are behind feature flags, not enabled in v1
