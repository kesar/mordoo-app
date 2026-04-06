# Stealth Resubmission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resubmit Mordoo under a new App Store identity with horoscope features hidden behind remote feature flags, enabling them via API toggle after approval.

**Architecture:** Remote feature flags fetched from API on cold start, cached in MMKV, surfaced via Zustand store. Changes apply on next launch only (no mid-session UI shifts). Home tab replaces Pulse tab when `dailyPulse` flag is off.

**Tech Stack:** React Native / Expo, Zustand + MMKV, Next.js API, i18next

**Spec:** `docs/superpowers/specs/2026-04-03-stealth-resubmission-strategy.md`

---

## File Map

### New Files
| File | Purpose |
|------|---------|
| `api/src/app/api/config/features/route.ts` | GET endpoint returning feature flags |
| `src/stores/featureFlagStore.ts` | Zustand store hydrated from MMKV, read by all components |
| `src/services/feature-flags.ts` | Fetch flags from API, write to MMKV for next launch |
| `src/constants/thai-proverbs.ts` | ~50 Thai proverbs with English translations |
| `app/(main)/home/index.tsx` | Home tab screen (greeting, proverbs, quick actions, cultural content) |
| `app/(main)/home/_layout.tsx` | Home tab stack layout |
| `src/i18n/en/home.json` | English translations for Home tab |
| `src/i18n/th/home.json` | Thai translations for Home tab |

### Modified Files
| File | Change |
|------|--------|
| `src/config/features.ts` | Add new flag keys with safe defaults |
| `app/(main)/_layout.tsx` | Conditionally swap Pulse tab for Home tab based on `dailyPulse` flag |
| `app/(main)/profile/index.tsx` | Hide ZodiacCards when `zodiacReferences` is off |
| `app/(main)/oracle/siam-si.tsx` | Hide fortune badge when `fortuneLabels` is off |
| `app/(onboarding)/life-context.tsx` | Skip soul-snapshot, go directly to main app |
| `src/components/Paywall.tsx` | Conditionally hide tarot benefit line |
| `src/i18n/en/paywall.json` | Reword "daily reading" → "today's limit" |
| `src/i18n/th/paywall.json` | Reword Thai equivalent |
| `src/i18n/en/settings.json` | Reword "daily reading reminder" → "daily reminder" |
| `src/i18n/th/settings.json` | Reword Thai equivalent |
| `src/i18n/en/common.json` | Reword notification prompt (remove "Prana Index", "lucky elements") |
| `src/i18n/th/common.json` | Reword Thai equivalent |
| `src/utils/siri-shortcuts.ts` | Update shortcut titles and phrases, update activityType to new bundle ID |
| `api/src/app/api/oracle/chat/route.ts` | Conditionally strip zodiac from system prompt |
| `app.json` | New bundle ID, new EAS project ID (manual step) |
| `fastlane/metadata/en-US/description.txt` | Review-safe description |
| `fastlane/metadata/en-US/subtitle.txt` | Review-safe subtitle |
| `fastlane/metadata/en-US/keywords.txt` | Review-safe keywords |
| `fastlane/metadata/en-US/name.txt` | New app name |
| `fastlane/metadata/review_information/notes.txt` | New reviewer notes |
| `assets/icon.png` | New app icon (manual — generate with AI image tool) |
| `assets/splash-icon.png` | New splash image (manual — generate with AI image tool) |

---

## Task 1: API Feature Flags Endpoint

**Files:**
- Create: `api/src/app/api/config/features/route.ts`

- [ ] **Step 1: Create the feature flags endpoint**

```typescript
// api/src/app/api/config/features/route.ts
import { NextResponse } from 'next/server';

// Toggle these after App Store approval
const FLAGS = {
  dailyPulse: false,
  zodiacReferences: false,
  fortuneLabels: false,
  luckyElements: false,
  siamSi: true,
  oracleChat: true,
};

const VERSION = 1;

export async function GET() {
  return NextResponse.json(
    { flags: FLAGS, v: VERSION },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    },
  );
}
```

- [ ] **Step 2: Verify it works locally**

Run: `cd api && npm run dev`

Then: `curl http://localhost:3001/api/config/features`

Expected: `{"flags":{"dailyPulse":false,...},"v":1}`

- [ ] **Step 3: Commit**

```bash
git add api/src/app/api/config/features/route.ts
git commit -m "feat: add remote feature flags endpoint"
```

---

## Task 2: Feature Flag Store (Zustand + MMKV)

**Files:**
- Modify: `src/config/features.ts`
- Create: `src/stores/featureFlagStore.ts`
- Create: `src/services/feature-flags.ts`

- [ ] **Step 1: Update `src/config/features.ts` with new flags**

Replace the entire file content:

```typescript
// src/config/features.ts

// These are the HARDCODED defaults used when:
// 1. First install (no MMKV cache yet)
// 2. MMKV cache exists but a flag key is missing (new flag added in update)
//
// Set to SAFE values for App Store review.
// After approval, flip via API — app picks up on next cold start.

export const features = {
  appleSignIn: false,
  googleSignIn: false,
  ratingPrompt: true,
  paywall: true,

  // Remote-toggled flags (synced from /api/config/features)
  dailyPulse: false,
  zodiacReferences: false,
  fortuneLabels: false,
  luckyElements: false,
  siamSi: true,
  oracleChat: true,
} as const;

export type FeatureFlags = typeof features;
export type RemoteFlagKey = 'dailyPulse' | 'zodiacReferences' | 'fortuneLabels' | 'luckyElements' | 'siamSi' | 'oracleChat';
export const REMOTE_FLAG_KEYS: RemoteFlagKey[] = [
  'dailyPulse', 'zodiacReferences', 'fortuneLabels', 'luckyElements', 'siamSi', 'oracleChat',
];
```

- [ ] **Step 2: Create `src/stores/featureFlagStore.ts`**

```typescript
// src/stores/featureFlagStore.ts
import { create } from 'zustand';
import { features, type FeatureFlags } from '@/src/config/features';
import { storage } from '@/src/utils/storage';

const MMKV_KEY = 'mordoo-feature-flags';

function readCachedFlags(): FeatureFlags {
  const raw = storage.getString(MMKV_KEY);
  if (!raw) return { ...features };
  try {
    const cached = JSON.parse(raw) as { flags: Partial<FeatureFlags>; v: number };
    // Merge cached over defaults — ensures new flags get default values
    return { ...features, ...cached.flags };
  } catch {
    return { ...features };
  }
}

interface FeatureFlagState extends FeatureFlags {
  _hydrated: boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>()(() => ({
  ...readCachedFlags(),
  _hydrated: true,
}));
```

- [ ] **Step 3: Create `src/services/feature-flags.ts`**

```typescript
// src/services/feature-flags.ts
import { storage } from '@/src/utils/storage';
import { REMOTE_FLAG_KEYS, type RemoteFlagKey } from '@/src/config/features';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const MMKV_KEY = 'mordoo-feature-flags';

interface FlagResponse {
  flags: Record<RemoteFlagKey, boolean>;
  v: number;
}

/**
 * Fetch remote flags and write to MMKV for next cold start.
 * Does NOT update Zustand — changes apply on next launch only.
 * Call this once on app cold start (fire-and-forget).
 */
export async function syncRemoteFlags(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/config/features`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return;

    const data: FlagResponse = await res.json();
    if (!data.flags || typeof data.v !== 'number') return;

    // Check version — skip write if unchanged
    const raw = storage.getString(MMKV_KEY);
    if (raw) {
      try {
        const cached = JSON.parse(raw);
        if (cached.v === data.v) return; // same version, skip
      } catch {
        // corrupted cache, overwrite
      }
    }

    // Only persist known remote flag keys
    const safeFlags: Partial<Record<RemoteFlagKey, boolean>> = {};
    for (const key of REMOTE_FLAG_KEYS) {
      if (typeof data.flags[key] === 'boolean') {
        safeFlags[key] = data.flags[key];
      }
    }

    storage.set(MMKV_KEY, JSON.stringify({ flags: safeFlags, v: data.v }));
  } catch {
    // Network error — silently ignore, cached flags persist
  }
}
```

- [ ] **Step 4: Wire up `syncRemoteFlags` on app cold start**

Find the app's root layout or entry point. Add a one-time call:

In `app/_layout.tsx` (or wherever the root `useEffect` runs on mount), add:

```typescript
import { syncRemoteFlags } from '@/src/services/feature-flags';

// Inside the root component's useEffect (runs once on cold start):
useEffect(() => {
  syncRemoteFlags(); // fire-and-forget, no await
}, []);
```

- [ ] **Step 5: Commit**

```bash
git add src/config/features.ts src/stores/featureFlagStore.ts src/services/feature-flags.ts app/_layout.tsx
git commit -m "feat: add remote feature flag system (MMKV + Zustand + API sync)"
```

---

## Task 3: Conditionally Swap Pulse Tab for Home Tab

**Files:**
- Create: `app/(main)/home/_layout.tsx`
- Create: `app/(main)/home/index.tsx` (placeholder — full implementation in Task 7)
- Modify: `app/(main)/_layout.tsx`

- [ ] **Step 1: Create Home tab layout**

```typescript
// app/(main)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 2: Create Home tab placeholder screen**

```typescript
// app/(main)/home/index.tsx
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.title}>Mor Doo</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.night.DEFAULT },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: fonts.display.bold, fontSize: 24, color: colors.gold.DEFAULT },
});
```

- [ ] **Step 3: Modify `app/(main)/_layout.tsx` to swap tabs based on feature flag**

Replace the file content with:

```typescript
// app/(main)/_layout.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StarIcon, OracleHeartIcon, ProfileIcon } from '@/src/components/icons/TarotIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { lightHaptic } from '@/src/utils/haptics';
import { useFeatureFlagStore } from '@/src/stores/featureFlagStore';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

// Lotus icon for Home tab (simple SVG path)
function LotusIcon({ size = 22, color }: { size?: number; color: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <StarIcon size={size} color={color} />
    </View>
  );
}

export default function MainLayout() {
  const { t } = useTranslation();
  const dailyPulse = useFeatureFlagStore((s) => s.dailyPulse);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,20,0.95)',
          borderTopColor: 'rgba(201,168,76,0.25)',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 32,
          paddingTop: 0,
          paddingHorizontal: 24,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: 'absolute',
          elevation: 0,
          shadowColor: colors.gold.DEFAULT,
          shadowOffset: { width: 0, height: -15 },
          shadowOpacity: 0.12,
          shadowRadius: 50,
        },
        tabBarActiveTintColor: colors.gold.light,
        tabBarInactiveTintColor: 'rgba(201,168,76,0.5)',
        tabBarLabelStyle: {
          fontFamily: fonts.thai.medium,
          fontSize: 10,
          letterSpacing: 3,
          textTransform: 'uppercase',
        },
        tabBarButton: (props: BottomTabBarButtonProps) => <TabButton {...props} />,
      }}
    >
      {dailyPulse ? (
        <Tabs.Screen
          name="pulse"
          listeners={{ tabPress: () => lightHaptic() }}
          options={{
            title: t('tabs.pulse'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="pulse" color={color} focused={focused} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="home"
          listeners={{ tabPress: () => lightHaptic() }}
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
      )}

      {/* Hide the swapped-out tab */}
      {dailyPulse ? (
        <Tabs.Screen name="home" options={{ href: null }} />
      ) : (
        <Tabs.Screen name="pulse" options={{ href: null }} />
      )}

      <Tabs.Screen
        name="oracle"
        listeners={{ tabPress: () => lightHaptic() }}
        options={{
          title: t('tabs.oracle'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="oracle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{ tabPress: () => lightHaptic() }}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabButton({ children, accessibilityState, onPress, style }: BottomTabBarButtonProps) {
  const selected = accessibilityState?.selected ?? false;
  return (
    <Pressable
      onPress={onPress}
      style={[
        style,
        tabStyles.tabButton,
        selected && tabStyles.tabButtonActive,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      {children}
    </Pressable>
  );
}

function TabIcon({ name, color }: { name: string; color: string; focused: boolean }) {
  const size = 22;
  const icon =
    name === 'pulse' ? (
      <StarIcon size={size} color={color} />
    ) : name === 'home' ? (
      <LotusIcon size={size} color={color} />
    ) : name === 'oracle' ? (
      <OracleHeartIcon size={size} color={color} />
    ) : name === 'profile' ? (
      <ProfileIcon size={size} color={color} />
    ) : null;
  return <View style={tabStyles.iconWrap}>{icon}</View>;
}

const tabStyles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 4: Add `tabs.home` translation key**

In `src/i18n/en/common.json`, add to the `tabs` object:

```json
"home": "Home"
```

In `src/i18n/th/common.json`, add to the `tabs` object:

```json
"home": "หน้าแรก"
```

- [ ] **Step 5: Commit**

```bash
git add app/(main)/home/ app/(main)/_layout.tsx src/i18n/en/common.json src/i18n/th/common.json
git commit -m "feat: conditionally swap Pulse tab for Home tab based on dailyPulse flag"
```

---

## Task 4: Hide Zodiac Cards in Profile

**Files:**
- Modify: `app/(main)/profile/index.tsx`

- [ ] **Step 1: Import the feature flag store**

At the top of `app/(main)/profile/index.tsx`, add:

```typescript
import { useFeatureFlagStore } from '@/src/stores/featureFlagStore';
```

- [ ] **Step 2: Read the flag inside the component**

Inside `ProfileScreen()`, after the existing hook calls (around line 132), add:

```typescript
const zodiacReferences = useFeatureFlagStore((s) => s.zodiacReferences);
```

- [ ] **Step 3: Conditionally hide zodiac query**

Change line 144 from:

```typescript
  const { data: zodiac, isLoading: zodiacLoading } = useQuery({
    queryKey: ['zodiac-signs', userId, language],
    queryFn: () => fetchZodiacSigns(language as 'en' | 'th'),
    enabled: !!userId && !!profile?.dateOfBirth,
    staleTime: Infinity,
  });
```

To:

```typescript
  const { data: zodiac, isLoading: zodiacLoading } = useQuery({
    queryKey: ['zodiac-signs', userId, language],
    queryFn: () => fetchZodiacSigns(language as 'en' | 'th'),
    enabled: zodiacReferences && !!userId && !!profile?.dateOfBirth,
    staleTime: Infinity,
  });
```

- [ ] **Step 4: Conditionally hide zodiac cards rendering**

Change the zodiac cards block (lines 333–357) from:

```tsx
        {/* Zodiac Signs */}
        {zodiac ? (
          <View style={{ gap: 0, marginBottom: 14 }}>
            <ZodiacCard
              systemLabel={t('westernZodiac')}
              ...
            />
            <ZodiacCard
              systemLabel={t('chineseZodiac')}
              ...
            />
          </View>
        ) : (isLoading || zodiacLoading) ? (
          <View style={{ gap: 0, marginBottom: 14 }}>
            <ZodiacCardSkeleton />
            <ZodiacCardSkeleton />
          </View>
        ) : null}
```

To:

```tsx
        {/* Zodiac Signs — hidden when zodiacReferences flag is off */}
        {zodiacReferences && (
          zodiac ? (
            <View style={{ gap: 0, marginBottom: 14 }}>
              <ZodiacCard
                systemLabel={t('westernZodiac')}
                signName={zodiac.western.name}
                element={zodiac.western.element}
                rulingPlanet={zodiac.western.rulingPlanet}
                traits={zodiac.western.traits}
                image={WESTERN_IMAGES[zodiac.western.image]}
              />
              <ZodiacCard
                systemLabel={t('chineseZodiac')}
                signName={zodiac.chinese.name}
                element={zodiac.chinese.element}
                traits={zodiac.chinese.traits}
                image={CHINESE_IMAGES[zodiac.chinese.image]}
              />
            </View>
          ) : (isLoading || zodiacLoading) ? (
            <View style={{ gap: 0, marginBottom: 14 }}>
              <ZodiacCardSkeleton />
              <ZodiacCardSkeleton />
            </View>
          ) : null
        )}
```

- [ ] **Step 5: Commit**

```bash
git add app/(main)/profile/index.tsx
git commit -m "feat: hide zodiac cards in profile when zodiacReferences flag is off"
```

---

## Task 5: Hide Fortune Labels in Siam Si

**Files:**
- Modify: `app/(main)/oracle/siam-si.tsx`

- [ ] **Step 1: Import the feature flag store**

At the top of `app/(main)/oracle/siam-si.tsx`, add:

```typescript
import { useFeatureFlagStore } from '@/src/stores/featureFlagStore';
```

- [ ] **Step 2: Read the flag inside the component**

Inside `SiamSiScreen()`, after the existing hook calls, add:

```typescript
const fortuneLabels = useFeatureFlagStore((s) => s.fortuneLabels);
```

Note: there's a naming collision — the existing `fortuneLabels` variable on line 46 is a Record of translated labels. Rename the flag variable:

```typescript
const showFortuneLabels = useFeatureFlagStore((s) => s.fortuneLabels);
```

- [ ] **Step 3: Conditionally hide the fortune badge in the result card**

Find the fortune badge block (lines 219–228):

```tsx
            <View
              style={[
                styles.fortuneBadge,
                { backgroundColor: FORTUNE_COLORS[currentStick.fortune] ?? colors.gold.DEFAULT },
              ]}
            >
              <Text style={styles.fortuneText}>
                {fortuneLabels[currentStick.fortune] ?? currentStick.fortune}
              </Text>
            </View>
```

Replace with:

```tsx
            {showFortuneLabels && (
              <View
                style={[
                  styles.fortuneBadge,
                  { backgroundColor: FORTUNE_COLORS[currentStick.fortune] ?? colors.gold.DEFAULT },
                ]}
              >
                <Text style={styles.fortuneText}>
                  {fortuneLabels[currentStick.fortune] ?? currentStick.fortune}
                </Text>
              </View>
            )}
```

- [ ] **Step 4: Also conditionally hide fortune color on result card border**

Change the result card border color (line 215):

```tsx
                borderColor: FORTUNE_COLORS[currentStick.fortune] ?? colors.gold.DEFAULT,
```

To:

```tsx
                borderColor: showFortuneLabels
                  ? (FORTUNE_COLORS[currentStick.fortune] ?? colors.gold.DEFAULT)
                  : colors.gold.DEFAULT,
```

- [ ] **Step 5: Commit**

```bash
git add app/(main)/oracle/siam-si.tsx
git commit -m "feat: hide fortune labels in Siam Si when fortuneLabels flag is off"
```

---

## Task 6: Skip Soul Snapshot in Onboarding

**Files:**
- Modify: `app/(onboarding)/life-context.tsx`

The Soul Snapshot screen (`soul-snapshot.tsx`) is already not in the onboarding `_layout.tsx` Stack definition — it appears to be navigated to from `life-context.tsx` or `power-ups.tsx`. Looking at `life-context.tsx`, the `handleContinue` function calls `router.replace('/(main)/pulse')` — it goes straight to the main app. So Soul Snapshot is likely only reached from `power-ups.tsx`.

Check: `power-ups.tsx` also calls `router.replace('/(main)/pulse')`. The soul-snapshot isn't in the Stack layout at all — it may be a dead route or accessed differently.

Since soul-snapshot is not in the onboarding layout Stack, it's not shown in the current flow. But we need to update the routes that navigate to `/(main)/pulse` to navigate to `/(main)/home` when pulse is disabled.

- [ ] **Step 1: Update `life-context.tsx` navigation target**

In `app/(onboarding)/life-context.tsx`, change `handleContinue`:

```typescript
import { useFeatureFlagStore } from '@/src/stores/featureFlagStore';
```

Inside the component:

```typescript
const dailyPulse = useFeatureFlagStore((s) => s.dailyPulse);
```

Change `router.replace('/(main)/pulse')` to:

```typescript
router.replace(dailyPulse ? '/(main)/pulse' : '/(main)/home');
```

- [ ] **Step 2: Update `power-ups.tsx` navigation target (same change)**

In `app/(onboarding)/power-ups.tsx`, add the same import and flag read, change `router.replace('/(main)/pulse')` to:

```typescript
router.replace(dailyPulse ? '/(main)/pulse' : '/(main)/home');
```

- [ ] **Step 3: Commit**

```bash
git add app/(onboarding)/life-context.tsx app/(onboarding)/power-ups.tsx
git commit -m "feat: route onboarding completion to Home tab when dailyPulse is off"
```

---

## Task 7: Build the Home Tab Screen

**Files:**
- Create: `src/constants/thai-proverbs.ts`
- Create: `src/i18n/en/home.json`
- Create: `src/i18n/th/home.json`
- Modify: `app/(main)/home/index.tsx` (replace placeholder from Task 3)

- [ ] **Step 1: Create Thai proverbs data**

```typescript
// src/constants/thai-proverbs.ts
export interface ThaiProverb {
  th: string;
  en: string;
  meaning: string;
  meaningTh: string;
}

export const THAI_PROVERBS: ThaiProverb[] = [
  { th: 'น้ำขึ้นให้รีบตัก', en: 'When the water rises, scoop quickly', meaning: 'Seize opportunity when it comes', meaningTh: 'คว้าโอกาสเมื่อมันมาถึง' },
  { th: 'ช้าๆ ได้พร้าเล่มงาม', en: 'Go slowly, get a beautiful axe', meaning: 'Patience yields the best results', meaningTh: 'ความอดทนให้ผลลัพธ์ที่ดีที่สุด' },
  { th: 'ฝนทั่งให้เป็นเข็ม', en: 'Grind an anvil into a needle', meaning: 'Persistence conquers all', meaningTh: 'ความพยายามเอาชนะทุกอย่าง' },
  { th: 'รู้จักเขา รู้จักเรา รบร้อยครั้ง ชนะร้อยครั้ง', en: 'Know them, know yourself — win a hundred battles', meaning: 'Self-awareness is the key to success', meaningTh: 'การรู้จักตัวเองคือกุญแจสู่ความสำเร็จ' },
  { th: 'อย่าชิงสุกก่อนห่าม', en: 'Don\'t pick the fruit before it\'s ripe', meaning: 'Don\'t rush — let things mature naturally', meaningTh: 'อย่ารีบร้อน ปล่อยให้สิ่งต่างๆ สุกงอมเอง' },
  { th: 'ตนเป็นที่พึ่งแห่งตน', en: 'Be your own refuge', meaning: 'True strength comes from within', meaningTh: 'ความเข้มแข็งที่แท้จริงมาจากภายใน' },
  { th: 'น้ำหยดลงหินทุกวัน หินมันยังกร่อน', en: 'Water dripping on stone every day — even stone erodes', meaning: 'Small consistent effort creates big change', meaningTh: 'ความพยายามเล็กๆ สม่ำเสมอสร้างการเปลี่ยนแปลงครั้งใหญ่' },
  { th: 'กว่าถั่วจะสุก งาก็ไหม้', en: 'By the time the beans cook, the sesame burns', meaning: 'Balance your priorities carefully', meaningTh: 'จัดลำดับความสำคัญอย่างระมัดระวัง' },
  { th: 'สิบปากว่า ไม่เท่าตาเห็น', en: 'Ten mouths telling is not equal to one eye seeing', meaning: 'Experience trumps hearsay', meaningTh: 'ประสบการณ์ตรงดีกว่าคำบอกเล่า' },
  { th: 'ทำดีได้ดี ทำชั่วได้ชั่ว', en: 'Do good, receive good. Do evil, receive evil', meaning: 'Your actions shape your destiny', meaningTh: 'การกระทำของคุณกำหนดชะตาชีวิต' },
  { th: 'ขี่ช้างจับตั๊กแตน', en: 'Riding an elephant to catch a grasshopper', meaning: 'Don\'t overthink simple problems', meaningTh: 'อย่าคิดมากกับปัญหาง่ายๆ' },
  { th: 'ปลาหมอตายเพราะปาก', en: 'The climbing perch dies because of its mouth', meaning: 'Careless words bring trouble', meaningTh: 'คำพูดสะเพร่านำปัญหามาให้' },
  { th: 'มีสลึงพึงบรรจบให้ครบบาท', en: 'With a quarter coin, strive to make a full baht', meaning: 'Save and build from what you have', meaningTh: 'เก็บออมและสร้างจากสิ่งที่มี' },
  { th: 'อย่านับเลขถ้าไก่ยังไม่ออก', en: 'Don\'t count the eggs before the hen lays', meaning: 'Don\'t assume outcomes prematurely', meaningTh: 'อย่าคาดหวังผลลัพธ์ก่อนเวลาอันควร' },
  { th: 'ไก่งามเพราะขน คนงามเพราะแต่ง', en: 'A chicken is beautiful for its feathers, a person for their grooming', meaning: 'Presentation matters', meaningTh: 'การนำเสนอสำคัญ' },
  { th: 'น้ำเชี่ยวอย่าขวางเรือ', en: 'Don\'t block the boat in swift water', meaning: 'Don\'t fight forces beyond your control', meaningTh: 'อย่าต่อสู้กับสิ่งที่ควบคุมไม่ได้' },
  { th: 'รักยาวให้บั่น รักสั้นให้ต่อ', en: 'For lasting love, trim it. For brief love, extend it', meaning: 'Know when to hold on and when to let go', meaningTh: 'รู้ว่าเมื่อไหร่ควรยึดมั่นและเมื่อไหร่ควรปล่อยวาง' },
  { th: 'อดเปรี้ยวไว้กินหวาน', en: 'Endure the sour to taste the sweet', meaning: 'Short-term sacrifice for long-term reward', meaningTh: 'เสียสละระยะสั้นเพื่อรางวัลระยะยาว' },
  { th: 'ผิดเป็นครู', en: 'Mistakes are teachers', meaning: 'Learn from every failure', meaningTh: 'เรียนรู้จากความล้มเหลวทุกครั้ง' },
  { th: 'ไม้อ่อนดัดง่าย ไม้แก่ดัดยาก', en: 'Young wood bends easily, old wood does not', meaning: 'Embrace change while you can', meaningTh: 'เปิดรับการเปลี่ยนแปลงขณะที่ยังทำได้' },
  { th: 'หนีเสือปะจระเข้', en: 'Flee from the tiger, meet the crocodile', meaning: 'Avoid jumping from one problem to another', meaningTh: 'หลีกเลี่ยงการกระโดดจากปัญหาหนึ่งไปยังอีกปัญหาหนึ่ง' },
  { th: 'คนตายขายคนเป็น', en: 'The dead sell out the living', meaning: 'Past mistakes can haunt the present', meaningTh: 'ความผิดพลาดในอดีตอาจหลอกหลอนปัจจุบัน' },
  { th: 'ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น', en: 'Where there is effort, there is success', meaning: 'Effort always leads to achievement', meaningTh: 'ความพยายามนำไปสู่ความสำเร็จเสมอ' },
  { th: 'จับปลาสองมือ', en: 'Catching fish with both hands', meaning: 'Don\'t try to do everything at once', meaningTh: 'อย่าพยายามทำทุกอย่างพร้อมกัน' },
  { th: 'ว่าแต่เขา อิเหนาเป็นเอง', en: 'Criticize others, become like them yourself', meaning: 'Be mindful of your own flaws before judging', meaningTh: 'ระวังข้อบกพร่องของตัวเองก่อนตัดสิน' },
  { th: 'น้ำใจเป็นสิ่งสำคัญ', en: 'A generous heart is what matters most', meaning: 'Kindness outweighs material wealth', meaningTh: 'ความเมตตามีค่ามากกว่าความร่ำรวย' },
  { th: 'เวลาเป็นเงินเป็นทอง', en: 'Time is silver and gold', meaning: 'Value every moment', meaningTh: 'ให้คุณค่ากับทุกช่วงเวลา' },
  { th: 'ไม่มีใครแก่เกินเรียน', en: 'No one is too old to learn', meaning: 'Growth never stops', meaningTh: 'การเติบโตไม่เคยหยุด' },
  { th: 'แพ้เป็นพระ ชนะเป็นมาร', en: 'To lose with grace is noble, to win with cruelty is demonic', meaning: 'How you handle defeat defines your character', meaningTh: 'วิธีที่คุณรับมือกับความพ่ายแพ้กำหนดบุคลิกของคุณ' },
  { th: 'เข้าเมืองตาหลิ่ว ต้องหลิ่วตาตาม', en: 'In the city of the squinting, squint along', meaning: 'Adapt to your environment', meaningTh: 'ปรับตัวเข้ากับสภาพแวดล้อม' },
];

/**
 * Get today's proverb — deterministic based on date string.
 * Same proverb for all users on the same day.
 */
export function getDailyProverb(dateStr: string): ThaiProverb {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % THAI_PROVERBS.length;
  return THAI_PROVERBS[index];
}
```

- [ ] **Step 2: Create Home tab translations**

```json
// src/i18n/en/home.json
{
  "greeting": {
    "morning": "Good morning",
    "afternoon": "Good afternoon",
    "evening": "Good evening"
  },
  "proverb": {
    "label": "THAI WISDOM",
    "attribution": "Thai proverb"
  },
  "actions": {
    "askOracle": "Ask the Oracle",
    "askOracleDesc": "Chat with your AI companion",
    "drawStick": "Draw Wisdom Stick",
    "drawStickDesc": "Traditional Thai Siam Si"
  },
  "culture": {
    "siamSiTitle": "ABOUT SIAM SI",
    "siamSiBody": "เซียมซี (Siam Si) is a centuries-old Thai temple tradition where seekers draw numbered bamboo sticks for guidance. Each of the 28 sticks carries a poetic name and meaning rooted in Buddhist wisdom. Visitors shake a bamboo cylinder until one stick rises above the rest — their message for the day.",
    "mordooTitle": "THAI WISDOM TRADITIONS",
    "mordooBody": "Mor Doo (หมอดู) means \"seer\" or \"one who sees\" in Thai. For centuries, communities across Thailand have sought guidance from wise counselors who blend intuition, tradition, and deep understanding of human nature. This app brings that tradition into the modern world through AI-powered conversations and authentic cultural experiences."
  }
}
```

```json
// src/i18n/th/home.json
{
  "greeting": {
    "morning": "สวัสดีตอนเช้า",
    "afternoon": "สวัสดีตอนบ่าย",
    "evening": "สวัสดีตอนเย็น"
  },
  "proverb": {
    "label": "ภูมิปัญญาไทย",
    "attribution": "สุภาษิตไทย"
  },
  "actions": {
    "askOracle": "ถามหมอดู",
    "askOracleDesc": "สนทนากับ AI ของคุณ",
    "drawStick": "เสี่ยงเซียมซี",
    "drawStickDesc": "ประเพณีไทยดั้งเดิม"
  },
  "culture": {
    "siamSiTitle": "เกี่ยวกับเซียมซี",
    "siamSiBody": "เซียมซีเป็นประเพณีไทยที่สืบทอดมาหลายร้อยปี ผู้ศรัทธาจะเขย่ากระบอกไม้ไผ่จนไม้ก้านหนึ่งโผล่ขึ้นมา แต่ละก้านจากทั้งหมด 28 ก้านมีชื่อเชิงกวีและความหมายที่หยั่งรากในพุทธปัญญา",
    "mordooTitle": "ภูมิปัญญาไทย",
    "mordooBody": "หมอดูหมายถึง \"ผู้เห็น\" หรือ \"ผู้รู้\" ในภาษาไทย เป็นเวลาหลายศตวรรษที่ชุมชนทั่วประเทศไทยแสวงหาคำแนะนำจากผู้รู้ที่ผสมผสานสัญชาตญาณ ประเพณี และความเข้าใจอย่างลึกซึ้งเกี่ยวกับธรรมชาติของมนุษย์ แอปนี้นำประเพณีนั้นมาสู่โลกสมัยใหม่"
  }
}
```

- [ ] **Step 3: Register home translations in i18n config**

Find the i18n initialization file and add `'home'` to the namespace list. (Check `src/i18n/index.ts` — add `home` to the `ns` array and import the JSON files.)

- [ ] **Step 4: Build the full Home screen**

Replace `app/(main)/home/index.tsx` with:

```typescript
// app/(main)/home/index.tsx
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/src/components/ui/Text';
import { OracleHeartIcon, BambooIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { getDailyProverb } from '@/src/constants/thai-proverbs';
import { fetchUserProfile } from '@/src/services/profile';
import { useAuthStore } from '@/src/stores/authStore';
import { lightHaptic } from '@/src/utils/haptics';

function getGreetingKey(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation('home');
  const userId = useAuthStore((s) => s.userId);
  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: fetchUserProfile,
    enabled: !!userId,
  });

  const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const displayDate = today.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const proverb = getDailyProverb(dateStr);
  const firstName = profile?.fullName?.split(' ')[0] ?? '';
  const greeting = t(`greeting.${getGreetingKey()}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {greeting}{firstName ? `, ${firstName}` : ''}
          </Text>
          <Text style={styles.date}>{displayDate}</Text>
        </View>

        {/* Daily Proverb */}
        <View style={styles.proverbCard}>
          <Text style={styles.proverbLabel}>{t('proverb.label')}</Text>
          <Text style={styles.proverbTh}>{proverb.th}</Text>
          <Text style={styles.proverbEn}>"{proverb.en}"</Text>
          <Text style={styles.proverbMeaning}>
            {i18n.language === 'th' ? proverb.meaningTh : proverb.meaning}
          </Text>
          <Text style={styles.proverbAttribution}>— {t('proverb.attribution')}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.7 }]}
            onPress={() => { lightHaptic(); router.push('/(main)/oracle'); }}
          >
            <OracleHeartIcon size={28} color={colors.gold.DEFAULT} />
            <Text style={styles.actionTitle}>{t('actions.askOracle')}</Text>
            <Text style={styles.actionDesc}>{t('actions.askOracleDesc')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.7 }]}
            onPress={() => { lightHaptic(); router.push('/(main)/oracle/siam-si'); }}
          >
            <BambooIcon size={28} color={colors.gold.DEFAULT} />
            <Text style={styles.actionTitle}>{t('actions.drawStick')}</Text>
            <Text style={styles.actionDesc}>{t('actions.drawStickDesc')}</Text>
          </Pressable>
        </View>

        {/* Cultural Education */}
        <View style={styles.cultureSection}>
          <Text style={styles.cultureTitle}>{t('culture.siamSiTitle')}</Text>
          <Text style={styles.cultureBody}>{t('culture.siamSiBody')}</Text>
        </View>

        <View style={styles.cultureSection}>
          <Text style={styles.cultureTitle}>{t('culture.mordooTitle')}</Text>
          <Text style={styles.cultureBody}>{t('culture.mordooBody')}</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontFamily: fonts.display.bold,
    fontSize: 28,
    color: colors.onSurface,
    letterSpacing: 1,
  },
  date: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  proverbCard: {
    backgroundColor: colors.surface.containerLow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.20)',
    padding: 24,
    marginBottom: 24,
    gap: 8,
  },
  proverbLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  proverbTh: {
    fontFamily: fonts.thai.medium,
    fontSize: fontSizes.xl,
    color: colors.gold.light,
    lineHeight: 32,
  },
  proverbEn: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    fontStyle: 'italic',
    color: colors.onSurface,
    lineHeight: 24,
  },
  proverbMeaning: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  proverbAttribution: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.xs,
    color: colors.outline,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface.containerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionTitle: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.sm,
    color: colors.gold.light,
    letterSpacing: 1,
    textAlign: 'center',
  },
  actionDesc: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.xs,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cultureSection: {
    marginBottom: 24,
    gap: 8,
  },
  cultureTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
  },
  cultureBody: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 120,
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add src/constants/thai-proverbs.ts src/i18n/en/home.json src/i18n/th/home.json app/(main)/home/index.tsx
git commit -m "feat: build Home tab with Thai proverbs, quick actions, and cultural content"
```

---

## Task 8: Oracle API — Conditionally Strip Zodiac from System Prompt

**Files:**
- Modify: `api/src/app/api/oracle/chat/route.ts`

- [ ] **Step 1: Add a flag constant at the top of the file**

After the imports, add:

```typescript
// Toggle after App Store approval — re-enables zodiac references in Oracle responses
const ENABLE_ZODIAC_REFERENCES = false;
```

- [ ] **Step 2: Modify `buildSystemPrompt` to conditionally include zodiac context**

Change the context-building block (lines 29–46) from:

```typescript
    const zodiac = getZodiacSign(month, day);
    const element = getElement(month);
    const chineseZodiac = getChineseZodiac(date.getFullYear());

    context = `
The seeker's birth data:
- Date of birth: ${birthData.dateOfBirth}
- Name: ${birthData.fullName || 'Unknown'}
- Western zodiac: ${zodiac}
- Element: ${element}
- Chinese zodiac: ${chineseZodiac}
- Life concerns: ${birthData.concerns.join(', ') || 'general guidance'}
`;
```

To:

```typescript
    context = `
The seeker's birth data:
- Date of birth: ${birthData.dateOfBirth}
- Name: ${birthData.fullName || 'Unknown'}`;

    if (ENABLE_ZODIAC_REFERENCES) {
      const zodiac = getZodiacSign(month, day);
      const element = getElement(month);
      const chineseZodiac = getChineseZodiac(date.getFullYear());
      context += `
- Western zodiac: ${zodiac}
- Element: ${element}
- Chinese zodiac: ${chineseZodiac}`;
    }

    context += `
- Life concerns: ${birthData.concerns.join(', ') || 'general guidance'}
`;
```

- [ ] **Step 3: Modify the system prompt personality when zodiac is off**

Change the system prompt string (line 54) from:

```typescript
  return `You are Mor Doo (หมอดู), a mystical Thai astrologer who blends Thai, Chinese, and Western astrology into deeply personal readings. You speak with ancient wisdom but in accessible modern language.

Your personality:
- Warm, mysterious, and insightful
- You reference specific astrological positions relevant to the seeker's question
- You blend Thai astrology (วันเกิด), Chinese zodiac, and Western zodiac naturally
```

To:

```typescript
  const persona = ENABLE_ZODIAC_REFERENCES
    ? `You are Mor Doo (หมอดู), a mystical Thai astrologer who blends Thai, Chinese, and Western astrology into deeply personal readings. You speak with ancient wisdom but in accessible modern language.

Your personality:
- Warm, mysterious, and insightful
- You reference specific astrological positions relevant to the seeker's question
- You blend Thai astrology (วันเกิด), Chinese zodiac, and Western zodiac naturally`
    : `You are Mor Doo (หมอดู), a wise Thai counselor and AI companion for self-reflection. You speak with warmth, insight, and clarity rooted in Thai wisdom traditions.

Your personality:
- Warm, perceptive, and thoughtful
- You offer practical guidance grounded in the seeker's personal context
- You draw on Thai cultural wisdom and universal human insight`;

  return `${persona}
```

The rest of the system prompt (response length, formatting rules, language instruction) stays unchanged.

- [ ] **Step 4: Commit**

```bash
git add api/src/app/api/oracle/chat/route.ts
git commit -m "feat: conditionally strip zodiac references from Oracle system prompt"
```

---

## Task 9: Update Paywall and Settings Translations

**Files:**
- Modify: `src/i18n/en/paywall.json`
- Modify: `src/i18n/th/paywall.json`
- Modify: `src/i18n/en/settings.json`
- Modify: `src/i18n/th/settings.json`
- Modify: `src/i18n/en/common.json`
- Modify: `src/i18n/th/common.json`
- Modify: `src/components/Paywall.tsx`

- [ ] **Step 1: Update English paywall translations**

In `src/i18n/en/paywall.json`, change:

```json
"tarot": "All tarot spreads unlocked"
```
to:
```json
"tarot": "Premium insights unlocked"
```

Change:
```json
"title": "You've used your daily reading",
```
to:
```json
"title": "You've reached today's limit",
```

Change:
```json
"comeBack": "Your next free reading is available tomorrow."
```
to:
```json
"comeBack": "Your next free session is available tomorrow."
```

- [ ] **Step 2: Update Thai paywall translations**

In `src/i18n/th/paywall.json`, change:

```json
"tarot": "ไพ่ทาโร่ทุกรูปแบบ"
```
to:
```json
"tarot": "ฟีเจอร์พรีเมียมทั้งหมด"
```

Change:
```json
"title": "คุณใช้สิทธิ์ดูดวงประจำวันแล้ว",
```
to:
```json
"title": "คุณถึงขีดจำกัดของวันนี้แล้ว",
```

Change:
```json
"comeBack": "การดูดวงฟรีครั้งต่อไปจะพร้อมใช้ในวันพรุ่งนี้"
```
to:
```json
"comeBack": "สิทธิ์ฟรีครั้งต่อไปจะพร้อมใช้ในวันพรุ่งนี้"
```

- [ ] **Step 3: Update English settings translations**

In `src/i18n/en/settings.json`, change:

```json
"notificationTimeDescription": "When should we send your daily reading reminder?",
```
to:
```json
"notificationTimeDescription": "When should we send your daily reminder?",
```

- [ ] **Step 4: Update Thai settings translations**

In `src/i18n/th/settings.json`, change:

```json
"notificationTimeDescription": "คุณต้องการให้แจ้งเตือนดวงประจำวันเมื่อไหร่?",
```
to:
```json
"notificationTimeDescription": "คุณต้องการให้แจ้งเตือนประจำวันเมื่อไหร่?",
```

- [ ] **Step 5: Update English common.json notification prompt**

In `src/i18n/en/common.json`, change the `notificationPrompt` object:

```json
"title": "Your Daily Cosmic Reading Awaits",
"description": "Get your Prana Index, lucky elements, and daily insight delivered every morning.",
```
to:
```json
"title": "Your Daily Insight Awaits",
"description": "Get your personalized daily insight delivered every morning.",
```

- [ ] **Step 6: Update Thai common.json notification prompt**

In `src/i18n/th/common.json`, update the equivalent `notificationPrompt` translations to match (remove references to "ดวง", "Prana Index", and "lucky elements").

- [ ] **Step 7: Commit**

```bash
git add src/i18n/en/paywall.json src/i18n/th/paywall.json src/i18n/en/settings.json src/i18n/th/settings.json src/i18n/en/common.json src/i18n/th/common.json
git commit -m "fix: reword horoscope-adjacent language in paywall, settings, and notification translations"
```

---

## Task 10: Update Siri Shortcuts

**Files:**
- Modify: `src/utils/siri-shortcuts.ts`

- [ ] **Step 1: Update shortcut titles and phrases**

Replace the entire file:

```typescript
// src/utils/siri-shortcuts.ts
import { donateShortcut } from 'react-native-siri-shortcut';
import { Platform } from 'react-native';

export function donatePulseShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'app.mordoo.oracle.dailyInsight',
    title: 'View Daily Insight',
    suggestedInvocationPhrase: 'Show my daily insight',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateSiamSiShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'app.mordoo.oracle.siamSi',
    title: 'Draw Wisdom Stick',
    suggestedInvocationPhrase: 'Draw a wisdom stick',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateOracleShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'app.mordoo.oracle.askOracle',
    title: 'Ask Mor Doo',
    suggestedInvocationPhrase: 'Ask Mor Doo',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/siri-shortcuts.ts
git commit -m "fix: update Siri shortcut titles and activity types for new bundle ID"
```

---

## Task 11: Update App Store Metadata

**Files:**
- Modify: `fastlane/metadata/en-US/name.txt`
- Modify: `fastlane/metadata/en-US/subtitle.txt`
- Modify: `fastlane/metadata/en-US/keywords.txt`
- Modify: `fastlane/metadata/en-US/description.txt`
- Modify: `fastlane/metadata/en-US/promotional_text.txt`
- Modify: `fastlane/metadata/review_information/notes.txt`

- [ ] **Step 1: Update name**

Write to `fastlane/metadata/en-US/name.txt`:
```
Mor Doo - AI Companion
```

- [ ] **Step 2: Update subtitle**

Write to `fastlane/metadata/en-US/subtitle.txt`:
```
Thai Culture & Self-Reflection
```

- [ ] **Step 3: Update keywords**

Write to `fastlane/metadata/en-US/keywords.txt`:
```
AI companion,self-reflection,Thai culture,wisdom,Siam Si,mindfulness,guidance,insight,meditation
```

- [ ] **Step 4: Update description**

Write to `fastlane/metadata/en-US/description.txt` the review-safe description from the spec (the full text from Phase 3).

- [ ] **Step 5: Update promotional text**

Write to `fastlane/metadata/en-US/promotional_text.txt`:
```
AI self-reflection meets Thai wisdom. Siam Si wisdom sticks, a conversational AI companion, and home screen widgets — now with Siri support.
```

- [ ] **Step 6: Update reviewer notes**

Write to `fastlane/metadata/review_information/notes.txt` the reviewer notes from the spec (the full text from Phase 3).

- [ ] **Step 7: Commit**

```bash
git add fastlane/metadata/
git commit -m "docs: update App Store metadata for review-safe resubmission"
```

---

## Task 12: Generate New App Icon and Splash Image

**Files:**
- Modify: `assets/icon.png` (1024x1024)
- Modify: `assets/splash-icon.png`
- Modify: `assets/android-icon-foreground.png` (if needed)

This task requires using an AI image generation tool.

- [ ] **Step 1: Generate new app icon**

Use the `ai-image-generation` skill or Gemini CLI to generate a new 1024x1024 app icon. Direction:
- **Theme:** Thai temple / lotus / wisdom — NOT zodiac, stars, or celestial
- **Style:** Dark background (#0a0a14), gold accent (#c9a84c), minimalist
- **Concept options:** A stylized lotus flower, a Thai temple silhouette, bamboo sticks (Siam Si), or an abstract "wisdom eye"
- **Must avoid:** Stars, zodiac symbols, celestial/astrology imagery, crystal balls, tarot cards

Save as `assets/icon.png` (1024x1024 PNG).

- [ ] **Step 2: Generate new splash image**

Same visual direction as the icon. Simpler/more abstract version suitable for splash screen.

Save as `assets/splash-icon.png`.

- [ ] **Step 3: Update Android adaptive icon if needed**

Update `assets/android-icon-foreground.png` to match the new icon.

- [ ] **Step 4: Commit**

```bash
git add assets/icon.png assets/splash-icon.png assets/android-icon-foreground.png
git commit -m "art: new app icon and splash — Thai cultural theme, no zodiac imagery"
```

---

## Task 13: Update app.json for New Bundle ID (Manual)

This task involves manual steps in Apple Developer portal and EAS.

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Register new App ID**

In Apple Developer portal → Identifiers → Register new App ID: `app.mordoo.oracle`

- [ ] **Step 2: Create new App Store Connect record**

In App Store Connect → My Apps → New App:
- Name: "Mor Doo - AI Companion"
- Bundle ID: `app.mordoo.oracle`
- SKU: `mordoo-oracle-2026`

- [ ] **Step 3: Create new EAS project**

```bash
cd /Users/kesar/projects/mordoo-app
# First update app.json bundle ID, then:
eas init
```

- [ ] **Step 4: Update `app.json`**

Change:
```json
"ios": {
  "bundleIdentifier": "ai.mordoo.app",
  "buildNumber": "30",
```
To:
```json
"ios": {
  "bundleIdentifier": "app.mordoo.oracle",
  "buildNumber": "1",
```

Change `android.package` to `app.mordoo.oracle` (or keep unchanged if Android wasn't rejected).

Update `extra.eas.projectId` to the new project ID from `eas init`.

Reset `ios.buildNumber` to `"1"` and `android.versionCode` to `1`.

- [ ] **Step 5: Update Sentry DSN if needed**

If creating a new Sentry project, update `EXPO_PUBLIC_SENTRY_DSN` in `.env.local` and EAS secrets.

- [ ] **Step 6: Configure RevenueCat**

In RevenueCat dashboard → add new iOS app with bundle ID `app.mordoo.oracle`. Same products/entitlements. Update API key in `EXPO_PUBLIC_REVENUECAT_IOS_KEY` if changed.

- [ ] **Step 7: Commit**

```bash
git add app.json
git commit -m "chore: update bundle ID and EAS project for new App Store listing"
```

---

## Task 14: Final Audit — Grep for Forbidden Words

- [ ] **Step 1: Grep all user-facing strings for horoscope-adjacent words**

```bash
# Search all translation files and UI code for dangerous keywords
grep -ri "zodiac\|horoscope\|astrology\|fortune\|daily reading\|lucky\|prana\|numerology\|celestial\|cosmic\|tarot" \
  src/i18n/ \
  src/components/ \
  app/ \
  --include="*.json" --include="*.tsx" --include="*.ts" \
  -l
```

Review each hit. For translation files: ensure dangerous words are only in keys controlled by feature flags (e.g., pulse translations are only shown when `dailyPulse` is on). For component files: ensure gated by feature flags.

- [ ] **Step 2: Check onboarding translations**

Review `src/i18n/en/onboarding.json` for flagged words. Key issues:
- `"Your Celestial Foundation"` → change to `"Your Personal Profile"`
- `"cosmic blueprint"` → change to `"personal profile"`
- `"Your Cosmic Signature"` → change to `"Your Profile Details"`
- `"numerological significance"` → change to `"personal significance"`
- `"cosmic ledger"` → change to `"your profile"`
- `"cosmic readings"` → change to `"deeper insights"`
- `"planetary positions"` → change to `"personalized insights"`
- `"energy score and cosmic alerts"` → change to `"daily insight"`
- `"Mercury in Scorpio"` / `"Sun in Leo"` in insightPlaceholder → this is in soul-snapshot which is skipped, but clean it up anyway

Apply same changes to Thai translations in `src/i18n/th/onboarding.json`.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/
git commit -m "fix: remove all horoscope-adjacent language from user-facing translations"
```

---

## Task 15: Typecheck and Smoke Test

- [ ] **Step 1: Run mobile typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 2: Run API typecheck**

```bash
cd api && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all pass

- [ ] **Step 4: Start dev server and verify Home tab appears**

```bash
npm start
```

Open in simulator. Verify:
- Home tab shows instead of Pulse tab
- Home screen shows greeting, proverb, quick actions, cultural content
- Oracle tab works normally
- Siam Si opens without fortune labels
- Profile shows without zodiac cards
- Paywall shows updated text

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve typecheck and UI issues from feature flag integration"
```
