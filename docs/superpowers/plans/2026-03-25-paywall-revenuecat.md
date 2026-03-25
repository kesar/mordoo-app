# Paywall & RevenueCat Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix quota mismatches, integrate RevenueCat for subscription purchases, and build a paywall screen that triggers when users hit their daily limits.

**Architecture:** Server-side quotas are already enforced — we fix the constants to match the strategy (1 Oracle Q/day, 1 Siam Si/day), install RevenueCat SDK on the client, create a RevenueCat webhook on the API to sync tier changes, and build a full-screen paywall modal that replaces the current dead-end "come back tomorrow" UI.

**Tech Stack:** react-native-purchases (RevenueCat), Expo 55, Expo Router, Zustand, i18next, Next.js 15 (API webhook)

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/services/purchases.ts` | RevenueCat SDK init, purchase helpers, restore, subscription status check |
| `src/hooks/useSubscription.ts` | Hook wrapping RevenueCat customer info, exposes `isPremium`, `offering`, `subscribe()`, `restore()` |
| `src/components/Paywall.tsx` | Full-screen paywall modal component |
| `src/i18n/en/paywall.json` | English paywall translations |
| `src/i18n/th/paywall.json` | Thai paywall translations |
| `api/src/app/api/webhooks/revenuecat/route.ts` | POST endpoint — RevenueCat webhook to update `profiles.tier` |

### Modified Files
| File | Change |
|------|--------|
| `api/src/lib/config.ts` | Fix `FREE_ORACLE_QUESTIONS_PER_DAY` 5→1, `FREE_SIAM_SI_DRAWS_PER_DAY` 2→1 |
| `src/constants/tiers.ts` | Update `siamSiPerDay` to 1 (match strategy) |
| `app.json` | Add `react-native-purchases` plugin |
| `src/config/features.ts` | Add `paywall: true` feature flag |
| `app/_layout.tsx` | Init RevenueCat SDK on app start |
| `src/i18n/index.ts` | Register `paywall` namespace |
| `app/(main)/oracle/index.tsx` | Replace `QuotaExceeded` component with paywall trigger |
| `app/(main)/oracle/siam-si.tsx` | Replace dead-end limit UI with paywall trigger |
| `app/(main)/profile/index.tsx` | Add "Upgrade to Standard" button in profile/settings |
| `src/stores/authStore.ts` | Wire `logOutPurchases()` into logout flow |
| `src/i18n/en/common.json` | Add annual pricing string |
| `src/i18n/th/common.json` | Add annual pricing string |
| `src/i18n/en/settings.json` | Add subscription/upgrade strings |
| `src/i18n/th/settings.json` | Add subscription/upgrade strings |

---

## Task 1: Fix Quota Constants

**Files:**
- Modify: `api/src/lib/config.ts:11-14`
- Modify: `src/constants/tiers.ts:11`

- [ ] **Step 1: Update server-side Oracle quota**

In `api/src/lib/config.ts`, change line 11:

```ts
/** Free tier: max Oracle questions per day. */
export const FREE_ORACLE_QUESTIONS_PER_DAY = 1;
```

- [ ] **Step 2: Update server-side Siam Si quota**

In `api/src/lib/config.ts`, change line 14:

```ts
/** Free tier: max Siam Si draws per day. */
export const FREE_SIAM_SI_DRAWS_PER_DAY = 1;
```

- [ ] **Step 3: Update client-side Siam Si tier definition**

In `src/constants/tiers.ts`, change `siamSiPerDay` in the free tier from `2` to `1`:

```ts
siamSiPerDay: 1,
```

- [ ] **Step 4: Verify consistency**

Confirm all three places now agree:
- `api/src/lib/config.ts`: Oracle=1, SiamSi=1
- `src/constants/tiers.ts` free tier: `oracleQuestionsPerDay: 1`, `siamSiPerDay: 1`

- [ ] **Step 5: Commit**

```bash
git add api/src/lib/config.ts src/constants/tiers.ts
git commit -m "fix: align free tier quotas to 1 Oracle Q/day + 1 Siam Si/day"
```

---

## Task 2: Add Paywall Feature Flag & i18n Namespace

**Files:**
- Modify: `src/config/features.ts`
- Create: `src/i18n/en/paywall.json`
- Create: `src/i18n/th/paywall.json`
- Modify: `src/i18n/index.ts`
- Modify: `src/i18n/en/common.json`
- Modify: `src/i18n/th/common.json`

- [ ] **Step 1: Add paywall feature flag**

In `src/config/features.ts`:

```ts
export const features = {
  appleSignIn: false,
  googleSignIn: false,
  ratingPrompt: true,
  paywall: true,
} as const;
```

- [ ] **Step 2: Create English paywall translations**

Create `src/i18n/en/paywall.json`:

```json
{
  "title": "Unlock Your Full Potential",
  "subtitle": "The Oracle has more to share with you. Unlimited questions, unlimited Siam Si, and a memory that grows with your journey.",
  "benefits": {
    "unlimitedOracle": "Unlimited Oracle questions",
    "unlimitedSiamSi": "Unlimited Siam Si draws",
    "memory": "Oracle remembers your journey",
    "tarot": "All tarot spreads unlocked"
  },
  "annual": {
    "label": "Annual",
    "price": "฿1,190/yr",
    "perMonth": "฿99/mo",
    "badge": "SAVE 33%"
  },
  "monthly": {
    "label": "Monthly",
    "price": "฿149/mo"
  },
  "cta": "Start 7-Day Free Trial",
  "restore": "Restore Purchases",
  "terms": "Terms & Privacy",
  "notNow": "Not now",
  "quotaExceeded": {
    "title": "You've used your daily reading",
    "body": "Unlock unlimited access or come back tomorrow.",
    "comeBack": "Your next free reading is available tomorrow."
  },
  "restoreSuccess": "Subscription restored!",
  "restoreNotFound": "No active subscription found.",
  "purchaseError": "Purchase failed. Please try again."
}
```

- [ ] **Step 3: Create Thai paywall translations**

Create `src/i18n/th/paywall.json`:

```json
{
  "title": "ปลดล็อกศักยภาพเต็มที่",
  "subtitle": "หมอดู AI มีอีกมากที่อยากบอกคุณ ถามไม่จำกัด เซียมซีไม่จำกัด และหมอดูที่จดจำเส้นทางของคุณ",
  "benefits": {
    "unlimitedOracle": "ถามหมอดู AI ไม่จำกัด",
    "unlimitedSiamSi": "เซียมซีไม่จำกัด",
    "memory": "หมอดู AI จำบริบทการสนทนา",
    "tarot": "ไพ่ทาโร่ทุกรูปแบบ"
  },
  "annual": {
    "label": "รายปี",
    "price": "฿1,190/ปี",
    "perMonth": "฿99/เดือน",
    "badge": "ประหยัด 33%"
  },
  "monthly": {
    "label": "รายเดือน",
    "price": "฿149/เดือน"
  },
  "cta": "เริ่มทดลองฟรี 7 วัน",
  "restore": "กู้คืนการซื้อ",
  "terms": "ข้อกำหนดและความเป็นส่วนตัว",
  "notNow": "ไม่ใช่ตอนนี้",
  "quotaExceeded": {
    "title": "คุณใช้สิทธิ์ดูดวงประจำวันแล้ว",
    "body": "ปลดล็อกการใช้งานไม่จำกัด หรือกลับมาพรุ่งนี้",
    "comeBack": "การดูดวงฟรีครั้งต่อไปจะพร้อมใช้ในวันพรุ่งนี้"
  },
  "restoreSuccess": "กู้คืนการสมัครสำเร็จ!",
  "restoreNotFound": "ไม่พบการสมัครที่ใช้งานอยู่",
  "purchaseError": "การซื้อล้มเหลว กรุณาลองใหม่"
}
```

- [ ] **Step 4: Register paywall namespace in i18n**

In `src/i18n/index.ts`, add imports and register:

```ts
import enPaywall from './en/paywall.json';
import thPaywall from './th/paywall.json';
```

Add `'paywall'` to the `ns` array:

```ts
ns: ['common', 'onboarding', 'pulse', 'oracle', 'settings', 'paywall'],
```

Add to resources:

```ts
en: {
  // ... existing
  paywall: enPaywall,
},
th: {
  // ... existing
  paywall: thPaywall,
},
```

- [ ] **Step 5: Add annual pricing to common translations**

In `src/i18n/en/common.json`, update subscription section:

```json
"subscription": {
  "free": "Freemium",
  "standard": "Standard",
  "upgrade": "Upgrade to Standard",
  "price": "฿149/month",
  "annualPrice": "฿1,190/year"
}
```

In `src/i18n/th/common.json`, same:

```json
"subscription": {
  "free": "ฟรี",
  "standard": "มาตรฐาน",
  "upgrade": "อัปเกรดเป็นมาตรฐาน",
  "price": "฿149/เดือน",
  "annualPrice": "฿1,190/ปี"
}
```

- [ ] **Step 6: Commit**

```bash
git add src/config/features.ts src/i18n/
git commit -m "feat: add paywall i18n translations and feature flag"
```

---

## Task 3: Install RevenueCat & Configure Expo

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `app.json`

- [ ] **Step 1: Install RevenueCat SDK**

```bash
npm install react-native-purchases
```

Note: We're NOT installing `react-native-purchases-ui` — we're building a custom paywall that matches the app's dark/gold design system.

**Important:** This is a native module. After installing, you must run a new native build (`npx expo prebuild && npx expo run:ios`). `expo start` alone won't work.

- [ ] **Step 2: Add RevenueCat plugin to app.json**

In `app.json`, add to the `plugins` array:

```json
"react-native-purchases"
```

(after `"expo-splash-screen"`)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "chore: install react-native-purchases and configure Expo plugin"
```

---

## Task 4: Create RevenueCat Service Layer

**Files:**
- Create: `src/services/purchases.ts`

- [ ] **Step 1: Create purchases service**

Create `src/services/purchases.ts`:

```ts
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!;
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

const ENTITLEMENT_ID = 'standard';

let isConfigured = false;

/** Initialize RevenueCat SDK. Call once at app start. */
export function configureRevenueCat(): void {
  if (isConfigured) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  }

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  if (!apiKey) {
    console.warn('RevenueCat API key not set for platform:', Platform.OS);
    return;
  }

  Purchases.configure({ apiKey });
  isConfigured = true;
}

/** Identify the RevenueCat user (call after auth). */
export async function identifyUser(userId: string): Promise<void> {
  if (!isConfigured) return;
  await Purchases.logIn(userId);
}

/** Log out RevenueCat user (call on sign-out). */
export async function logOutPurchases(): Promise<void> {
  if (!isConfigured) return;
  await Purchases.logOut();
}

/** Check if user has active 'standard' entitlement. */
export async function checkSubscriptionStatus(): Promise<{
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
}> {
  if (!isConfigured) return { isPremium: false, customerInfo: null };

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { isPremium, customerInfo };
  } catch {
    return { isPremium: false, customerInfo: null };
  }
}

/** Get current offerings (subscription packages). */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isConfigured) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

/** Purchase a specific package. Returns updated customer info. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  isPremium: boolean;
  cancelled: boolean;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: isPremium, isPremium, cancelled: false };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, isPremium: false, cancelled: true };
    }
    throw error;
  }
}

/** Restore previous purchases. */
export async function restorePurchases(): Promise<{
  isPremium: boolean;
  customerInfo: CustomerInfo;
}> {
  const customerInfo = await Purchases.restoreTransactions();
  const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  return { isPremium, customerInfo };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/purchases.ts
git commit -m "feat: add RevenueCat service layer with purchase helpers"
```

---

## Task 5: Create useSubscription Hook

**Files:**
- Create: `src/hooks/useSubscription.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useSubscription.ts`:

```ts
import { useState, useEffect, useCallback } from 'react';
import { type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import {
  checkSubscriptionStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/src/services/purchases';
import { features } from '@/src/config/features';

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (!features.paywall) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      const [status, currentOffering] = await Promise.all([
        checkSubscriptionStatus(),
        getOfferings(),
      ]);
      if (cancelled) return;
      setIsPremium(status.isPremium);
      setOffering(currentOffering);
      setIsLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const subscribe = useCallback(async (pkg: PurchasesPackage) => {
    setIsPurchasing(true);
    try {
      const result = await purchasePackage(pkg);
      if (result.isPremium) {
        setIsPremium(true);
      }
      return result;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsRestoring(true);
    try {
      const result = await restorePurchases();
      setIsPremium(result.isPremium);
      return result.isPremium;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    const status = await checkSubscriptionStatus();
    setIsPremium(status.isPremium);
    return status.isPremium;
  }, []);

  return {
    isPremium,
    offering,
    isLoading,
    isPurchasing,
    isRestoring,
    subscribe,
    restore,
    refreshStatus,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSubscription.ts
git commit -m "feat: add useSubscription hook for RevenueCat state"
```

---

## Task 6: Build Paywall Component

**Files:**
- Create: `src/components/Paywall.tsx`

- [ ] **Step 1: Create the paywall component**

Create `src/components/Paywall.tsx`:

```tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { type PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
import { Text } from '@/src/components/ui/Text';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { StarIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { scale } from '@/src/utils/scale';
import { useSubscription } from '@/src/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { lightHaptic } from '@/src/utils/haptics';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribed?: () => void;
}

export function Paywall({ visible, onClose, onSubscribed }: PaywallProps) {
  const { t } = useTranslation('paywall');
  const { offering, subscribe, restore, isPurchasing, isRestoring } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  const annualPkg = offering?.availablePackages.find(
    (p) => p.packageType === PACKAGE_TYPE.ANNUAL,
  );
  const monthlyPkg = offering?.availablePackages.find(
    (p) => p.packageType === PACKAGE_TYPE.MONTHLY,
  );

  const selectedPkg: PurchasesPackage | undefined =
    selectedPlan === 'annual' ? annualPkg : monthlyPkg;

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    lightHaptic();
    try {
      const result = await subscribe(selectedPkg);
      if (result.isPremium) {
        onSubscribed?.();
        onClose();
      }
    } catch {
      Alert.alert(t('purchaseError'));
    }
  };

  const handleRestore = async () => {
    lightHaptic();
    try {
      const restored = await restore();
      if (restored) {
        Alert.alert(t('restoreSuccess'));
        onSubscribed?.();
        onClose();
      } else {
        Alert.alert(t('restoreNotFound'));
      }
    } catch {
      Alert.alert(t('restoreNotFound'));
    }
  };

  const benefits = [
    t('benefits.unlimitedOracle'),
    t('benefits.unlimitedSiamSi'),
    t('benefits.memory'),
    t('benefits.tarot'),
  ];

  const busy = isPurchasing || isRestoring;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={16}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Star icon */}
          <View style={styles.iconContainer}>
            <StarIcon size={40} color={colors.gold.DEFAULT} />
          </View>

          {/* Title & subtitle */}
          <Text style={styles.title}>{t('title')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>

          {/* Benefits list */}
          <View style={styles.benefitsCard}>
            {benefits.map((benefit, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={styles.benefitStar}>✦</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <View style={styles.planRow}>
            {/* Annual */}
            <Pressable
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => { lightHaptic(); setSelectedPlan('annual'); }}
            >
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{t('annual.badge')}</Text>
              </View>
              <Text style={styles.planLabel}>{t('annual.label')}</Text>
              <Text style={styles.planPrice}>{t('annual.price')}</Text>
              <Text style={styles.planPerMonth}>{t('annual.perMonth')}</Text>
            </Pressable>

            {/* Monthly */}
            <Pressable
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => { lightHaptic(); setSelectedPlan('monthly'); }}
            >
              <Text style={styles.planLabel}>{t('monthly.label')}</Text>
              <Text style={styles.planPrice}>{t('monthly.price')}</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <GoldButton
            title={busy ? '' : t('cta')}
            onPress={handlePurchase}
            fullWidth
            rounded
            disabled={busy || !selectedPkg}
          />
          {busy && (
            <ActivityIndicator
              color={colors.gold.DEFAULT}
              style={styles.spinner}
            />
          )}

          {/* Footer links */}
          <View style={styles.footer}>
            <Pressable onPress={handleRestore} disabled={busy}>
              <Text style={styles.footerLink}>{t('restore')}</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://mordoo.app/terms')}>
              <Text style={styles.footerLink}>{t('terms')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  closeBtn: {
    position: 'absolute',
    top: scale(56),
    right: scale(20),
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: colors.parchment.muted,
  },
  scrollContent: {
    paddingHorizontal: scale(28),
    paddingTop: scale(80),
    paddingBottom: scale(40),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: scale(20),
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes['2xl'],
    color: colors.gold.DEFAULT,
    textAlign: 'center',
    marginBottom: scale(12),
  },
  subtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    color: colors.parchment.dim,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: scale(28),
    paddingHorizontal: scale(8),
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: colors.night.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold.border,
    padding: scale(20),
    gap: scale(14),
    marginBottom: scale(28),
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  benefitStar: {
    fontSize: 14,
    color: colors.gold.DEFAULT,
  },
  benefitText: {
    fontFamily: fonts.body.medium,
    fontSize: fontSizes.base,
    color: colors.parchment.DEFAULT,
    flex: 1,
  },
  planRow: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
    marginBottom: scale(28),
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.night.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold.border,
    padding: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
  },
  planCardSelected: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 2,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
  },
  badgeContainer: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: scale(4),
  },
  badgeText: {
    fontFamily: fonts.display.bold,
    fontSize: 10,
    color: colors.onPrimary,
    letterSpacing: 1,
  },
  planLabel: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.sm,
    color: colors.parchment.dim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planPrice: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.lg,
    color: colors.parchment.DEFAULT,
  },
  planPerMonth: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.gold.light,
  },
  spinner: {
    marginTop: scale(12),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(24),
    marginTop: scale(20),
  },
  footerLink: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.parchment.muted,
    textDecorationLine: 'underline',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Paywall.tsx
git commit -m "feat: add Paywall modal component with plan selection"
```

---

## Task 7: Initialize RevenueCat in App Layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Add RevenueCat initialization**

In `app/_layout.tsx`, add import at the top:

```ts
import { configureRevenueCat, identifyUser } from '@/src/services/purchases';
import { useAuthStore } from '@/src/stores/authStore';
```

Add RevenueCat init call after `SplashScreen.preventAutoHideAsync();` (module scope):

```ts
configureRevenueCat();
```

In the `AppContent` component, add user identification. Note: the auth store exposes `supabaseUserId` directly (not a session object):

```ts
function AppContent() {
  const userId = useAuthStore((s) => s.supabaseUserId);

  useEffect(() => {
    if (userId) {
      identifyUser(userId);
    }
  }, [userId]);

  useDayChangeRefresh();
  useNotificationHandler();
  useAnalytics();
  // ... rest unchanged
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: initialize RevenueCat SDK on app start and identify user"
```

---

## Task 8: Wire Paywall to Oracle Quota-Exceeded

**Files:**
- Modify: `app/(main)/oracle/index.tsx`

- [ ] **Step 1: Replace QuotaExceeded with Paywall**

In `app/(main)/oracle/index.tsx`:

Add imports:

```ts
import { Paywall } from '@/src/components/Paywall';
import { features } from '@/src/config/features';
```

Add paywall state alongside existing `quotaExceeded` state:

```ts
const [showPaywall, setShowPaywall] = useState(false);
```

In the `onError` handler for `QUOTA_EXCEEDED` (around line 475), after `setQuotaExceeded(true)`:

```ts
if (error.message === 'QUOTA_EXCEEDED') {
  removeLastMessage();
  setQuotaExceeded(true);
  if (features.paywall) {
    setShowPaywall(true);
  }
}
```

Replace the `QuotaExceeded` sub-component to include an upgrade CTA:

```tsx
function QuotaExceeded({ onUpgrade }: { onUpgrade?: () => void }) {
  const { t } = useTranslation('paywall');
  return (
    <View style={styles.quotaCard}>
      <Text style={styles.quotaTitle}>{t('quotaExceeded.title')}</Text>
      <Text style={styles.quotaBody}>{t('quotaExceeded.body')}</Text>
      {features.paywall && onUpgrade && (
        <Pressable onPress={onUpgrade} style={styles.quotaUpgradeBtn}>
          <Text style={styles.quotaUpgradeText}>{t('cta')}</Text>
        </Pressable>
      )}
    </View>
  );
}
```

Add styles for the upgrade button:

```ts
quotaUpgradeBtn: {
  marginTop: 8,
  paddingVertical: 6,
  paddingHorizontal: 12,
  backgroundColor: colors.gold.muted,
  borderRadius: 8,
  alignSelf: 'flex-start',
},
quotaUpgradeText: {
  fontFamily: fonts.display.bold,
  fontSize: 11,
  color: colors.gold.light,
  letterSpacing: 1,
},
```

Update the `ListHeaderComponent` to pass the handler:

```tsx
ListHeaderComponent={
  quotaExceeded ? <QuotaExceeded onUpgrade={() => setShowPaywall(true)} /> : null
}
```

Add the Paywall modal in the return JSX, right before the closing `</SafeAreaView>`:

```tsx
<Paywall
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onSubscribed={() => {
    setQuotaExceeded(false);
    // Refetch quota from server
    fetchTodayConversation().then((data) => {
      setQuota(data.quota.used, data.quota.total, data.quota.remaining);
    });
  }}
/>
```

- [ ] **Step 2: Commit**

```bash
git add app/(main)/oracle/index.tsx
git commit -m "feat: wire paywall to Oracle quota-exceeded trigger"
```

---

## Task 9: Wire Paywall to Siam Si Quota-Exceeded

**Files:**
- Modify: `app/(main)/oracle/siam-si.tsx`

- [ ] **Step 1: Add paywall to Siam Si screen**

In `app/(main)/oracle/siam-si.tsx`, add imports:

```ts
import { Paywall } from '@/src/components/Paywall';
import { features } from '@/src/config/features';
```

Add state:

```ts
const [showPaywall, setShowPaywall] = useState(false);
```

When `canDraw` is false (quota exhausted), update the button area. Where the screen currently shows "NO DRAWS LEFT" / "COME BACK TOMORROW", add a paywall trigger:

When `!canDraw && !isLoadingQuota`, show paywall button instead of dead-end text. The exact location depends on existing code, but the pattern is:

```tsx
{!canDraw && !isLoadingQuota && features.paywall && (
  <GoldButton
    title={t('paywall:cta')}
    onPress={() => setShowPaywall(true)}
    variant="outlined"
    rounded
  />
)}
```

Add the Paywall modal before the closing tag:

```tsx
<Paywall
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onSubscribed={() => {
    refreshQuota();
  }}
/>
```

- [ ] **Step 2: Commit**

```bash
git add app/(main)/oracle/siam-si.tsx
git commit -m "feat: wire paywall to Siam Si quota-exceeded trigger"
```

---

## Task 10: RevenueCat Webhook API Endpoint

**Files:**
- Create: `api/src/app/api/webhooks/revenuecat/route.ts`

- [ ] **Step 1: Create webhook endpoint**

Create `api/src/app/api/webhooks/revenuecat/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';

const WEBHOOK_AUTH_KEY = process.env.REVENUECAT_WEBHOOK_KEY;

export async function POST(request: NextRequest) {
  // 1. Verify authorization
  const authHeader = request.headers.get('authorization');
  if (!WEBHOOK_AUTH_KEY || authHeader !== `Bearer ${WEBHOOK_AUTH_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse event
  const body = await request.json();
  const event = body.event;
  if (!event) {
    return NextResponse.json({ error: 'No event' }, { status: 400 });
  }

  const appUserId = event.app_user_id;
  const eventType = body.type;

  if (!appUserId) {
    return NextResponse.json({ error: 'No app_user_id' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // 3. Update tier based on event type
  // Events that grant/restore premium access
  const activateEvents = [
    'INITIAL_PURCHASE',
    'RENEWAL',
    'PRODUCT_CHANGE',
    'UNCANCELLATION',
  ];
  // Only EXPIRATION truly revokes access.
  // BILLING_ISSUE is NOT here — RevenueCat retries billing automatically.
  // CANCELLATION is NOT here — user keeps access until period ends.
  const deactivateEvents = [
    'EXPIRATION',
  ];

  let newTier: string | null = null;

  if (activateEvents.includes(eventType)) {
    newTier = 'standard';
  } else if (deactivateEvents.includes(eventType)) {
    newTier = 'free';
  }

  if (newTier) {
    const { error } = await serviceClient
      .from('profiles')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('id', appUserId);

    if (error) {
      console.error('Failed to update tier:', error);
      return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
    }

    console.log(`Updated user ${appUserId} tier to ${newTier} (event: ${eventType})`);
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add api/src/app/api/webhooks/revenuecat/route.ts
git commit -m "feat: add RevenueCat webhook endpoint for tier sync"
```

---

## Task 11: Environment Variables Documentation

**Files:**
- No code changes — document what needs to be configured

- [ ] **Step 1: Document required env vars**

The following environment variables need to be set:

**Mobile (`.env.local`):**
```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=   # From RevenueCat dashboard > Project > API Keys > iOS
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=  # From RevenueCat dashboard > Project > API Keys > Android
```

**API (`api/.env.local`):**
```
REVENUECAT_WEBHOOK_KEY=   # Secret you generate, set in RevenueCat webhook config as Bearer token
```

**RevenueCat Dashboard Setup:**
1. Create project in RevenueCat
2. Add iOS app (bundle ID: `ai.mordoo.app`)
3. Add Android app (package: `ai.mordoo.app`)
4. Create entitlement named `standard`
5. Create products:
   - `mordoo_standard_monthly` — ฿149/mo with 7-day free trial
   - `mordoo_standard_annual` — ฿1,190/yr with 7-day free trial
6. Create offering "default" with both packages
7. Configure webhook → `https://api.mordoo.app/api/webhooks/revenuecat`
   - Auth header: `Bearer <your-webhook-key>`
   - Events: INITIAL_PURCHASE, RENEWAL, EXPIRATION, BILLING_ISSUE, PRODUCT_CHANGE, UNCANCELLATION

- [ ] **Step 2: Commit** (update CLAUDE.md env vars section)

```bash
git add CLAUDE.md
git commit -m "docs: add RevenueCat environment variable documentation"
```

---

## Task 12: Add Upgrade Button to Profile/Settings

**Files:**
- Modify: `app/(main)/profile/index.tsx`
- Modify: `src/i18n/en/settings.json`
- Modify: `src/i18n/th/settings.json`

This is the highest-converting paywall trigger (15-20% per spec) — users self-initiate from settings.

- [ ] **Step 1: Add settings translations**

In `src/i18n/en/settings.json`, add:

```json
"subscription": "Subscription",
"currentPlan": "Current Plan",
"upgradeToPremium": "Upgrade to Standard",
"manageSubscription": "Manage Subscription",
"premium": "Standard ✦"
```

In `src/i18n/th/settings.json`, add:

```json
"subscription": "การสมัครสมาชิก",
"currentPlan": "แพ็กเกจปัจจุบัน",
"upgradeToPremium": "อัปเกรดเป็นมาตรฐาน",
"manageSubscription": "จัดการการสมัคร",
"premium": "มาตรฐาน ✦"
```

- [ ] **Step 2: Add upgrade section to profile screen**

In `app/(main)/profile/index.tsx`, add imports:

```ts
import { Paywall } from '@/src/components/Paywall';
import { useSubscription } from '@/src/hooks/useSubscription';
import { features } from '@/src/config/features';
```

Add state and hook:

```ts
const [showPaywall, setShowPaywall] = useState(false);
const { isPremium, refreshStatus } = useSubscription();
```

Add a "Subscription" section between the Profile Card and Preferences sections:

```tsx
{/* Subscription */}
{features.paywall && (
  <>
    <Text style={styles.sectionLabel}>{t('subscription')}</Text>
    <View style={styles.settingsGroup}>
      <View style={styles.settingsRow}>
        <Text style={styles.settingsLabel}>{t('currentPlan')}</Text>
        <Text style={[styles.settingsValue, isPremium && { color: colors.gold.DEFAULT }]}>
          {isPremium ? t('premium') : t('common:subscription.free')}
        </Text>
      </View>
      {!isPremium && (
        <>
          <View style={styles.separator} />
          <Pressable
            style={styles.settingsRow}
            onPress={() => { lightHaptic(); setShowPaywall(true); }}
          >
            <Text style={[styles.settingsLabel, { color: colors.gold.DEFAULT }]}>
              {t('upgradeToPremium')}
            </Text>
            <Text style={{ color: colors.gold.DEFAULT, fontSize: fontSizes.sm }}>→</Text>
          </Pressable>
        </>
      )}
    </View>
  </>
)}
```

Add the Paywall modal before the time picker modal:

```tsx
<Paywall
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onSubscribed={() => {
    refreshStatus();
    refetch(); // Re-fetch profile to get updated tier
  }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add app/(main)/profile/index.tsx src/i18n/en/settings.json src/i18n/th/settings.json
git commit -m "feat: add Upgrade to Standard button in profile settings"
```

---

## Task 13: Wire logOutPurchases to Sign-Out Flow

**Files:**
- Modify: `src/stores/authStore.ts`

- [ ] **Step 1: Import and call logOutPurchases in logout**

In `src/stores/authStore.ts`, add import at the top:

```ts
import { logOutPurchases } from '@/src/services/purchases';
```

In the `logout` action (line 51-58), add RevenueCat logout:

```ts
logout: () => {
  clearUserStores();
  logOutPurchases(); // Fire-and-forget — don't block logout on this
  set({
    isAuthenticated: false,
    userId: null,
    supabaseUserId: null,
    token: null,
  });
},
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/authStore.ts
git commit -m "feat: log out RevenueCat user on sign-out"
```

---

## Summary of Changes

| Area | Before | After |
|------|--------|-------|
| Oracle free quota | 5/day (server) vs 1/day (client) | 1/day everywhere |
| Siam Si free quota | 2/day | 1/day everywhere |
| Quota exceeded | Dead-end "come back tomorrow" | Paywall modal with upgrade CTA |
| Purchase flow | None | RevenueCat SDK + custom paywall |
| Tier sync | Manual | RevenueCat webhook → profiles.tier |
| Annual plan | Not offered | ฿1,190/yr with 33% savings badge |
| Free trial | None | 7-day (configured in App Store Connect/Play Console) |
| Settings upgrade | No upgrade option | "Upgrade to Standard" in profile settings |
| Sign-out cleanup | No purchase state cleanup | RevenueCat user logged out on sign-out |
