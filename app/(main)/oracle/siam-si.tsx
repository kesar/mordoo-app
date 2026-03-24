import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/ui/Text';
import { BambooIcon, ChevronLeftIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { useSiamSi } from '@/src/hooks/useSiamSi';
import { mediumHaptic, successHaptic } from '@/src/utils/haptics';

const FORTUNE_COLORS: Record<string, string> = {
  excellent: colors.energy.high,
  good: colors.gold.light,
  fair: colors.onSurfaceVariant,
  caution: colors.energy.low,
};

export default function SiamSiScreen() {
  const { t, i18n } = useTranslation('oracle');

  const fortuneLabels: Record<string, string> = {
    excellent: t('siamSi.fortuneLabels.excellent'),
    good: t('siamSi.fortuneLabels.good'),
    fair: t('siamSi.fortuneLabels.fair'),
    caution: t('siamSi.fortuneLabels.caution'),
  };

  const {
    isShaking,
    currentStick,
    isRevealing,
    isDrawing,
    isLoadingQuota,
    drawsRemaining,
    canDraw,
    error,
    performDraw,
    refreshQuota,
  } = useSiamSi();

  // Refresh quota every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshQuota();
    }, [refreshQuota]),
  );

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isShaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      shakeAnim.setValue(0);
    }
  }, [isShaking, shakeAnim]);

  useEffect(() => {
    if (currentStick) {
      Animated.parallel([
        Animated.timing(revealOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(revealScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      revealOpacity.setValue(0);
      revealScale.setValue(0.8);
    }
  }, [currentStick, revealOpacity, revealScale]);

  const handleManualDraw = useCallback(() => {
    if (canDraw) {
      mediumHaptic();
      performDraw();
    }
  }, [canDraw, performDraw]);

  // Haptic on reveal
  useEffect(() => {
    if (currentStick) successHaptic();
  }, [currentStick]);

  const shakeTranslateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color={colors.gold.DEFAULT} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('siamSi.title').toUpperCase()}</Text>
        <View style={styles.quotaBadge}>
          {isLoadingQuota ? (
            <ActivityIndicator size="small" color={colors.gold.light} />
          ) : (
            <Text style={styles.quotaText}>
              {drawsRemaining === null ? t('siamSi.unlimited') : t('siamSi.remaining', { count: drawsRemaining })}
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {currentStick ? (
          /* Result card */
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: revealOpacity,
                transform: [{ scale: revealScale }],
                borderColor: FORTUNE_COLORS[currentStick.fortune] ?? colors.gold.DEFAULT,
              },
            ]}
          >
            <Text style={styles.stickNumber}>#{currentStick.number}</Text>
            <View
              style={[
                styles.fortuneBadge,
                { backgroundColor: FORTUNE_COLORS[currentStick.fortune] ?? colors.gold.DEFAULT },
              ]}
            >
              <Text style={styles.fortuneText}>
                {fortuneLabels[currentStick.fortune] ?? currentStick.fortune}
              </Text>
            </View>
            <Text style={styles.titleEn}>
              {i18n.language === 'th' ? currentStick.titleTh : currentStick.titleEn}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.meaningEn}>
              {i18n.language === 'th' ? currentStick.meaningTh : currentStick.meaningEn}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.drawAgainBtn,
                !canDraw && styles.drawAgainBtnDisabled,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleManualDraw}
              disabled={!canDraw || isRevealing}
            >
              <Text style={styles.drawAgainText}>
                {canDraw ? t('siamSi.drawAgain') : t('siamSi.noDrawsLeft')}
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          /* Idle state — bamboo cup */
          <View style={styles.idleContainer}>
            <Animated.View
              style={[
                styles.cupContainer,
                { transform: [{ translateX: shakeTranslateX }] },
              ]}
            >
              <View style={styles.cup}>
                <BambooIcon size={48} color={colors.gold.DEFAULT} />
                <View style={styles.sticksContainer}>
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.stick,
                        { transform: [{ rotate: `${(i - 2) * 8}deg` }] },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>

            <Text style={styles.instruction}>
              {canDraw
                ? isShaking
                  ? t('siamSi.shaking')
                  : t('siamSi.shakePrompt')
                : t('siamSi.noDrawsRemaining')}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.drawBtn,
                !canDraw && styles.drawBtnDisabled,
                (pressed || isDrawing) && { opacity: 0.7 },
              ]}
              onPress={handleManualDraw}
              disabled={!canDraw || isDrawing}
            >
              <Text style={[styles.drawBtnText, !canDraw && styles.drawBtnTextDisabled]}>
                {isDrawing
                  ? t('siamSi.shaking')
                  : canDraw
                    ? t('siamSi.drawStick')
                    : t('siamSi.comeBackTomorrow')}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    color: colors.gold.DEFAULT,
    letterSpacing: 4,
  },
  quotaBadge: {
    backgroundColor: colors.gold.muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.gold.border,
  },
  quotaText: {
    fontFamily: fonts.display.regular,
    fontSize: 12,
    color: colors.gold.light,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Idle state
  idleContainer: {
    alignItems: 'center',
    gap: 32,
  },
  cupContainer: {
    alignItems: 'center',
  },
  cup: {
    width: 120,
    height: 180,
    backgroundColor: colors.night.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gold.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sticksContainer: {
    position: 'absolute',
    top: 20,
    flexDirection: 'row',
    gap: 4,
  },
  stick: {
    width: 3,
    height: 80,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 2,
  },
  instruction: {
    fontFamily: fonts.display.regular,
    fontSize: 14,
    color: colors.gold.light,
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 22,
  },
  drawBtn: {
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 9999,
  },
  drawBtnDisabled: {
    backgroundColor: colors.night.card,
    borderWidth: 1,
    borderColor: colors.gold.border,
  },
  drawBtnText: {
    fontFamily: fonts.display.bold,
    fontSize: 14,
    color: colors.onPrimary,
    letterSpacing: 3,
  },
  drawBtnTextDisabled: {
    color: colors.gold.light,
  },

  // Result card
  resultCard: {
    width: '100%',
    backgroundColor: colors.night.card,
    borderRadius: 20,
    borderWidth: 2,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  stickNumber: {
    fontFamily: fonts.display.bold,
    fontSize: 32,
    color: colors.gold.DEFAULT,
  },
  fortuneBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  fortuneText: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    color: colors.onPrimary,
    letterSpacing: 3,
  },
  titleEn: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: 'center',
  },
  titleTh: {
    fontFamily: fonts.body.regular,
    fontSize: 18,
    color: colors.gold.light,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.gold.border,
    marginVertical: 4,
  },
  meaningEn: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  meaningTh: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  drawAgainBtn: {
    marginTop: 8,
    backgroundColor: colors.gold.muted,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.gold.border,
  },
  drawAgainBtnDisabled: {
    opacity: 0.5,
  },
  drawAgainText: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    color: colors.gold.light,
    letterSpacing: 3,
  },
});
