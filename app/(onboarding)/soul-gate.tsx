import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { Text } from '@/src/components/ui/Text';
import { SparkleIcon } from '@/src/components/icons/TarotIcons';
import { ProgressIndicator } from '@/src/components/ui/ProgressIndicator';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { signInWithApple, signInWithGoogle } from '@/src/services/auth';
import { features } from '@/src/config/features';

export default function SoulGate() {
  const router = useRouter();
  const { t, i18n } = useTranslation('onboarding');
  const setLanguage = useOnboardingStore((s) => s.setLanguage);
  const [loading, setLoading] = useState(false);

  // Diamond pulse animation
  const diamondScale = useSharedValue(1);
  const diamondGlow = useSharedValue(0.4);

  useEffect(() => {
    diamondScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    diamondGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const diamondAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: diamondScale.value }],
    opacity: diamondGlow.value,
  }));

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
            label={t('soulGate.step')}
          />
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Sacred Geometry Emblem */}
          <Animated.View
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.emblemOuterRing}
          >
            <Animated.View style={[styles.emblemContainer, diamondAnimStyle]}>
              <Image
                source={require('@/assets/images/tarot/emblem-soul-gate.webp')}
                style={styles.emblemImage}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInUp.duration(800).delay(500)}>
            <Text style={styles.title}>MOR DOO</Text>
          </Animated.View>

          {/* Language Selection */}
          <Animated.View
            entering={FadeIn.duration(600).delay(800)}
            style={styles.languageRow}
          >
            <Pressable
              style={[
                styles.langCard,
                selectedLang === 'th' && styles.langCardActive,
              ]}
              onPress={() => selectLanguage('th')}
            >
              <Image source={{ uri: 'https://flagcdn.com/w160/th.png' }} style={styles.flagImage} />
              <Text style={styles.langLabelThai}>ไทย</Text>
            </Pressable>

            <Pressable
              style={[
                styles.langCard,
                selectedLang === 'en' && styles.langCardActive,
              ]}
              onPress={() => selectLanguage('en')}
            >
              <Image source={{ uri: 'https://flagcdn.com/w160/gb.png' }} style={styles.flagImage} />
              <Text style={styles.langLabelEnglish}>ENGLISH</Text>
            </Pressable>
          </Animated.View>

          {/* Gold Divider */}
          <Animated.View
            entering={FadeIn.duration(600).delay(1000)}
            style={styles.dividerRow}
          >
            <View style={styles.dividerLine} />
            <SparkleIcon size={14} color={colors.gold.DEFAULT} />
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* CTA Buttons */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(1100)}
            style={styles.ctaSection}
          >
            {loading ? (
              <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
            ) : (
              <>
                <GoldButton
                  title={t('soulGate.continueWithPhone')}
                  onPress={handlePhoneAuth}
                  variant="filled"
                  fullWidth
                />
                {features.appleSignIn && Platform.OS === 'ios' && (
                  <GoldButton
                    title={t('soulGate.continueWithApple')}
                    onPress={handleAppleAuth}
                    variant="outlined"
                    fullWidth
                  />
                )}
                {features.googleSignIn && (
                  <GoldButton
                    title={t('soulGate.continueWithGoogle')}
                    onPress={handleGoogleAuth}
                    variant="outlined"
                    fullWidth
                  />
                )}
              </>
            )}
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View
          entering={FadeIn.duration(600).delay(1300)}
          style={styles.footer}
        >
          <SparkleIcon size={12} color="rgba(201, 168, 76, 0.6)" />
          <Text style={styles.footerText}>{t('soulGate.footer')}</Text>
        </Animated.View>
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
  emblemImage: {
    width: 96,
    height: 96,
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
  flagImage: {
    width: 64,
    height: 43,
    borderRadius: 6,
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
  footerText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: 'rgba(201, 168, 76, 0.6)',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
});
