import { useState } from 'react';
import { View, StyleSheet, Switch, Alert, ScrollView, ActivityIndicator, Pressable, Modal, FlatList } from 'react-native';
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
import { deleteAccount } from '@/src/services/account';
import { fetchUserProfile } from '@/src/services/profile';
import { lightHaptic } from '@/src/utils/haptics';
import { Paywall } from '@/src/components/Paywall';
import { useSubscription } from '@/src/hooks/useSubscription';
import { features } from '@/src/config/features';
import {
  getExpoPushToken,
  updateNotificationPreferences,
  registerPushToken,
  getTimezone,
} from '@/src/services/notifications';

const TIMES = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, '0');
  const m = String((i % 4) * 15).padStart(2, '0');
  return `${h}:${m}`;
});

export default function ProfileScreen() {
  const { t } = useTranslation('settings');
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const notificationTime = useSettingsStore((s) => s.notificationTime);
  const setNotificationTime = useSettingsStore((s) => s.setNotificationTime);

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: fetchUserProfile,
    enabled: !!userId,
  });

  const handleLanguageToggle = async () => {
    lightHaptic();
    const newLang = language === 'en' ? 'th' : 'en';
    setLanguage(newLang);
    if (notificationsEnabled) {
      try {
        await updateNotificationPreferences(true, undefined, newLang);
      } catch {
        // Language sync failed silently — will retry on next change
      }
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    lightHaptic();
    const previousValue = notificationsEnabled;
    setNotificationsEnabled(value); // optimistic update

    try {
      if (value) {
        const token = await getExpoPushToken();
        if (!token) {
          setNotificationsEnabled(previousValue); // rollback
          Alert.alert(
            t('notifications'),
            t('notificationsDenied'),
          );
          return;
        }
        await registerPushToken(token, getTimezone(), language);
      } else {
        await updateNotificationPreferences(false);
      }
    } catch {
      setNotificationsEnabled(previousValue); // rollback on failure
      Alert.alert(t('common:errors.generic'));
    }
  };

  const [showPaywall, setShowPaywall] = useState(false);
  const { isPremium, refreshStatus } = useSubscription();

  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = async (time: string) => {
    lightHaptic();
    setNotificationTime(time);
    setShowTimePicker(false);
    try {
      await updateNotificationPreferences(true, time);
    } catch {
      // Time update failed silently — will retry on next change
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteConfirmTitle'),
      t('deleteConfirmMessage'),
      [
        { text: t('deleteConfirmCancel'), style: 'cancel' },
        {
          text: t('deleteConfirmOk'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              useAuthStore.getState().logout();
              router.replace('/');
              Alert.alert(t('deleteSuccess'));
            } catch {
              Alert.alert(t('deleteError'));
            }
          },
        },
      ],
    );
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
          {notificationsEnabled && (
            <>
              <View style={styles.separator} />
              <Pressable
                style={styles.settingsRow}
                onPress={() => { lightHaptic(); setShowTimePicker(true); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsLabel}>{t('notificationTime')}</Text>
                  <Text style={styles.settingsDescription}>{t('notificationTimeDescription')}</Text>
                </View>
                <Text style={styles.settingsValue}>{formatTime(notificationTime)}</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>{t('account')}</Text>
        <View style={styles.settingsGroup}>
          <Pressable style={styles.settingsRow} onPress={handleSignOut}>
            <Text style={styles.signOutText}>{t('signOut')}</Text>
          </Pressable>
        </View>

        {/* Delete account — intentionally subtle and separated */}
        <Pressable style={styles.deleteRow} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>{t('deleteAccount')}</Text>
        </Pressable>
      </ScrollView>

      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        source="profile"
        onSubscribed={() => {
          refreshStatus();
          refetch();
        }}
      />

      <Modal visible={showTimePicker} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{t('notificationTime')}</Text>
            <FlatList
              data={TIMES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.timeOption,
                    item === notificationTime && styles.timeOptionActive,
                  ]}
                  onPress={() => handleTimeChange(item)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      item === notificationTime && styles.timeOptionTextActive,
                    ]}
                  >
                    {formatTime(item)}
                  </Text>
                </Pressable>
              )}
              initialScrollIndex={TIMES.indexOf(notificationTime)}
              getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
            />
          </View>
        </Pressable>
      </Modal>
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
  deleteRow: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  deleteText: {
    color: colors.outline,
    fontSize: fontSizes.xs,
  },
  settingsDescription: {
    color: colors.outline,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.night.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    padding: 20,
  },
  modalTitle: {
    color: colors.parchment.DEFAULT,
    fontSize: fontSizes.lg,
    fontFamily: fonts.body.semibold,
    textAlign: 'center',
    marginBottom: 16,
  },
  timeOption: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  timeOptionActive: {
    backgroundColor: colors.gold.muted,
  },
  timeOptionText: {
    color: colors.parchment.DEFAULT,
    fontSize: fontSizes.base,
  },
  timeOptionTextActive: {
    color: colors.gold.DEFAULT,
    fontFamily: fonts.body.semibold,
  },
});
