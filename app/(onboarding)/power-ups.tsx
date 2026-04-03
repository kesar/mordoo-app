import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getExpoPushToken, registerPushToken, getTimezone } from '@/src/services/notifications';
import { useSettingsStore } from '@/src/stores/settingsStore';

import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { ProgressIndicator } from '@/src/components/ui/ProgressIndicator';
import { SacredCard } from '@/src/components/ui/SacredCard';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { TopAppBar } from '@/src/components/ui/TopAppBar';
import { CheckIcon } from '@/src/components/icons/TarotIcons';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { analytics } from '@/src/services/analytics';
import { useFeatureFlagStore } from '@/src/stores/featureFlagStore';

export default function PowerUps() {
  const { t } = useTranslation('onboarding');
  const setStep = useOnboardingStore((s) => s.setStep);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const dailyPulse = useFeatureFlagStore((s) => s.dailyPulse);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notifToggle, setNotifToggle] = useState(false);
  const language = useSettingsStore((s) => s.language);
  const storeSetNotifications = useSettingsStore((s) => s.setNotificationsEnabled);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleContinue = () => {
    analytics.track('onboarding_completed');
    setStep(6);
    completeOnboarding();
    router.replace(dailyPulse ? '/(main)/pulse' : '/(main)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TopAppBar showBackButton onBackPress={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View style={styles.progressWrapper}>
          <ProgressIndicator
            currentStep={5}
            totalSteps={6}
            label={t('powerUps.step')}
          />
        </View>

        {/* Header */}
        <View style={styles.headerWrapper}>
          <Text style={styles.title}>{t('powerUps.title')}</Text>
          <Text style={styles.subtitle}>
            {t('powerUps.subtitle')}
          </Text>
        </View>

        {/* Permission cards */}
        <View style={styles.cardsWrapper}>
          {/* Location card */}
          <SacredCard variant="low">
            <Image
              source={require('@/assets/images/tarot/powerup-location.webp')}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>{t('powerUps.location.title')}</Text>
            <Text style={styles.cardDescription}>
              {t('powerUps.location.description')}
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  locationEnabled ? styles.toggleButtonActive : styles.toggleButtonInactive,
                ]}
                onPress={() => setLocationEnabled((v) => !v)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    locationEnabled ? styles.toggleTextActive : styles.toggleTextInactive,
                  ]}
                >
                  {locationEnabled ? t('powerUps.enabled') : t('powerUps.enable')}
                </Text>
              </TouchableOpacity>
            </View>
          </SacredCard>

          {/* Notifications card */}
          <SacredCard variant="high">
            <Image
              source={require('@/assets/images/tarot/powerup-notifications.webp')}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>{t('powerUps.notifications.title')}</Text>
            <Text style={styles.cardDescription}>
              {t('powerUps.notifications.description')}
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  notifToggle ? styles.toggleButtonActive : styles.toggleButtonInactive,
                ]}
                onPress={async () => {
                  if (notifToggle) {
                    setNotifToggle(false);
                    storeSetNotifications(false);
                    return;
                  }
                  if (isRequesting) return;
                  setIsRequesting(true);
                  try {
                    const token = await getExpoPushToken();
                    if (!token) {
                      analytics.track('notification_permission_result', { granted: false });
                      Alert.alert(
                        t('powerUps.notifications.denied'),
                        t('powerUps.notifications.deniedMessage'),
                      );
                      setIsRequesting(false);
                      return;
                    }
                    setNotifToggle(true);
                    storeSetNotifications(true);
                    analytics.track('notification_permission_result', { granted: true });
                    await registerPushToken(token, getTimezone(), language);
                  } catch (error) {
                    console.error('Failed to register push token:', error);
                    setNotifToggle(true); // permission was granted even if API call failed
                  } finally {
                    setIsRequesting(false);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    notifToggle ? styles.toggleTextActive : styles.toggleTextInactive,
                  ]}
                >
                  {notifToggle ? t('powerUps.enabled') : t('powerUps.enable')}
                </Text>
              </TouchableOpacity>
            </View>
          </SacredCard>
        </View>

        {/* Info note */}
        <Text style={styles.infoNote}>
          {t('powerUps.infoNote')}
        </Text>

        {/* CTA */}
        <View style={styles.ctaWrapper}>
          <GoldButton
            title={t('powerUps.cta')}
            onPress={handleContinue}
            variant="filled"
            fullWidth
            rounded
          />
          <GoldButton
            title={t('powerUps.skip')}
            onPress={handleContinue}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 32,
  },

  // Progress
  progressWrapper: {
    alignItems: 'center',
    paddingTop: 8,
  },

  // Header
  headerWrapper: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
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

  // Cards
  cardsWrapper: {
    gap: 16,
  },
  cardImage: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.base,
    color: colors.gold.DEFAULT,
    letterSpacing: 2,
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999,
    borderWidth: 1,
  },
  toggleButtonActive: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.gold.border,
  },
  toggleText: {
    fontFamily: fonts.body.medium,
    fontSize: fontSizes.sm,
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: colors.onPrimary,
  },
  toggleTextInactive: {
    color: colors.gold.light,
  },

  // Info note
  infoNote: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: 'rgba(208, 197, 178, 0.6)', // onSurfaceVariant at 60%
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  // CTA
  ctaWrapper: {
    gap: 8,
    alignItems: 'stretch',
  },
});
