# Profile & Settings Screen — Design Spec

## Overview

Add a Profile tab to the main tab bar that displays user profile information and app settings. Combines profile display (data collected during onboarding but never shown back) with essential settings: language switching, notifications, and sign out.

## Navigation

- Add a 3rd tab "Profile" to the bottom tab bar alongside Pulse and Oracle
- New route group: `app/(main)/profile/`
- Tab icon: use an appropriate icon from TarotIcons (e.g., a user/star variant)

## Screen Layout

### Profile Card (top of screen)

- Left-aligned avatar circle showing user's first initial
  - Gold border (`#c9a84c`), subtle gradient background (`#c9a84c33`)
  - Size: ~56px diameter
- User's display name (from Supabase `profiles` table)
- Birth data summary line: zodiac sign emoji + formatted date of birth (from `birth_data` table)
- Wrapped in a `SacredCard` or equivalent styled container

### Preferences Section

Section label: "PREFERENCES" — uppercase, muted gold (`#887a5e`), small font with letter-spacing

- **Language** row
  - Left: globe icon + "Language" label
  - Right: current language name (e.g., "English" or "ไทย") + chevron
  - On tap: toggle between EN and TH
  - Uses `settingsStore.setLanguage()` which triggers `i18n.changeLanguage()`
  - The entire screen re-renders in the new language immediately

- **Notifications** row
  - Left: bell icon + "Notifications" label
  - Right: toggle switch (gold when on)
  - Uses `settingsStore.setNotificationsEnabled()`

Rows grouped in a card container with `#12122a` background, `16px` border-radius, divided by subtle separator lines (`#1a1a2e`).

### Account Section

Section label: "ACCOUNT" — same styling as Preferences label

- **Sign Out** row
  - Red text (`#e74c3c`, slightly transparent)
  - On tap: show confirmation alert
  - On confirm: call `signOut()` from `src/services/auth.ts`, then `authStore.logout()`, then navigate to onboarding entry point

## Data Flow

### Profile Data
- Create a service function in `src/services/` to fetch profile + birth data from Supabase
- Use React Query (`useQuery`) for caching and loading states
- Query key: `['profile', userId]`
- Fetches from `profiles` and `birth_data` tables using the authenticated user's ID

### Settings State
- Language and notifications already managed by `settingsStore` (Zustand + MMKV persistence)
- No new store needed

### Logout Flow
1. Show confirmation alert (bilingual based on current language)
2. Call `signOut()` from `src/services/auth.ts` (Supabase `auth.signOut()`)
3. Call `useAuthStore.getState().logout()` to clear local auth state
4. Router replaces to entry point, which redirects to onboarding

## New Files

| File | Purpose |
|------|---------|
| `app/(main)/profile/_layout.tsx` | Stack layout for profile tab |
| `app/(main)/profile/index.tsx` | Profile & settings screen |
| `src/i18n/en/settings.json` | English translation strings |
| `src/i18n/th/settings.json` | Thai translation strings |

## Modified Files

| File | Change |
|------|--------|
| `app/(main)/_layout.tsx` | Add Profile tab to bottom tab bar |
| `src/i18n/index.ts` | Register `settings` namespace |

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

- Colors: `night.DEFAULT` background, `gold.DEFAULT` accents, `parchment.DEFAULT` text, `#887a5e` muted labels, `#12122a` card backgrounds
- Typography: `CinzelDecorative` or `CormorantGaramond` for name, system font for settings rows
- Components: `Text` (bilingual-aware), `SacredCard`, existing icon components
- Haptics: `lightHaptic()` on toggle interactions
- SafeAreaView wrapping for device notches

## Out of Scope

- Editing profile/birth data (future feature)
- Delete account
- Theme options
- Support/feedback link
- App version display
