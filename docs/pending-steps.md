# Mordoo App — Pending Steps

## Current State (2026-03-20)

**Completed:**
- Full app built: onboarding, daily pulse, Oracle AI chat, Siam Si fortune sticks
- Supabase configured: 4 tables (profiles, birth_data, daily_readings, user_quotas), RLS policies, auth trigger
- Auth: Email + Phone enabled in Supabase. Apple/Google hidden behind feature flag (`src/config/features.ts`)
- API deployed to Vercel at `https://api.mordoo.app` with all env vars
- App builds and runs on iOS simulator
- EAS project created: `@kesarito/mordoo` (ID: `969fe2eb-8da0-4af0-be98-df44a79690a8`)

**Not committed:** All app code changes from this session are uncommitted. Commit before continuing.

---

## 1. Commit All Changes

```bash
git add -A
git commit -m "feat: complete mordoo app — auth, pulse, oracle, siam si, polish"
git push
```

## 2. Test on Physical Device

### Option A: USB via Xcode (no Apple Developer needed)
1. Plug iPhone into Mac via USB
2. Open Xcode, select your device as build target
3. Run: `npx expo prebuild --clean`
4. Open `ios/MorDoo.xcworkspace` in Xcode
5. Select your team under Signing & Capabilities
6. Build and run to device

### Option B: EAS Development Build (needs Apple Developer)
```bash
npx eas-cli build --platform ios --profile development
```
Follow prompts to log into Apple Developer account and register device.

## 3. TestFlight / App Store Build

Requires Apple Developer account ($99/year) at https://developer.apple.com/enroll

```bash
# Interactive — will prompt for Apple ID login
npx eas-cli build --platform ios --profile production

# After build completes
npx eas-cli submit --platform ios
```

**Apple auth tip:** If password prompt doesn't work, generate an App-Specific Password at https://account.apple.com → Sign-In and Security → App-Specific Passwords. Or set env vars:
```bash
EXPO_APPLE_ID="your@email.com" EXPO_APPLE_PASSWORD="app-specific-pwd" npx eas-cli build --platform ios --profile production
```

## 4. Before App Store Submission

- [ ] **Privacy Policy URL** — required, app collects birth data and uses auth
- [ ] **App Store screenshots** — iPhone 6.7" and 6.1" required
- [ ] **App description & keywords** — for App Store listing
- [ ] **App icon** — already have assets, verify they meet Apple guidelines (1024x1024, no transparency)

## 5. Enable Apple & Google Sign-In (when ready)

### Apple Sign-In
1. Supabase Dashboard → Authentication → Providers → Enable Apple
2. Apple Developer Console → Create Services ID with "Sign In with Apple"
3. Set redirect URL to Supabase callback URL
4. Flip flag: `src/config/features.ts` → `appleSignIn: true`

### Google Sign-In
1. Supabase Dashboard → Authentication → Providers → Enable Google
2. Google Cloud Console → Create OAuth 2.0 credentials
3. Add authorized redirect URI from Supabase
4. Flip flag: `src/config/features.ts` → `googleSignIn: true`

## 6. Production Hardening

- [ ] Set up SMS provider (Twilio/MessageBird) for phone OTP in Supabase
- [ ] Configure rate limiting on API routes
- [ ] Set up error monitoring (Sentry)
- [ ] Review Anthropic API usage limits and billing

## Key Files Reference

| Purpose | Path |
|---------|------|
| Feature flags | `src/config/features.ts` |
| App config | `app.json` |
| EAS config | `eas.json` |
| RN env vars | `.env.local` |
| API env vars | `api/.env.local` |
| Supabase setup | `docs/supabase-setup.md` |
| API routes | `api/src/app/api/` |
| Shared logic | `shared/` |
