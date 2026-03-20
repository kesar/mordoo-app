# Auth & User System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase Auth (Phone OTP + Apple + Google) to Mordoo, create user profiles table, and update onboarding flow with real auth.

**Architecture:** Supabase client with MMKV storage adapter → auth service layer → updated auth store with session sync → auth listener in root layout → soul-gate with real auth buttons → phone OTP screen.

**Tech Stack:** @supabase/supabase-js, expo-apple-authentication, expo-auth-session, expo-web-browser, expo-crypto

**Spec:** `docs/superpowers/specs/2026-03-20-auth-user-system-design.md`

---

## Chunk 1: Supabase Setup & Auth Service

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Supabase and auth packages**

```bash
npm install --legacy-peer-deps @supabase/supabase-js expo-apple-authentication expo-auth-session expo-crypto
```

Note: `expo-web-browser` and `expo-secure-store` are already installed.

- [ ] **Step 2: Rebuild native project (new native modules)**

```bash
npx expo prebuild --clean
```

- [ ] **Step 3: Rebuild iOS**

```bash
npx expo run:ios --port 8082
```

Wait for "Build Succeeded" then Ctrl+C (we just need the build, not the running server).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add Supabase and auth dependencies"
```

---

### Task 2: Create environment config

**Files:**
- Create: `.env.local`
- Modify: `app.json`

- [ ] **Step 1: Create .env.local with placeholder values**

Create `.env.local` in project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

The user will replace these with real values from their Supabase dashboard.

- [ ] **Step 2: Add expo-apple-authentication to app.json plugins**

In `app.json`, add to the plugins array:

```json
"plugins": [
  "expo-router",
  "expo-secure-store",
  "expo-font",
  "expo-localization",
  "expo-web-browser",
  "expo-apple-authentication"
]
```

- [ ] **Step 3: Verify .env.local is in .gitignore**

Check that `.gitignore` has `.env*.local` pattern (it does — line 34).

- [ ] **Step 4: Commit app.json change only (not .env.local)**

```bash
git add app.json
git commit -m "feat: add expo-apple-authentication config plugin"
```

---

### Task 3: Create Supabase client

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create the Supabase client with MMKV adapter**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { storage } from '@/src/utils/storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const mmkvStorageAdapter = {
  getItem: (key: string) => Promise.resolve(storage.getString(key) ?? null),
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    storage.remove(key);
    return Promise.resolve();
  },
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

- [ ] **Step 2: Create the lib directory if needed**

```bash
mkdir -p src/lib
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client with MMKV storage adapter"
```

---

### Task 4: Create auth service

**Files:**
- Create: `src/services/auth.ts`

- [ ] **Step 1: Create auth service**

Create `src/services/auth.ts`:

```typescript
import { supabase } from '@/src/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Phone OTP
export async function signInWithPhone(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

// Apple Sign-In (native iOS)
export async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('No identity token returned from Apple');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
  if (error) throw error;
  return data;
}

// Google Sign-In (OAuth)
export async function signInWithGoogle() {
  // Create a nonce for security
  const rawNonce = Crypto.getRandomValues(new Uint8Array(16));
  const nonce = Array.from(rawNonce, (b) => b.toString(16).padStart(2, '0')).join('');

  const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'mordoo' });

  const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (oauthError) throw oauthError;
  if (!oauthData.url) throw new Error('No OAuth URL returned');

  const result = await AuthSession.openAuthSessionAsync(oauthData.url, redirectUrl);

  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled');
  }

  // Extract tokens from the callback URL
  const url = new URL(result.url);
  const params = new URLSearchParams(url.hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error('Missing tokens in OAuth callback');
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;
  return data;
}

// Sign Out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
```

- [ ] **Step 2: Create the services directory**

```bash
mkdir -p src/services
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/services/auth.ts
git commit -m "feat: add auth service with Phone OTP, Apple, and Google sign-in"
```

---

## Chunk 2: Store & Listener Integration

### Task 5: Update authStore to sync with Supabase

**Files:**
- Modify: `src/stores/authStore.ts`

- [ ] **Step 1: Rewrite authStore with Supabase session support**

Replace the entire contents of `src/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  authMode: 'guest' | 'account' | null;
  userId: string | null;
  supabaseUserId: string | null;
  token: string | null;

  setSupabaseSession: (session: Session) => void;
  setGuestAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authMode: null,
      userId: null,
      supabaseUserId: null,
      token: null,

      setSupabaseSession: (session: Session) => {
        set({
          isAuthenticated: true,
          authMode: 'account',
          userId: session.user.id,
          supabaseUserId: session.user.id,
          token: session.access_token,
        });
      },

      setGuestAuth: () => {
        const guestId = Date.now().toString(36) + Math.random().toString(36).slice(2);
        set({
          isAuthenticated: true,
          authMode: 'guest',
          userId: guestId,
          supabaseUserId: null,
          token: null,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          authMode: null,
          userId: null,
          supabaseUserId: null,
          token: null,
        });
      },
    }),
    {
      name: 'mordoo-auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        authMode: state.authMode,
        userId: state.userId,
        supabaseUserId: state.supabaseUserId,
        token: state.token,
      }),
    },
  ),
);
```

Key changes:
- Replaced `setAuth` with `setSupabaseSession` (takes a Supabase Session object)
- Added `setGuestAuth` (encapsulates guest ID generation)
- Added `supabaseUserId` field
- Removed the old `setAuth` that took `{ userId, token, mode }`

- [ ] **Step 2: Update soul-snapshot.tsx to use new API**

In `app/(onboarding)/soul-snapshot.tsx`, update the `handleEnterRealms` function.

Change:
```typescript
const setAuth = useAuthStore((s) => s.setAuth);
const authMode = useAuthStore((s) => s.authMode);
```

To:
```typescript
const setGuestAuth = useAuthStore((s) => s.setGuestAuth);
const authMode = useAuthStore((s) => s.authMode);
```

And change:
```typescript
if (!authMode) {
  const uuid = Date.now().toString(36) + Math.random().toString(36).slice(2);
  setAuth({ userId: uuid, mode: 'guest' });
}
```

To:
```typescript
if (!authMode) {
  setGuestAuth();
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/stores/authStore.ts app/(onboarding)/soul-snapshot.tsx
git commit -m "feat: update authStore with Supabase session support"
```

---

### Task 6: Create auth state listener

**Files:**
- Create: `src/hooks/useAuthListener.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create useAuthListener hook**

Create `src/hooks/useAuthListener.ts`:

```typescript
import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/stores/authStore';

export function useAuthListener() {
  const setSupabaseSession = useAuthStore((s) => s.setSupabaseSession);
  const logout = useAuthStore((s) => s.logout);
  const authMode = useAuthStore((s) => s.authMode);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setSupabaseSession(session);
        } else if (event === 'SIGNED_OUT' && authMode === 'account') {
          logout();
        }
        // Don't logout guests when there's no session
      },
    );

    return () => subscription.unsubscribe();
  }, [setSupabaseSession, logout, authMode]);
}
```

- [ ] **Step 2: Add useAuthListener to root layout**

In `app/_layout.tsx`, add the import:

```typescript
import { useAuthListener } from '@/src/hooks/useAuthListener';
```

Inside `RootLayout()`, after the `useHydration()` call, add:

```typescript
useAuthListener();
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAuthListener.ts app/_layout.tsx
git commit -m "feat: add Supabase auth state listener"
```

---

## Chunk 3: UI — Auth Screens

### Task 7: Create Phone OTP screen

**Files:**
- Create: `app/(onboarding)/phone-auth.tsx`
- Modify: `app/(onboarding)/_layout.tsx`

- [ ] **Step 1: Add phone-auth route to onboarding layout**

In `app/(onboarding)/_layout.tsx`, add the screen after `soul-gate`:

```typescript
<Stack.Screen name="phone-auth" />
```

- [ ] **Step 2: Create phone-auth.tsx**

Create `app/(onboarding)/phone-auth.tsx`:

```typescript
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { TopAppBar } from '@/src/components/ui/TopAppBar';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { signInWithPhone, verifyOTP } from '@/src/services/auth';

type Step = 'phone' | 'otp';

export default function PhoneAuth() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+66');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      await signInWithPhone(phone);
      setStep('otp');
      setTimeout(() => otpInputRef.current?.focus(), 300);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(phone, otpCode);
      // Auth listener will update the store, navigate to onboarding
      router.replace('/(onboarding)/birth-data');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TopAppBar showBackButton onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {step === 'phone' ? 'ENTER YOUR NUMBER' : 'VERIFY CODE'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'We will send a sacred code to your device.'
              : `Enter the 6-digit code sent to ${phone}`}
          </Text>

          {step === 'phone' ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+66 xxx xxx xxxx"
                placeholderTextColor={colors.outlineVariant}
                keyboardType="phone-pad"
                autoFocus
                editable={!loading}
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                ref={otpInputRef}
                style={styles.otpInput}
                value={otpCode}
                onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor={colors.outlineVariant}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.ctaWrapper}>
            {loading ? (
              <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
            ) : (
              <GoldButton
                title={step === 'phone' ? 'SEND CODE' : 'VERIFY'}
                onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
                variant="filled"
                fullWidth
                rounded
              />
            )}
          </View>

          {step === 'otp' && !loading && (
            <GoldButton
              title="Resend Code"
              onPress={() => {
                setOtpCode('');
                handleSendOTP();
              }}
              variant="ghost"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
    gap: 24,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 26,
    color: colors.gold.light,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.lg,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  inputContainer: {
    width: '100%',
    marginTop: 8,
  },
  phoneInput: {
    fontFamily: fonts.body.regular,
    fontSize: 24,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.gold.border,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  otpInput: {
    fontFamily: fonts.display.regular,
    fontSize: 36,
    color: colors.gold.light,
    borderWidth: 1,
    borderColor: colors.gold.border,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    letterSpacing: 12,
  },
  ctaWrapper: {
    width: '100%',
    marginTop: 8,
    minHeight: 56,
    justifyContent: 'center',
  },
});
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add app/(onboarding)/phone-auth.tsx app/(onboarding)/_layout.tsx
git commit -m "feat: add Phone OTP authentication screen"
```

---

### Task 8: Update soul-gate with real auth buttons

**Files:**
- Modify: `app/(onboarding)/soul-gate.tsx`

- [ ] **Step 1: Update soul-gate with Phone, Apple, Google buttons**

In `app/(onboarding)/soul-gate.tsx`:

Add imports at the top:

```typescript
import { Platform, Alert, ActivityIndicator } from 'react-native';
import { signInWithApple, signInWithGoogle } from '@/src/services/auth';
import { useState } from 'react';
```

Remove the existing `setAuth` usage:
```typescript
// Remove: const setAuth = useAuthStore((s) => s.setAuth);
```

Add `setGuestAuth` and state:
```typescript
const setGuestAuth = useAuthStore((s) => s.setGuestAuth);
const [loading, setLoading] = useState(false);
```

Replace the `handleCreateAccount` function:
```typescript
const handlePhoneAuth = () => {
  router.push('/(onboarding)/phone-auth');
};

const handleAppleAuth = async () => {
  setLoading(true);
  try {
    await signInWithApple();
    router.push('/(onboarding)/birth-data');
  } catch (error: any) {
    if (error.code !== 'ERR_REQUEST_CANCELED') {
      Alert.alert('Error', error.message || 'Apple Sign-In failed.');
    }
  } finally {
    setLoading(false);
  }
};

const handleGoogleAuth = async () => {
  setLoading(true);
  try {
    await signInWithGoogle();
    router.push('/(onboarding)/birth-data');
  } catch (error: any) {
    if (error.message !== 'Google sign-in was cancelled') {
      Alert.alert('Error', error.message || 'Google Sign-In failed.');
    }
  } finally {
    setLoading(false);
  }
};
```

Replace `handleGuestContinue`:
```typescript
const handleGuestContinue = () => {
  setGuestAuth();
  router.push('/(onboarding)/birth-data');
};
```

Replace the CTA section JSX (the part with `<GoldButton title="CREATE ACCOUNT"...`):

```tsx
<View style={styles.ctaSection}>
  {loading ? (
    <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
  ) : (
    <>
      <GoldButton
        title="CONTINUE WITH PHONE"
        onPress={handlePhoneAuth}
        variant="filled"
        fullWidth
      />
      {Platform.OS === 'ios' && (
        <GoldButton
          title="CONTINUE WITH APPLE"
          onPress={handleAppleAuth}
          variant="outlined"
          fullWidth
        />
      )}
      <GoldButton
        title="CONTINUE WITH GOOGLE"
        onPress={handleGoogleAuth}
        variant="outlined"
        fullWidth
      />
      <GoldButton
        title="Continue as Guest"
        onPress={handleGuestContinue}
        variant="ghost"
      />
    </>
  )}
</View>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/soul-gate.tsx
git commit -m "feat: update soul-gate with Phone, Apple, and Google auth options"
```

---

### Task 9: Supabase project setup instructions

**Files:**
- Create: `docs/supabase-setup.md`

- [ ] **Step 1: Create setup guide**

Create `docs/supabase-setup.md` with instructions for:

1. Create Supabase project at https://supabase.com
2. Copy URL and anon key to `.env.local`
3. Enable Phone Auth in Supabase Dashboard → Authentication → Providers
4. Enable Apple Auth provider (needs Apple Developer credentials)
5. Enable Google Auth provider (needs Google Cloud OAuth credentials)
6. Run the SQL migration for profiles table
7. SQL migration content from the spec

- [ ] **Step 2: Commit**

```bash
git add docs/supabase-setup.md
git commit -m "docs: add Supabase project setup guide"
```

---

### Task 10: Build and verify

- [ ] **Step 1: Rebuild native project**

```bash
npx expo prebuild --clean
```

- [ ] **Step 2: Build and run**

```bash
npx expo run:ios --port 8082
```

- [ ] **Step 3: Verify soul-gate shows new auth buttons**

Take screenshot to verify:
- "CONTINUE WITH PHONE" button
- "CONTINUE WITH APPLE" button (iOS only)
- "CONTINUE WITH GOOGLE" button
- "Continue as Guest" link

- [ ] **Step 4: Verify guest mode still works**

Tap "Continue as Guest" → should navigate to birth-data screen.

- [ ] **Step 5: Final TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit any remaining changes**

```bash
git add -A ':!ios' ':!android' ':!.env.local'
git commit -m "chore: post-build adjustments for auth system"
```
