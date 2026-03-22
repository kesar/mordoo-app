import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { ProgressIndicator } from '@/src/components/ui/ProgressIndicator';
import { SacredCard } from '@/src/components/ui/SacredCard';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { TopAppBar } from '@/src/components/ui/TopAppBar';
import { useOnboardingStore, Concern } from '@/src/stores/onboardingStore';

const CONCERNS: { concern: Concern; image: number }[] = [
  { concern: 'love', image: require('@/assets/images/tarot/concern-love.webp') },
  { concern: 'career', image: require('@/assets/images/tarot/concern-career.webp') },
  { concern: 'money', image: require('@/assets/images/tarot/concern-money.webp') },
  { concern: 'health', image: require('@/assets/images/tarot/concern-health.webp') },
  { concern: 'family', image: require('@/assets/images/tarot/concern-family.webp') },
  { concern: 'spiritual', image: require('@/assets/images/tarot/concern-spiritual.webp') },
];

export default function LifeContext() {
  const { t } = useTranslation('onboarding');
  const setConcerns = useOnboardingStore((s) => s.setConcerns);
  const setUrgencyContext = useOnboardingStore((s) => s.setUrgencyContext);
  const setStep = useOnboardingStore((s) => s.setStep);

  const [selectedConcerns, setSelectedConcerns] = useState<Concern[]>([]);
  const [urgency, setUrgency] = useState('');

  const toggleConcern = (concern: Concern) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern],
    );
  };

  const handleContinue = () => {
    setConcerns(selectedConcerns);
    setUrgencyContext(urgency || null);
    setStep(5);
    router.push('/(onboarding)/power-ups');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TopAppBar showBackButton onBackPress={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressWrapper}>
          <ProgressIndicator
            currentStep={4}
            totalSteps={6}
            label={t('lifeContext.step')}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('lifeContext.title')}</Text>
          <Text style={styles.subtitle}>
            {t('lifeContext.subtitle')}
          </Text>
        </View>

        {/* Concern Chips */}
        <SacredCard variant="low" style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>{t('lifeContext.forcesLabel')}</Text>
          </View>
          <View style={styles.chipsGrid}>
            {CONCERNS.map(({ concern, image }) => {
              const isActive = selectedConcerns.includes(concern);
              return (
                <TouchableOpacity
                  key={concern}
                  style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                  onPress={() => toggleConcern(concern)}
                  activeOpacity={0.75}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={t(`lifeContext.concerns.${concern}`)}
                >
                  <Image source={image} style={styles.chipImage} resizeMode="contain" />
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                    {t(`lifeContext.concerns.${concern}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SacredCard>

        {/* Urgency Context */}
        <SacredCard variant="high" style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>{t('lifeContext.whisperLabel')}</Text>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder={t('lifeContext.whisperPlaceholder')}
            placeholderTextColor={colors.outlineVariant}
            value={urgency}
            onChangeText={setUrgency}
            textAlignVertical="top"
          />
        </SacredCard>

        {/* CTA */}
        <View style={styles.ctaWrapper}>
          <GoldButton
            title={t('lifeContext.cta')}
            onPress={handleContinue}
            variant="filled"
            fullWidth
            rounded
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>{t('lifeContext.footer')}</Text>
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
    gap: 24,
  },
  progressWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  // Header
  header: {
    alignItems: 'center',
    gap: 10,
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
  },

  // Cards
  card: {
    gap: 16,
  },
  cardLabelRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gold.border,
    paddingBottom: 10,
  },
  cardLabel: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.xs,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Chips grid
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 6,
  },
  chipInactive: {
    backgroundColor: colors.surface.containerHigh,
    borderColor: 'rgba(77, 70, 55, 0.4)',
  },
  chipActive: {
    backgroundColor: colors.gold.muted,
    borderColor: colors.gold.DEFAULT,
  },
  chipImage: {
    width: 40,
    height: 40,
  },
  chipLabel: {
    fontFamily: fonts.body.medium,
    fontSize: fontSizes.sm,
    color: colors.onSurface,
    textAlign: 'center',
  },
  chipLabelActive: {
    color: colors.gold.light,
  },

  // Text input
  textInput: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.lg,
    color: colors.onSurface,
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingHorizontal: 0,
  },

  // CTA
  ctaWrapper: {
    marginTop: 8,
  },

  // Footer
  footer: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.xs,
    color: colors.gold.DEFAULT,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
  },
});
