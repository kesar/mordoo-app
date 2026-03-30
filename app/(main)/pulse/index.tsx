import { useEffect, useRef, useState } from 'react';
import { Animated, View, ScrollView, StyleSheet, ActivityIndicator, Easing, Pressable } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { PulseShareCard } from '@/src/components/sharing/PulseShareCard';
import { useShareCard } from '@/src/hooks/useShareCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { EnergyScoreRing } from '@/src/components/ui/EnergyScoreRing';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { useTranslation } from 'react-i18next';
import { useDailyPulse } from '@/src/hooks/useDailyPulse';
import { useRatingPrompt } from '@/src/hooks/useRatingPrompt';
import { RatingPrompt } from '@/src/components/RatingPrompt';
import { NotificationPrompt } from '@/src/components/NotificationPrompt';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { incrementPulseView } from '@/src/services/rating';
import { features } from '@/src/config/features';
import { analytics } from '@/src/services/analytics';
import {
  SparkleIcon,
  BusinessStarIcon,
  HeartIcon,
  BodyDiamondIcon,
  ArrowRightIcon,
} from '@/src/components/icons/TarotIcons';
import DailyPulseWidget from '@/src/widgets/DailyPulseWidget';
import { donatePulseShortcut } from '@/src/utils/siri-shortcuts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Static constellation data (decorative) ─────────────────────────────────

const STARS = [
  { x: 40, y: 60, r: 1.5 },
  { x: 80, y: 30, r: 1 },
  { x: 130, y: 80, r: 2 },
  { x: 170, y: 45, r: 1.5 },
  { x: 210, y: 90, r: 1 },
  { x: 260, y: 55, r: 2.5 },
  { x: 300, y: 110, r: 1 },
  { x: 340, y: 70, r: 1.5 },
  { x: 55, y: 140, r: 1 },
  { x: 100, y: 170, r: 2 },
  { x: 150, y: 130, r: 1 },
  { x: 200, y: 160, r: 1.5 },
  { x: 250, y: 120, r: 1 },
  { x: 310, y: 150, r: 2 },
  { x: 360, y: 130, r: 1 },
  { x: 30, y: 220, r: 1.5 },
  { x: 90, y: 250, r: 1 },
  { x: 160, y: 230, r: 2 },
  { x: 230, y: 210, r: 1 },
  { x: 290, y: 240, r: 1.5 },
  { x: 350, y: 200, r: 1 },
  { x: 70, y: 310, r: 1.5 },
  { x: 140, y: 320, r: 1 },
  { x: 220, y: 300, r: 2 },
  { x: 300, y: 330, r: 1 },
  { x: 370, y: 290, r: 1.5 },
];

const LINES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [2, 9], [9, 10], [10, 11], [11, 13],
  [15, 16], [16, 17], [17, 18], [18, 19],
];

// ─── Screen ───────────────────────────────────────────────────────────────────

// ─── Twinkling star component ─────────────────────────────────────────────────

function TwinklingStar({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const opacity = useRef(new Animated.Value(0.4 + Math.random() * 0.4)).current;

  useEffect(() => {
    const duration = 2000 + Math.random() * 3000;
    const delay = Math.random() * 2000;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.15 + Math.random() * 0.3,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.6 + Math.random() * 0.4,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <AnimatedCircle cx={cx} cy={cy} r={r} fill={colors.gold.light} opacity={opacity} />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PulseScreen() {
  const { t, i18n } = useTranslation('pulse');
  const { data: pulse, isLoading, error, refetch } = useDailyPulse();
  const { viewShotRef, shareCard, isSharing } = useShareCard();
  const { ratingPromptVisible, showRatingPrompt, closeRatingPrompt } = useRatingPrompt();
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const notificationPromptShown = useSettingsStore((s) => s.notificationPromptShown);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  // Track pulse views and check rating prompt after data loads
  const hasTrackedRef = useRef(false);
  useEffect(() => {
    if (pulse && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      incrementPulseView();
      analytics.track('pulse_viewed', {
        energy_score: pulse.energyScore,
        date: pulse.date,
      });
      if (features.ratingPrompt) {
        showRatingPrompt(1500);
      }
      // Show notification prompt on first pulse view (if not already enabled/shown)
      if (!notificationsEnabled && !notificationPromptShown) {
        setTimeout(() => setShowNotifPrompt(true), 2500);
      }
    }
  }, [pulse, showRatingPrompt, notificationsEnabled, notificationPromptShown]);

  // Push latest pulse data to the home screen widget
  useEffect(() => {
    if (pulse) {
      DailyPulseWidget.updateSnapshot({
        energyScore: pulse.energyScore,
        luckyNumber: pulse.luckyNumber,
        luckyColorName: pulse.luckyColor.name,
        luckyColorHex: pulse.luckyColor.hex,
        insight: pulse.insight,
        direction: pulse.luckyDirection,
      });
    }
  }, [pulse]);

  // Donate Siri Shortcut when pulse data is available
  useEffect(() => {
    if (pulse) donatePulseShortcut();
  }, [pulse]);

  // Slow vertical drift for constellation background
  const driftY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(driftY, {
          toValue: -12,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftY, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [driftY]);

  const today = new Date();
  const locale = i18n.language === 'th' ? 'th-TH' : 'en-US';
  const dateStr = today.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  return (
    <SafeAreaView style={styles.scrollView} edges={['top']}>
      {/* Star constellation background */}
      <Animated.View style={[styles.starMapBackground, { transform: [{ translateY: driftY }] }]}>
        <View style={styles.glowBlob} />
        <Svg
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
        >
          {LINES.map(([a, b], i) => (
            <Line
              key={`line-${i}`}
              x1={STARS[a].x} y1={STARS[a].y}
              x2={STARS[b].x} y2={STARS[b].y}
              stroke={colors.gold.light}
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}
          {STARS.map((star, i) => (
            <TwinklingStar key={`star-${i}`} cx={star.x} cy={star.y} r={star.r} />
          ))}
        </Svg>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header text */}
        <View style={styles.headerSection}>
          <Text style={styles.starMapLocation}>{t('header')}</Text>
          <Text style={styles.starMapDate}>{dateStr}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <SparkleIcon size={12} color={colors.onSurfaceVariant} />
            <Text style={styles.starMapMoon}>{t('pranaIndex')}</Text>
          </View>
        </View>

        {/* Dynamic Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingRingPlaceholder}>
              <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
            </View>
            <Text style={styles.loadingText}>{t('loading.title')}</Text>
            <Text style={styles.loadingSubText}>{t('loading.subtitle')}</Text>
          </View>
        ) : error && !pulse ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('error.title')}</Text>
            <GoldButton title={t('common:actions.retry')} onPress={() => refetch()} variant="outlined" />
          </View>
        ) : pulse ? (
          <>
            {/* Energy Score */}
            <View style={styles.energyScoreWrapper}>
              <View style={styles.energyScoreCard}>
                <EnergyScoreRing score={pulse.energyScore} size={192} label={t('pranaLabel')} />
                <Text style={styles.insightText}>{pulse.insight}</Text>
              </View>
            </View>

            {/* Lucky Elements Grid */}
            <View style={styles.luckyElementsSection}>
              <View style={styles.luckyGrid}>
                <View style={styles.luckyCard}>
                  <Text style={styles.luckyCardLabel}>{t('luckyElements.color')}</Text>
                  <View style={styles.luckyCardContent}>
                    <View style={[styles.luckyColorCircle, { backgroundColor: pulse.luckyColor.hex }]} />
                  </View>
                  <Text style={styles.luckyCardValue}>{pulse.luckyColor.name}</Text>
                </View>

                <View style={styles.luckyCard}>
                  <Text style={styles.luckyCardLabel}>{t('luckyElements.number')}</Text>
                  <View style={styles.luckyCardContent}>
                    <Text style={styles.luckyNumber}>{pulse.luckyNumber}</Text>
                  </View>
                  <Text style={styles.luckyCardValue}>{t('luckyElements.numberLabel')}</Text>
                </View>

                <View style={styles.luckyCard}>
                  <Text style={styles.luckyCardLabel}>{t('luckyElements.direction')}</Text>
                  <View style={styles.luckyCardContent}>
                    <ArrowRightIcon size={28} color={colors.gold.DEFAULT} />
                  </View>
                  <Text style={styles.luckyCardValue} numberOfLines={1} adjustsFontSizeToFit>{pulse.luckyDirection}</Text>
                </View>
              </View>
            </View>

            {/* Sub-Scores */}
            <View style={styles.subScoresSection}>
              <SubScoreBar Icon={BusinessStarIcon} label={t('subScores.business')} value={pulse.subScores.business} color={colors.elements.fire} />
              <SubScoreBar Icon={HeartIcon} label={t('subScores.heart')} value={pulse.subScores.heart} color="#ec4899" />
              <SubScoreBar Icon={BodyDiamondIcon} label={t('subScores.body')} value={pulse.subScores.body} color={colors.elements.wood} />
            </View>

            {/* Share Button */}
            <View style={styles.shareSection}>
              <Pressable
                style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  analytics.track('share_tapped', { content_type: 'pulse' });
                  shareCard(t('share.message', { score: pulse.energyScore }), 'pulse');
                }}
                disabled={isSharing}
              >
                <Text style={styles.shareBtnText}>
                  {isSharing ? '...' : t('share.button')}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Off-screen share card */}
      {pulse && (
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, width: 1080, height: 1350 }}
          style={styles.offScreen}
        >
          <PulseShareCard
            pulse={pulse}
            dateStr={dateStr}
            lang={i18n.language as 'en' | 'th'}
            energyScoreLabel={t('energyScore')}
            subScoreLabels={{
              business: t('subScores.business'),
              heart: t('subScores.heart'),
              body: t('subScores.body'),
            }}
            luckyLabels={{
              color: t('luckyElements.color'),
              number: t('luckyElements.number'),
              direction: t('luckyElements.direction'),
            }}
          />
        </ViewShot>
      )}
      <RatingPrompt visible={ratingPromptVisible} onClose={closeRatingPrompt} />
      <NotificationPrompt
        visible={showNotifPrompt}
        onClose={() => setShowNotifPrompt(false)}
      />
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubScoreBar({ Icon, label, value, color }: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value, widthAnim]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.subScoreRow}>
      <Icon size={16} color={color} />
      <Text style={styles.subScoreLabel}>{label}</Text>
      <View style={styles.subScoreBarTrack}>
        <Animated.View style={[styles.subScoreBarFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={styles.subScoreValue}>{value}%</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Star Map Background
  starMapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 256,
    height: 256,
    borderRadius: 9999,
    backgroundColor: colors.gold.DEFAULT,
    opacity: 0.1,
  },

  // Header
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  starMapLocation: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  starMapDate: {
    fontFamily: fonts.display.bold,
    fontSize: 28,
    color: colors.onSurface,
    letterSpacing: 3,
    marginBottom: 6,
  },
  starMapMoon: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Loading / Error
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingRingPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.gold.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.base,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loadingSubText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 20,
  },
  errorText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.lg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Energy Score
  energyScoreWrapper: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  energyScoreCard: {
    backgroundColor: 'rgba(41, 41, 52, 0.80)',
    borderRadius: 9999,
    paddingHorizontal: 32,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: colors.night.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  insightText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: 20,
    maxWidth: 260,
    lineHeight: 20,
  },

  // Lucky Elements
  luckyElementsSection: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  luckyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  luckyCard: {
    flex: 1,
    backgroundColor: colors.surface.containerLow,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 70, 55, 0.3)',
    alignItems: 'center',
    gap: 4,
  },
  luckyCardLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 8,
    color: colors.gold.DEFAULT,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    height: 22,
  },
  luckyCardContent: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luckyColorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  luckyNumber: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes['4xl'],
    color: colors.gold.light,
  },
  luckyCardValue: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: 'auto',
  },

  // Sub-Scores
  subScoresSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    gap: 16,
  },
  subScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subScoreLabel: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    width: 64,
  },
  subScoreBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  subScoreBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  subScoreValue: {
    fontFamily: fonts.body.semibold,
    fontSize: fontSizes.sm,
    color: colors.gold.light,
    width: 36,
    textAlign: 'right',
  },

  // Bottom padding
  bottomPadding: {
    height: 120,
  },

  // Share
  shareSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold.muted,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.gold.border,
  },
  shareBtnText: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    color: colors.gold.light,
    letterSpacing: 3,
  },
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
});
