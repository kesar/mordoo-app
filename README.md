# Mor Doo (หมอดู)

A mystical Thai astrology mobile app that blends Thai, Chinese, and Western astrology with AI-powered readings.

## Features

- **The Pulse** — Daily cosmic guidance with energy scores, lucky colors, numbers, and directions based on your birth data
- **The Oracle** — AI-powered astrological chat using Claude, with context from your birth chart and life concerns
- **Siam Si** — Traditional Thai fortune stick drawing (28 sticks) with bilingual meanings
- **Bilingual** — Full Thai and English support throughout

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native 0.83 + Expo 55 |
| Navigation | Expo Router (file-based) |
| State | Zustand + MMKV + React Query |
| Backend API | Next.js 15 on Vercel |
| Database | Supabase PostgreSQL |
| AI | Anthropic Claude (Sonnet 4.6) |
| Auth | Supabase (Phone OTP, Email) |
| i18n | i18next (Thai, English) |

## Getting Started

### Prerequisites

- Node.js 20+
- iOS Simulator (Xcode) or Android Emulator
- Supabase project with tables configured (see `docs/supabase-setup.md`)
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install
cd api && npm install

# Configure environment
cp .env.example .env.local    # Fill in Supabase + API keys
cp api/.env.example api/.env.local

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
npx eas build --profile development --platform ios
```

## Project Structure

```
app/                    Expo Router screens (onboarding + main tabs)
src/                    Mobile app source (hooks, services, stores, components)
api/                    Next.js API backend
shared/                 Shared business logic (numerology engine, fortune sticks)
sql/                    Database migration scripts
docs/                   Architecture documentation
```

See [CLAUDE.md](./CLAUDE.md) for detailed project conventions and architecture.

## Documentation

- [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md) — Complete technical specification
- [Supabase Setup](docs/supabase-setup.md) — Database schema and migrations
- [Pending Steps](docs/pending-steps.md) — Deployment checklist
- [V2 Roadmap](docs/v2-roadmap.md) — Future features (The Compass, Sanctuary, Archive)

## License

Proprietary. All rights reserved.
