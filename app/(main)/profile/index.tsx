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
    color: colors.error,
    fontSize: fontSizes.sm,
  },
});
