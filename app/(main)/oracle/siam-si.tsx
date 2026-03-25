import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/ui/Text';
import { ChevronLeftIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { useSiamSi } from '@/src/hooks/useSiamSi';
import { useRatingPrompt } from '@/src/hooks/useRatingPrompt';
import { RatingPrompt } from '@/src/components/RatingPrompt';
import { features } from '@/src/config/features';
import { mediumHaptic, successHaptic } from '@/src/utils/haptics';

const siamSiSticks = require('@/assets/images/siam-si-sticks.png');

import ViewShot from 'react-native-view-shot';
import { SiamSiShareCard } from '@/src/components/sharing/SiamSiShareCard';
import { useShareCard } from '@/src/hooks/useShareCard';

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

  const { viewShotRef, shareCard, isSharing } = useShareCard();
  const { ratingPromptVisible, showRatingPrompt, closeRatingPrompt } = useRatingPrompt();

  // Refresh quota every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshQuota();
    }, [refreshQuota]),
  );

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeRotate = useRef(new Animated.Value(0)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.8)).current;

  const isAnimating = isShaking || isDrawing;

  useEffect(() => {
    if (isAnimating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]),
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeRotate, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeRotate, { toValue: -1, duration: 120, useNativeDriver: true }),
          Animated.timing(shakeRotate, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      shakeAnim.setValue(0);
      shakeRotate.setValue(0);
    }
  }, [isAnimating, shakeAnim, shakeRotate]);

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

  // Haptic on reveal + rating prompt for excellent fortunes
  useEffect(() => {
    if (currentStick) {
      successHaptic();
      if (features.ratingPrompt && currentStick.fortune === 'excellent') {
        showRatingPrompt(2000);
      }
    }
  }, [currentStick, showRatingPrompt]);

  const shakeTranslateX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-12, 0, 12],
  });

  const shakeRotateZ = shakeRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
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

            <Pressable
              style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                const fortuneLabel = fortuneLabels[currentStick.fortune] ?? currentStick.fortune;
                shareCard(t('siamSi.share.message', { number: currentStick.number, fortune: fortuneLabel }));
              }}
              disabled={isSharing}
            >
              <Text style={styles.shareBtnText}>
                {isSharing ? '...' : t('siamSi.share.button')}
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          /* Idle state — bamboo cup */
          <View style={styles.idleContainer}>
            <Animated.View
              style={[
                styles.cupContainer,
                {
                  transform: [
                    { translateX: shakeTranslateX },
                    { rotate: shakeRotateZ },
                  ],
                },
              ]}
            >
              <Image
                source={siamSiSticks}
                style={styles.sticksImage}
                resizeMode="contain"
              />
            </Animated.View>

            <Text style={styles.instruction}>
              {isLoadingQuota
                ? t('siamSi.consultingSpirits')
                : canDraw
                  ? isShaking
                    ? t('siamSi.shaking')
                    : t('siamSi.shakePrompt')
                  : t('siamSi.noDrawsRemaining')}
            </Text>

            {isLoadingQuota ? (
              <View style={styles.loadingBtn}>
                <ActivityIndicator size="small" color={colors.gold.light} />
              </View>
            ) : (
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
            )}
          </View>
        )}
      </View>

      <RatingPrompt visible={ratingPromptVisible} onClose={closeRatingPrompt} />

      {/* Off-screen share card */}
      {currentStick && (
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1, width: 1080, height: 1350 }}
          style={styles.offScreen}
        >
          <SiamSiShareCard
            stickNumber={currentStick.number}
            fortune={currentStick.fortune}
            fortuneLabel={fortuneLabels[currentStick.fortune] ?? currentStick.fortune}
            title={i18n.language === 'th' ? currentStick.titleTh : currentStick.titleEn}
            meaning={i18n.language === 'th' ? currentStick.meaningTh : currentStick.meaningEn}
            lang={i18n.language as 'en' | 'th'}
          />
        </ViewShot>
      )}
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
  sticksImage: {
    width: 300,
    height: 380,
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
  loadingBtn: {
    backgroundColor: colors.night.card,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.gold.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  shareBtn: {
    marginTop: 4,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 9999,
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
