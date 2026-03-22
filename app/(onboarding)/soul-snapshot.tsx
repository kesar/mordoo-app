import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import {
  BusinessStarIcon,
  HeartIcon,
  BodyDiamondIcon,
  QuoteIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@/src/components/icons/TarotIcons';
import { EnergyScoreRing } from '@/src/components/ui/EnergyScoreRing';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

const SUB_SCORES = [
  { Icon: BusinessStarIcon, key: 'business', value: 78 },
  { Icon: HeartIcon, key: 'heart', value: 45 },
  { Icon: BodyDiamondIcon, key: 'body', value: 91 },
] as const;

export default function SoulSnapshot() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const { width } = useWindowDimensions();

  const handleEnterRealms = () => {
    completeOnboarding();
    router.replace('/(main)/pulse');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Ambient background blobs */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeftIcon size={24} color={colors.gold.DEFAULT} />
          </Pressable>
          <Text style={styles.navTitle}>{t('soulSnapshot.navTitle')}</Text>
        </View>

        {/* Soul Snapshot Card */}
        <View style={[styles.card, { width: Math.min(width - 32, 400) }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.ascensionLabel}>{t('soulSnapshot.ascensionLabel')}</Text>
            <Text style={styles.cardTitle}>{t('soulSnapshot.title')}</Text>
          </View>

          {/* Energy Score Ring */}
          <View style={styles.ringContainer}>
            <EnergyScoreRing score={73} size={208} label={t('soulSnapshot.energyScore')} />
          </View>

          {/* Sub-Score Bars */}
          <View style={styles.subScoresRow}>
            {SUB_SCORES.map((item) => (
              <View key={item.key} style={styles.subScoreCol}>
                <item.Icon size={16} color={colors.gold.DEFAULT} />
                <Text style={styles.subScoreLabel}>{t(`soulSnapshot.${item.key}`)}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${item.value}%` as `${number}%` }]}
                  />
                </View>
                <Text style={styles.subScoreValue}>{item.value}%</Text>
              </View>
            ))}
          </View>

          {/* Primary Insight */}
          <View style={styles.insightCard}>
            <View style={styles.quoteIconWrap}>
              <QuoteIcon size={22} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.insightText}>
              {t('soulSnapshot.insightPlaceholder')}
            </Text>
          </View>

          {/* Lucky Elements */}
          <View style={styles.luckyRow}>
            <View style={styles.luckyCell}>
              <View style={styles.luckyCellTop}>
                <View style={styles.luckyColorCircle} />
              </View>
              <Text style={styles.luckyCellLabel}>{t('soulSnapshot.luckyColor')}</Text>
            </View>
            <View style={styles.luckyCell}>
              <View style={styles.luckyCellTop}>
                <Text style={styles.luckyNumber}>8</Text>
              </View>
              <Text style={styles.luckyCellLabel}>{t('soulSnapshot.luckyNumber')}</Text>
            </View>
            <View style={styles.luckyCell}>
              <View style={styles.luckyCellTop}>
                <ArrowRightIcon size={22} color={colors.gold.DEFAULT} />
              </View>
              <Text style={styles.luckyCellLabel}>{t('soulSnapshot.luckyDirection')}</Text>
            </View>
          </View>

          {/* Daily Ritual */}
          <View style={styles.dailyRitualWrap}>
            <Text style={styles.dailyRitualHeading}>{t('soulSnapshot.dailyRitual')}</Text>
            <Text style={styles.dailyRitualText}>
              {t('soulSnapshot.dailyRitualText')}
            </Text>
          </View>

          {/* Footer Actions */}
          <View style={styles.footerActions}>
            <GoldButton
              title={t('soulSnapshot.enterRealms')}
              onPress={handleEnterRealms}
              style={styles.enterButton}
            />
          </View>
        </View>

        {/* Step Pagination */}
        <View style={styles.paginationWrap}>
          <Text style={styles.stepLabel}>{t('soulSnapshot.stepLabel')}</Text>
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
            <View style={styles.dotActive} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },

  // Background blobs
  blob: {
    position: 'absolute',
    width: 384,
    height: 384,
    borderRadius: 9999,
    backgroundColor: 'rgba(201,168,76,0.10)',
  },
  blobTopLeft: {
    top: -120,
    left: -120,
  },
  blobBottomRight: {
    bottom: -120,
    right: -120,
  },

  // Scroll
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 48,
    paddingTop: 0,
  },

  // Top nav
  topNav: {
    height: 56,
    width: '100%',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navTitle: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.xl,
    color: colors.gold.DEFAULT,
    letterSpacing: 4,
  },

  // Card
  card: {
    backgroundColor: 'rgba(13,13,23,0.90)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.20)',
    padding: 32,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.9,
    shadowRadius: 100,
    elevation: 24,
    marginHorizontal: 16,
  },

  // Card header
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  ascensionLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: 'rgba(201,168,76,0.80)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: fonts.display.regular,
    fontSize: 32,
    color: colors.gold.light,
    lineHeight: 40,
  },

  // Ring
  ringContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  // Sub-score bars
  subScoresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  subScoreCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  subScoreLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  barTrack: {
    width: '100%',
    height: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.gold.DEFAULT,
  },
  subScoreValue: {
    fontFamily: fonts.body.semibold,
    fontSize: 12,
    color: colors.gold.light,
  },

  // Insight card
  insightCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 24,
    marginBottom: 20,
    position: 'relative',
  },
  quoteIconWrap: {
    position: 'absolute',
    top: -12,
    left: 16,
    backgroundColor: colors.surface.containerLowest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  insightText: {
    fontFamily: fonts.body.regular,
    fontSize: 18,
    fontStyle: 'italic',
    color: colors.onSurface,
    lineHeight: 28,
  },

  // Lucky elements
  luckyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  luckyCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  luckyCellTop: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  luckyColorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold.DEFAULT,
  },
  luckyNumber: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes['2xl'],
    color: colors.gold.light,
    lineHeight: 28,
  },
  luckyCellLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Daily ritual
  dailyRitualWrap: {
    marginBottom: 24,
    gap: 6,
  },
  dailyRitualHeading: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: 'rgba(201,168,76,0.50)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dailyRitualText: {
    fontFamily: fonts.body.semibold,
    fontSize: 15,
    color: 'rgba(228,225,240,0.90)',
    lineHeight: 22,
  },

  // Footer actions
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  enterButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    paddingVertical: 0,
    shadowColor: colors.gold.light,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },

  // Pagination
  paginationWrap: {
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  stepLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: 'rgba(201,168,76,0.40)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  dotActive: {
    width: 40,
    height: 10,
    borderRadius: 9999,
    backgroundColor: colors.gold.DEFAULT,
    shadowColor: colors.gold.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
});
