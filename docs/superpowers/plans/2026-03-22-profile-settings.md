# Profile & Settings Screen Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Profile tab to the main tab bar showing user profile info and settings (language, notifications, sign out).

**Architecture:** New `profile` route group under `app/(main)/` with a single screen. Profile data fetched from Supabase via a service function + React Query hook. Settings use the existing `settingsStore`. Language change synced to i18n.

**Tech Stack:** React Native, Expo Router, Zustand, React Query, Supabase, i18next, react-native-svg

---

## Chunk 1: Foundation (Icons, Translations, Store Fix)

### Task 1: Add ProfileIcon to TarotIcons

**Files:**
- Modify: `src/components/icons/TarotIcons.tsx`

- [ ] **Step 1: Add ProfileIcon component**

Add to the end of `src/components/icons/TarotIcons.tsx`, before the closing of the file:

```typescript
export function ProfileIcon({ size = 24, color = colors.gold.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8} r={4} />
      <Path d="M20 21c0-3.87-3.58-7-8-7s-8 3.13-8 7" />
    </Svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/icons/TarotIcons.tsx
git commit -m "feat: add ProfileIcon to TarotIcons"
```

---

### Task 2: Add translation files and register namespace

**Files:**
- Create: `src/i18n/en/settings.json`
- Create: `src/i18n/th/settings.json`
- Modify: `src/i18n/en/common.json`
- Modify: `src/i18n/th/common.json`
- Modify: `src/i18n/index.ts`

- [ ] **Step 1: Create English settings translations**

Create `src/i18n/en/settings.json`:

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

- [ ] **Step 2: Create Thai settings translations**

Create `src/i18n/th/settings.json`:

```json
{
  "profile": "โปรไฟล์",
  "preferences": "การตั้งค่า",
  "language": "ภาษา",
  "languageEnglish": "English",
  "languageThai": "ไทย",
  "notifications": "การแจ้งเตือน",
  "account": "บัญชี",
  "signOut": "ออกจากระบบ",
  "signOutConfirmTitle": "ออกจากระบบ",
  "signOutConfirmMessage": "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
  "signOutConfirmCancel": "ยกเลิก",
  "signOutConfirmOk": "ออกจากระบบ"
}
```

- [ ] **Step 3: Add tabs.profile to common.json files**

In `src/i18n/en/common.json`, add to the `tabs` object:

```json
"profile": "Profile"
```

In `src/i18n/th/common.json`, add to the `tabs` object:

```json
"profile": "โปรไฟล์"
```

- [ ] **Step 4: Register settings namespace in i18n/index.ts**

Add imports at the top of `src/i18n/index.ts`:

```typescript
import enSettings from './en/settings.json';
import thSettings from './th/settings.json';
```

Update the `ns` array:

```typescript
ns: ['common', 'onboarding', 'pulse', 'oracle', 'settings'],
```

Add to the `resources` object:

```typescript
en: {
  // ...existing
  settings: enSettings,
},
th: {
  // ...existing
  settings: thSettings,
},
```

- [ ] **Step 5: Commit**

```bash
git add src/i18n/
git commit -m "feat: add settings translations and profile tab label"
```

---

### Task 3: Fix settingsStore to sync language with i18n

**Files:**
- Modify: `src/stores/settingsStore.ts`

- [ ] **Step 1: Update setLanguage to call i18n.changeLanguage**

In `src/stores/settingsStore.ts`, add import at top:

```typescript
import i18n from '@/src/i18n';
```

Update the `setLanguage` function:

```typescript
setLanguage: (language) => {
  i18n.changeLanguage(language);
  set({ language });
},
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/settingsStore.ts
git commit -m "feat: sync settingsStore language change with i18n"
```

---

## Chunk 2: Profile Service

### Task 4: Create profile service to fetch user data

**Files:**
- Create: `src/services/profile.ts`

- [ ] **Step 1: Create the profile service**

Note: `full_name` is stored in the `birth_data` table (set during onboarding via `syncBirthData`), not in `profiles`. We query `birth_data` directly since it has all the display fields we need.

Create `src/services/profile.ts`:

```typescript
import { supabase } from '@/src/lib/supabase';

export interface UserProfile {
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('birth_data')
    .select('full_name, date_of_birth, gender')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;

  return {
    fullName: data?.full_name ?? null,
    dateOfBirth: data?.date_of_birth ?? null,
    gender: data?.gender ?? null,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/profile.ts
git commit -m "feat: add profile service to fetch user data from Supabase"
```

---

## Chunk 3: Profile Screen & Tab Integration

### Task 5: Create profile route group layout

**Files:**
- Create: `app/(main)/profile/_layout.tsx`

- [ ] **Step 1: Create the stack layout**

Create `app/(main)/profile/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { colors } from '@/src/constants/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.night.DEFAULT },
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(main)/profile/_layout.tsx
git commit -m "feat: add profile route group layout"
```

---

### Task 6: Create profile screen

**Files:**
- Create: `app/(main)/profile/index.tsx`

- [ ] **Step 1: Build the full profile screen**

Create `app/(main)/profile/index.tsx`:

```typescript
import { View, StyleSheet, Switch, Alert, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { useAuthStore } from '@/src/stores/authStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { signOut } from '@/src/services/auth';
import { fetchUserProfile } from '@/src/services/profile';
import { lightHaptic } from '@/src/utils/haptics';

export default function ProfileScreen() {
  const { t } = useTranslation('settings');
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: fetchUserProfile,
    enabled: !!userId,
  });

  const handleLanguageToggle = () => {
    lightHaptic();
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  const handleNotificationsToggle = (value: boolean) => {
    lightHaptic();
    setNotificationsEnabled(value);
  };

  const handleSignOut = () => {
    Alert.alert(
      t('signOutConfirmTitle'),
      t('signOutConfirmMessage'),
      [
        { text: t('signOutConfirmCancel'), style: 'cancel' },
        {
          text: t('signOutConfirmOk'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              useAuthStore.getState().logout();
              router.replace('/');
            } catch {
              Alert.alert(
                t('common:errors.generic'),
                '',
                [{ text: t('common:actions.done') }],
              );
            }
          },
        },
      ],
    );
  };

  const initial = profile?.fullName?.charAt(0)?.toUpperCase() ?? '?';
  const displayName = profile?.fullName ?? '—';
  const birthDate = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {isLoading ? (
            <ActivityIndicator color={colors.gold.DEFAULT} />
          ) : error ? (
            <Pressable onPress={() => refetch()}>
              <Text style={styles.errorText}>{t('common:errors.generic')}</Text>
              <Text style={styles.retryText}>{t('common:actions.retry')}</Text>
            </Pressable>
          ) : (
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.displayName}>{displayName}</Text>
                {birthDate && <Text style={styles.birthDate}>{birthDate}</Text>}
              </View>
            </View>
          )}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>{t('preferences')}</Text>
        <View style={styles.settingsGroup}>
          <Pressable style={styles.settingsRow} onPress={handleLanguageToggle}>
            <Text style={styles.settingsLabel}>{t('language')}</Text>
            <Text style={styles.settingsValue}>
              {language === 'en' ? t('languageEnglish') : t('languageThai')}
            </Text>
          </Pressable>
          <View style={styles.separator} />
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>{t('notifications')}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.night.card, true: colors.gold.DEFAULT }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>{t('account')}</Text>
        <View style={styles.settingsGroup}>
          <Pressable style={styles.settingsRow} onPress={handleSignOut}>
            <Text style={styles.signOutText}>{t('signOut')}</Text>
          </Pressable>
        </View>
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
    padding: 20,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: colors.night.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold.muted,
    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.gold.DEFAULT,
    fontSize: 22,
    fontFamily: fonts.display.bold,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    color: colors.parchment.DEFAULT,
    fontSize: fontSizes.lg,
    fontFamily: fonts.body.semibold,
  },
  birthDate: {
    color: colors.outline,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  retryText: {
    color: colors.gold.DEFAULT,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionLabel: {
    color: colors.outline,
    fontSize: fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: colors.night.surface,
    borderRadius: 16,
    marginBottom: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.night.elevated,
    marginHorizontal: 16,
  },
  settingsLabel: {
    color: colors.parchment.DEFAULT,
    fontSize: fontSizes.sm,
  },
  settingsValue: {
    color: colors.outline,
    fontSize: fontSizes.sm,
  },
  signOutText: {
    color: colors.energy.low,
    fontSize: fontSizes.sm,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(main)/profile/index.tsx
git commit -m "feat: create profile & settings screen"
```

---

### Task 7: Add Profile tab to main layout

**Files:**
- Modify: `app/(main)/_layout.tsx`

- [ ] **Step 1: Update imports**

In `app/(main)/_layout.tsx`, update the import from TarotIcons to include `ProfileIcon`:

```typescript
import { StarIcon, OracleHeartIcon, ProfileIcon } from '@/src/components/icons/TarotIcons';
```

- [ ] **Step 2: Reduce tab bar horizontal padding for 3 tabs**

In the `tabBarStyle` object, change `paddingHorizontal` from 48 to 24:

```typescript
paddingHorizontal: 24,
```

- [ ] **Step 3: Add Profile tab screen**

Add a new `Tabs.Screen` after the oracle tab:

```typescript
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
```

- [ ] **Step 4: Update TabIcon component**

Add the `profile` branch to the `TabIcon` function:

```typescript
function TabIcon({ name, color }: { name: string; color: string; focused: boolean }) {
  const size = 22;
  const icon =
    name === 'pulse' ? (
      <StarIcon size={size} color={color} />
    ) : name === 'oracle' ? (
      <OracleHeartIcon size={size} color={color} />
    ) : name === 'profile' ? (
      <ProfileIcon size={size} color={color} />
    ) : null;
  return <View style={tabStyles.iconWrap}>{icon}</View>;
}
```

- [ ] **Step 5: Commit**

```bash
git add app/(main)/_layout.tsx
git commit -m "feat: add Profile tab to main tab bar"
```

---

### Task 8: Verify in simulator

- [ ] **Step 1: Start the dev server and check**

```bash
npm start
```

Open on iOS simulator or device. Verify:
1. Profile tab appears as 3rd tab with user icon
2. Tapping shows the profile screen with user name and birth date
3. Language toggle switches between EN/TH and entire app re-renders
4. Notifications toggle works
5. Sign Out shows confirmation, then logs out and redirects to onboarding
6. Tab labels translate correctly when language changes
