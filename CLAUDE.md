# Mordoo (หมอดู) — AI Astrology App

## Quick Reference

- **Mobile:** React Native 0.83 + Expo 55 + Expo Router (file-based routing)
- **API:** Next.js 15 on Vercel (`api/` directory)
- **Database:** Supabase PostgreSQL with RLS
- **AI:** Anthropic Claude (Sonnet 4.6) for Oracle chat
- **State:** Zustand + MMKV persistence, React Query for server state
- **Auth:** Supabase (Phone OTP + Email; Apple/Google behind feature flag)
- **i18n:** i18next — Thai (`th`) and English (`en`), JSON files in `src/i18n/`
- **Styling:** Custom dark theme design system (gold + night palette)

## Project Structure

```
app/                    # Expo Router screens
  (onboarding)/         # Auth + onboarding flow (modal group)
  (main)/               # Main app tabs (pulse, oracle)
src/
  api/endpoints/        # API client helpers
  components/ui/        # Design system components
  config/features.ts    # Feature flags
  constants/            # Colors, typography, tiers
  hooks/                # Custom React hooks
  i18n/{en,th}/         # Translation JSON files (namespaced)
  lib/supabase.ts       # Supabase client init
  services/             # API service functions (oracle, pulse, auth, birth-data)
  stores/               # Zustand stores (auth, onboarding, oracle, settings)
  utils/                # Storage, haptics, zustand-mmkv adapter
shared/                 # Shared logic used by both RN app and API
  compute-reading.ts    # Numerology engine
  siam-si.ts            # 28 fortune sticks
  insight-templates.ts  # Bilingual insight text
  types.ts              # Shared TypeScript types
api/                    # Next.js API backend (deployed to Vercel)
  src/app/api/
    oracle/chat/        # POST — SSE streaming Oracle chat
    oracle/siam-si/     # POST — Fortune stick draw
    pulse/daily/        # POST — Daily reading
sql/                    # Database migration scripts
docs/                   # Architecture docs, specs, plans
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
- Deployed to Vercel at `api.mordoo.app`

## Environment Variables

### Mobile (`.env.local`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_BASE_URL=       # https://api.mordoo.app or http://localhost:3001
```

### API (`api/.env.local`)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## Architecture Decisions
- Guest auth was removed — sign-in is required (phone OTP or email)
- Client-side quota tracking was removed — server handles all quota logic
- Siam Si and Pulse use API endpoints (no local computation fallback)
- Apple/Google sign-in are behind feature flags, not enabled in v1
