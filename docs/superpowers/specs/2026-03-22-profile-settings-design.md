# Profile & Settings Screen — Design Spec

## Overview

Add a Profile tab to the main tab bar that displays user profile information and app settings. Combines profile display (data collected during onboarding but never shown back) with essential settings: language switching, notifications, and sign out.

## Navigation

- Add a 3rd tab "Profile" to the bottom tab bar alongside Pulse and Oracle
- New route group: `app/(main)/profile/`
- Tab icon: add a new `ProfileIcon` SVG to TarotIcons (simple user silhouette, consistent with existing icon style)

## Screen Layout

### Profile Card (top of screen)

- Left-aligned avatar circle showing user's first initial
  - Gold border (`colors.gold.DEFAULT`), subtle gradient background
  - Size: ~56px diameter
- User's display name (from Supabase `profiles` table)
- Birth data summary line: formatted date of birth (from `birth_data` table)
- Wrapped in a styled container matching existing card patterns

### Preferences Section

Section label: "PREFERENCES" — uppercase, muted gold (`colors.gold.muted` or similar token), small font with letter-spacing

- **Language** row
  - Left: globe icon + "Language" label
  - Right: current language name (e.g., "English" or "ไทย")
  - On tap: directly toggle between EN and TH (simple toggle, no picker)
  - Calls both `settingsStore.setLanguage()` and `i18n.changeLanguage()`
  - The entire screen re-renders in the new language immediately

- **Notifications** row
  - Left: bell icon + "Notifications" label
  - Right: toggle switch (gold when on)
  - Uses `settingsStore.setNotificationsEnabled()`
  - This is a local preference flag only — no push notification permission or token registration

Rows grouped in a card container with `colors.surface.container` background, rounded corners, divided by subtle separator lines.

### Account Section

Section label: "ACCOUNT" — same styling as Preferences label

- **Sign Out** row
  - Red text (use `colors.error` or add a `danger` color token)
  - On tap: show confirmation alert
  - On confirm: call `signOut()` from `src/services/auth.ts`, then `authStore.logout()`, then navigate to onboarding entry point
  - If `signOut()` throws, show an error alert and do not clear local state

## Screen States

- **Loading**: Show skeleton placeholders for the profile card while fetching
- **Error**: Show a brief error message with a retry option
- **Loaded**: Full profile card + settings sections

## Data Flow

### Profile Data
- Create `src/services/profile.ts` to fetch profile + birth data from Supabase
- Use React Query (`useQuery`) via a `useProfile` hook in the screen file
- Query key: `['profile', userId]`
- Fetches from `profiles` and `birth_data` tables using the authenticated user's ID

### Settings State
- Language and notifications already managed by `settingsStore` (Zustand + MMKV persistence)
- No new store needed

### Language Change
- `settingsStore.setLanguage()` currently only updates the store — it does not call `i18n.changeLanguage()`
- Modify `settingsStore.setLanguage()` to also call `i18n.changeLanguage(lang)` so the two stay in sync

### Logout Flow
1. Show confirmation alert (bilingual based on current language)
2. Call `signOut()` from `src/services/auth.ts` (Supabase `auth.signOut()`)
3. On success: call `useAuthStore.getState().logout()` to clear local auth state
4. Router replaces to entry point, which redirects to onboarding
5. On error: show error alert, do not clear local state

## New Files

| File | Purpose |
|------|---------|
| `app/(main)/profile/_layout.tsx` | Stack layout for profile tab |
| `app/(main)/profile/index.tsx` | Profile & settings screen |
| `src/services/profile.ts` | Fetch profile + birth data for authenticated user |
| `src/i18n/en/settings.json` | English translation strings |
| `src/i18n/th/settings.json` | Thai translation strings |

## Modified Files

| File | Change |
|------|--------|
| `app/(main)/_layout.tsx` | Add Profile tab to bottom tab bar; add `profile` branch to `TabIcon` component |
| `src/i18n/index.ts` | Register `settings` namespace |
| `src/i18n/en/common.json` | Add `tabs.profile` key |
| `src/i18n/th/common.json` | Add `tabs.profile` key (Thai) |
| `src/stores/settingsStore.ts` | Update `setLanguage()` to also call `i18n.changeLanguage()` |
| `src/components/icons/TarotIcons.tsx` | Add `ProfileIcon` SVG |

## Translation Keys (settings namespace)

```json
{
  "profile": "Profile",
  "preferences": "Preferences",
  "language": "Language",
  "languageEnglish": "English",
  "languageThai": "ไทย",
  "notifications": "Notifications",
  "account": "Account",
  "signOut": "Sign Out",
  "signOutConfirmTitle": "Sign Out",
  "signOutConfirmMessage": "Are you sure you want to sign out?",
  "signOutConfirmCancel": "Cancel",
  "signOutConfirmOk": "Sign Out"
}
```

## Design System Usage

- Colors: use existing tokens from `colors.ts` — `night.DEFAULT`, `gold.DEFAULT`, `parchment.DEFAULT`, `surface.container*`, `error`
- Typography: `CormorantGaramond` for the display name, `Text` component for everything else (auto-handles Thai font)
- Components: `Text` (bilingual-aware), existing icon components from TarotIcons
- Haptics: `lightHaptic()` on toggle interactions
- SafeAreaView wrapping for device notches

## Out of Scope

- Editing profile/birth data (future feature)
- Delete account
- Theme options
- Support/feedback link
- App version display
- Push notification permission/token management (notifications toggle is local-only for now)
