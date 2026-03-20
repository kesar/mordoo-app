import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Text as RNText, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/Text';
import { ProgressIndicator } from '@/src/components/ui/ProgressIndicator';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useAuthStore } from '@/src/stores/authStore';
import { signInWithApple, signInWithGoogle } from '@/src/services/auth';

export default function SoulGate() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const setLanguage = useOnboardingStore((s) => s.setLanguage);
  const setGuestAuth = useAuthStore((s) => s.setGuestAuth);
  const [loading, setLoading] = useState(false);

  const selectLanguage = (lang: 'en' | 'th') => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

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

  const handleGuestContinue = () => {
    setGuestAuth();
    router.push('/(onboarding)/birth-data');
  };

  const selectedLang = i18n.language as 'en' | 'th';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Ambient background blobs */}
      <View style={styles.blobTopRight} pointerEvents="none" />
      <View style={styles.blobBottomLeft} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <View style={styles.progressWrapper}>
          <ProgressIndicator
            currentStep={1}
            totalSteps={3}
            label="Step 1: Initiation"
          />
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Sacred Geometry Emblem */}
          <View style={styles.emblemOuterRing}>
            <View style={styles.emblemContainer}>
              <Text style={styles.emblemDiamond}>◆</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>MOR DOO</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Choose your language to begin.</Text>

          {/* Language Selection */}
          <View style={styles.languageRow}>
            <Pressable
              style={[
                styles.langCard,
                selectedLang === 'th' && styles.langCardActive,
              ]}
              onPress={() => selectLanguage('th')}
            >
              <View style={styles.flagBadge}><RNText style={styles.flagBadgeText}>TH</RNText></View>
              <Text style={styles.langLabelThai}>ไทย</Text>
            </Pressable>

            <Pressable
              style={[
                styles.langCard,
                selectedLang === 'en' && styles.langCardActive,
              ]}
              onPress={() => selectLanguage('en')}
            >
              <View style={styles.flagBadge}><RNText style={styles.flagBadgeText}>EN</RNText></View>
              <Text style={styles.langLabelEnglish}>ENGLISH</Text>
            </Pressable>
          </View>

          {/* Gold Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerSparkle}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* CTA Buttons */}
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerSparkle}>✦</Text>
          <Text style={styles.footerText}>The Soul Gate</Text>
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

  // Ambient blobs
  blobTopRight: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 350,
    height: 350,
    borderRadius: 9999,
    backgroundColor: colors.gold.DEFAULT,
    opacity: 0.05,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 9999,
    backgroundColor: colors.gold.DEFAULT,
    opacity: 0.05,
  },

  // Scroll container
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },

  // Progress
  progressWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },

  // Main content block
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 24,
  },

  // Sacred emblem
  emblemOuterRing: {
    width: 148,
    height: 148,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(201, 168, 76, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.surface.containerLowest,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  emblemDiamond: {
    fontSize: 48,
    color: colors.gold.DEFAULT,
    lineHeight: 56,
  },

  // Title
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 42,
    color: colors.gold.light,
    letterSpacing: 6,
    textAlign: 'center',
  },

  // Subtitle
  subtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.xl,
    color: colors.parchment.DEFAULT,
    fontStyle: 'italic',
    opacity: 0.9,
    textAlign: 'center',
  },

  // Language row
  languageRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  langCard: {
    flex: 1,
    minWidth: 150,
    aspectRatio: 3 / 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 2,
    borderColor: colors.gold.border,
    borderRadius: 12,
    gap: 8,
  },
  langCardActive: {
    borderColor: colors.gold.DEFAULT,
    backgroundColor: colors.surface.containerHighest,
  },
  langFlag: {
    fontSize: 36,
    lineHeight: 44,
  },
  flagBadge: {
    width: 56,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBadgeText: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    color: colors.gold.light,
    letterSpacing: 2,
  },
  langLabelThai: {
    fontFamily: fonts.thai.regular,
    fontSize: 22,
    color: colors.onSurface,
  },
  langLabelEnglish: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.sm,
    letterSpacing: 3,
    color: colors.onSurface,
  },

  // Gold divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.5)',
  },
  dividerSparkle: {
    fontSize: fontSizes.sm,
    color: colors.gold.DEFAULT,
  },

  // CTA section
  ctaSection: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerSparkle: {
    fontSize: 12,
    color: 'rgba(201, 168, 76, 0.6)',
  },
  footerText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: 'rgba(201, 168, 76, 0.6)',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
});
