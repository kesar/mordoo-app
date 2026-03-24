# Deployment Guide

## Prerequisites

- **EAS CLI**: `npm install -g eas-cli`
- **Expo account**: `eas login`
- **Apple Developer account** (for iOS builds/submissions)

## Environment Variables

EAS secrets are configured for the project. To view them:

```bash
eas secret:list
```

To add/update a secret:

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
eas secret:create --name EXPO_PUBLIC_API_BASE_URL --value "https://api.mordoo.app"
```

> Note: `eas secret:create` is deprecated — use `eas env:create` for newer CLI versions.

## Build Profiles

Defined in `eas.json`:

| Profile | Purpose | Distribution |
|---------|---------|--------------|
| `development` | Dev client + simulator | Internal |
| `preview` | Beta testing on devices | Internal |
| `production` | App Store / TestFlight | Store |

## Build Numbers

Build numbers auto-increment on production builds (`"autoIncrement": true` in `eas.json`). The current build number is stored in `app.json` under `expo.ios.buildNumber`.

App Store Connect requires a unique build number per app version. If you bump `expo.version` (e.g., `1.0.0` → `1.1.0`), the build number resets — you can set it back to `"1"` in `app.json`.

## iOS Builds

### Production (TestFlight / App Store)

```bash
eas build --platform ios --profile production
```

This will:
1. Auto-increment the build number in `app.json`
2. Upload project to EAS cloud
3. Build with managed signing (certificates handled by EAS)
4. Return a `.ipa` download URL

### Development (Simulator)

```bash
eas build --platform ios --profile development
```

### Preview (Internal Testing)

```bash
eas build --platform ios --profile preview
```

Register test devices first: `eas device:create`

## Submit to TestFlight

After a successful production build:

```bash
eas submit --platform ios --latest
```

This prompts for Apple ID credentials and uploads to App Store Connect. The build appears in TestFlight after Apple processing (usually 5-15 minutes).

To skip the interactive prompt in CI, set up an [App Store Connect API key](https://docs.expo.dev/submit/ios/#2-start-the-submission) and add `ascAppId` to the submit profile in `eas.json`.

## API Deployment

The API backend (`api/` directory) deploys to Vercel at `api.mordoo.app`.

```bash
cd api
vercel --prod
```

Or push to `main` for automatic deployment via Vercel Git integration.

### API Environment Variables (Vercel)

Set these in the Vercel dashboard:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

## Full Release Checklist

1. Ensure API is deployed and working: `https://api.mordoo.app`
2. Commit all changes to `main`
3. Build: `eas build --platform ios --profile production`
4. Submit: `eas submit --platform ios --latest`
5. In App Store Connect, add testers to the TestFlight build
6. For App Store release: complete the app listing (screenshots, description, privacy policy) and submit for review
