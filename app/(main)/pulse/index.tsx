import { useEffect, useRef } from 'react';
import { Animated, View, ScrollView, StyleSheet, Text as RNText, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { EnergyScoreRing } from '@/src/components/ui/EnergyScoreRing';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { useDailyPulse } from '@/src/hooks/useDailyPulse';

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

export default function PulseScreen() {
  const { data: pulse, isLoading, error, refetch } = useDailyPulse();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  return (
    <SafeAreaView style={styles.scrollView} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Star Map Header */}
        <View style={styles.starMapContainer}>
          <View style={styles.glowBlob} />
          <Svg
            width="100%"
            height={400}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
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
              <Circle
                key={`star-${i}`}
                cx={star.x} cy={star.y} r={star.r}
                fill={colors.gold.light}
                opacity={0.7}
              />
            ))}
          </Svg>
          <View style={styles.starMapTextOverlay}>
            <Text style={styles.starMapLocation}>YOUR DAILY READING</Text>
            <Text style={styles.starMapDate}>{dateStr}</Text>
            <Text style={styles.starMapMoon}>✦ PRANA INDEX</Text>
          </View>
        </View>

        {/* 2. Dynamic Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingRingPlaceholder}>
              <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
            </View>
            <Text style={styles.loadingText}>Reading the stars...</Text>
            <Text style={styles.loadingSubText}>Aligning your cosmic energies</Text>
          </View>
        ) : error && !pulse ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Could not read your pulse today</Text>
            <GoldButton title="Try Again" onPress={() => refetch()} variant="outlined" />
          </View>
        ) : pulse ? (
          <>
            {/* Energy Score */}
            <View style={styles.energyScoreWrapper}>
              <View style={styles.energyScoreCard}>
                <EnergyScoreRing score={pulse.energyScore} size={192} label="Prana Index" />
                <Text style={styles.insightText}>{pulse.insight}</Text>
              </View>
            </View>

            {/* Lucky Elements Grid */}
            <View style={styles.luckyElementsSection}>
              <View style={styles.luckyGrid}>
                <View style={styles.luckyCard}>
                  <Text style={styles.luckyCardLabel}>LUCKY COLOR</Text>
                  <View style={styles.luckyCardContent}>
                    <View style={[styles.luckyColorCircle, { backgroundColor: pulse.luckyColor.hex }]} />
                  </View>
                  <Text style={styles.luckyCardValue}>{pulse.luckyColor.name}</Text>
                </View>

                <View style={styles.luckyCard}>
                  <Text style={styles.luckyCardLabel}>LUCKY NUMBER</Text>
                  <View style={styles.luckyCardContent}>
                    <Text style={styles.luckyNumber}>{pulse.luckyNumber}</Text>
                  </View>
                  <Text style={styles.luckyCardValue}>Number</Text>
                </View>

                <View style={styles.luckyCard}>
                  <Text style={styles.luckyCardLabel}>LUCKY DIRECTION</Text>
                  <View style={styles.luckyCardContent}>
                    <RNText style={styles.luckyDirectionIcon}>→</RNText>
                  </View>
                  <Text style={styles.luckyCardValue}>{pulse.luckyDirection}</Text>
                </View>
              </View>
            </View>

            {/* Sub-Scores */}
            <View style={styles.subScoresSection}>
              <SubScoreBar icon="★" label="Business" value={pulse.subScores.business} color={colors.elements.fire} />
              <SubScoreBar icon="♥" label="Heart" value={pulse.subScores.heart} color="#ec4899" />
              <SubScoreBar icon="◆" label="Body" value={pulse.subScores.body} color={colors.elements.wood} />
            </View>
          </>
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubScoreBar({ icon, label, value, color }: {
  icon: string;
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
      <RNText style={styles.subScoreIcon}>{icon}</RNText>
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

  // Star Map Header
  starMapContainer: {
    height: 400,
    backgroundColor: colors.surface.containerLowest,
    overflow: 'hidden',
    justifyContent: 'flex-end',
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
  starMapTextOverlay: {
    position: 'absolute',
    bottom: 56,
    left: 24,
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
    marginTop: -48,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10,
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
    fontSize: fontSizes.xl,
    fontStyle: 'italic',
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: 24,
    maxWidth: 280,
    lineHeight: 28,
  },

  // Lucky Elements
  luckyElementsSection: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  luckyGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  luckyCard: {
    flex: 1,
    backgroundColor: colors.surface.containerLow,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 70, 55, 0.3)',
    alignItems: 'center',
    gap: 8,
  },
  luckyCardLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 9,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  luckyCardContent: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luckyColorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  luckyNumber: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes['4xl'],
    color: colors.gold.light,
  },
  luckyDirectionIcon: {
    fontSize: 36,
  },
  luckyCardValue: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurface,
    textAlign: 'center',
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
  subScoreIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
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
});
