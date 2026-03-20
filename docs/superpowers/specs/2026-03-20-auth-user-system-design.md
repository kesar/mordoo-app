# Sub-project 2: Auth & User System — Design Spec

## Goal

Add real authentication to Mordoo using Supabase Auth with Phone OTP, Apple Sign-In, and Google Sign-In. Create a user profiles table, sync auth state with Supabase sessions, and update the onboarding flow to connect with the backend.

## Architecture

Supabase handles all authentication. The React Native app uses `@supabase/supabase-js` with a custom MMKV storage adapter (Supabase needs async storage for session persistence). The auth flow: soul-gate presents sign-in options → Supabase handles the auth → on success, a user profile row is created/updated → auth store syncs with Supabase session → app proceeds to onboarding or main screen.

Guest mode remains: users can skip auth and use a local-only guest ID. When they later create an account, their onboarding data is preserved and linked to the new Supabase user.

## Tech Stack

- @supabase/supabase-js (Supabase client)
- expo-auth-session + expo-web-browser (OAuth flows for Apple/Google)
- expo-apple-authentication (native Apple Sign-In on iOS)
- Supabase Phone Auth (OTP via SMS)
- expo-secure-store (for sensitive token storage)

---

## Scope

### In Scope

1. Install and configure Supabase client with MMKV session storage
2. Create Supabase project setup instructions (env vars, auth providers)
3. Phone OTP sign-in/sign-up flow
4. Apple Sign-In (native iOS)
5. Google Sign-In (via OAuth)
6. User profiles table (Supabase SQL migration)
7. Update authStore to sync with Supabase sessions
8. Update soul-gate screen with real auth buttons
9. Add auth session listener for token refresh
10. Guest-to-account upgrade path

### Out of Scope

- Supabase Row Level Security policies (Sub-project 3 — when we store user data)
- Forgot password / email auth (not in our auth methods)
- Admin panel or user management dashboard
- Rate limiting on auth endpoints (Supabase handles this)

---

## Component Design

### 1. Supabase Client Configuration

**File:** `src/lib/supabase.ts`

Create the Supabase client with a custom storage adapter that uses MMKV (Supabase needs `getItem`/`setItem`/`removeItem` that return Promises).

```typescript
import { createClient } from '@supabase/supabase-js';
import { storage } from '@/src/utils/storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const mmkvStorageAdapter = {
  getItem: (key: string) => Promise.resolve(storage.getString(key) ?? null),
  setItem: (key: string, value: string) => { storage.set(key, value); return Promise.resolve(); },
  removeItem: (key: string) => { storage.remove(key); return Promise.resolve(); },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**File:** `.env.local` (gitignored)

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. Auth Service Layer

**File:** `src/services/auth.ts`

Thin wrapper around Supabase Auth methods:

- `signInWithPhone(phone: string)` — sends OTP
- `verifyOTP(phone: string, token: string)` — verifies OTP code
- `signInWithApple()` — native Apple Sign-In via expo-apple-authentication
- `signInWithGoogle()` — OAuth via expo-auth-session
- `signOut()` — signs out of Supabase
- `getSession()` — returns current session
- `onAuthStateChange(callback)` — subscribes to auth events

### 3. Auth Store Updates

**File:** `src/stores/authStore.ts`

Update to sync with Supabase sessions:

- Add `supabaseUserId` field (the Supabase UUID)
- `setAuth` now accepts Supabase session data
- Add `initializeAuth()` that checks for existing Supabase session on app start
- Keep guest mode working (no Supabase session, local-only userId)

Persisted fields: `isAuthenticated`, `authMode`, `userId`, `supabaseUserId`, `token`.

### 4. Auth Session Listener

**File:** `src/hooks/useAuthListener.ts`

A hook used in the root layout that subscribes to `supabase.auth.onAuthStateChange`. On session changes (sign-in, sign-out, token refresh), it updates the auth store. This ensures the app stays in sync with Supabase's session state.

### 5. Soul Gate Screen Updates

**File:** `app/(onboarding)/soul-gate.tsx`

Replace "CREATE ACCOUNT" button with three auth options:
1. "Continue with Phone" — navigates to phone OTP screen
2. "Continue with Apple" — triggers native Apple Sign-In directly
3. "Continue with Google" — triggers Google OAuth directly
4. "Continue as Guest" — keeps current behavior

After successful auth, navigate to `birth-data` (onboarding step 2).

### 6. Phone OTP Screen

**File:** `app/(onboarding)/phone-auth.tsx`

New screen with two states:
1. **Enter phone number** — country code picker (default +66 for Thailand) + phone input + "Send Code" button
2. **Enter OTP code** — 6-digit code input + "Verify" button + "Resend code" link

On successful verification, create/update user profile and proceed to onboarding.

### 7. User Profiles Table

**Supabase SQL migration:**

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'th')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'standard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, language)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 8. Onboarding Layout Update

**File:** `app/(onboarding)/_layout.tsx`

Add `phone-auth` screen to the Stack navigator.

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/supabase.ts` | Create | Supabase client with MMKV storage adapter |
| `src/services/auth.ts` | Create | Auth service wrapping Supabase Auth methods |
| `src/stores/authStore.ts` | Modify | Sync with Supabase sessions, add supabaseUserId |
| `src/hooks/useAuthListener.ts` | Create | Subscribe to Supabase auth state changes |
| `app/(onboarding)/soul-gate.tsx` | Modify | Add Phone/Apple/Google auth buttons |
| `app/(onboarding)/phone-auth.tsx` | Create | Phone OTP verification screen |
| `app/(onboarding)/_layout.tsx` | Modify | Add phone-auth route |
| `app/_layout.tsx` | Modify | Add useAuthListener hook |
| `.env.local` | Create | Supabase URL and anon key |

---

## Auth Flow Diagrams

### New User (Phone OTP)
```
Soul Gate → "Continue with Phone" → Phone Auth Screen
→ Enter phone → Send OTP → Enter code → Verify
→ Supabase creates auth.user → Trigger creates profile
→ authStore updates → Navigate to birth-data → Complete onboarding
```

### New User (Apple/Google)
```
Soul Gate → "Continue with Apple/Google" → Native auth flow
→ Supabase creates auth.user → Trigger creates profile
→ authStore updates → Navigate to birth-data → Complete onboarding
```

### Returning User
```
App launch → useHydration → authStore has Supabase session
→ Supabase validates token → Already authenticated
→ onboardingComplete? → Main screen
```

### Guest → Account Upgrade
```
Guest using app → Settings "Create Account"
→ Auth flow (Phone/Apple/Google) → Link to existing onboarding data
→ Create profile with existing data
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Supabase Phone OTP requires Twilio or MessageBird setup | Document setup steps; user can test with Supabase's built-in test OTP mode |
| Apple Sign-In requires Apple Developer account + entitlements | Already have bundleIdentifier configured; document Apple Developer Portal setup |
| Google OAuth callback URL handling on mobile | Use expo-auth-session which handles deep linking correctly |
| Session token refresh failures | Auth listener handles SIGNED_OUT events and redirects to soul-gate |

---

## Success Criteria

1. User can sign in with phone number (OTP)
2. User can sign in with Apple
3. User can sign in with Google
4. Guest mode still works (no backend required)
5. Session persists across app restarts (MMKV)
6. User profile created in Supabase on first sign-in
7. Auth state syncs via onAuthStateChange listener
8. TypeScript compiles cleanly
