import { useCallback } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { lightHaptic } from '@/src/utils/haptics';
import {
  triggerNativeReviewPrompt,
  markPromptDismissed,
} from '@/src/services/rating';

interface RatingPromptProps {
  visible: boolean;
  onClose: () => void;
}

export function RatingPrompt({ visible, onClose }: RatingPromptProps) {
  const { t } = useTranslation('common');

  const handlePositive = useCallback(async () => {
    lightHaptic();
    onClose();
    await triggerNativeReviewPrompt();
  }, [onClose]);

  const handleNegative = useCallback(() => {
    lightHaptic();
    markPromptDismissed();
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleNegative}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.sparkle}>✦</Text>
          <Text style={styles.title}>{t('rating.title')}</Text>
          <Text style={styles.subtitle}>{t('rating.subtitle')}</Text>

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnPositive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handlePositive}
            >
              <Text style={styles.btnPositiveText}>
                {t('rating.positive')}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnNegative,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleNegative}
            >
              <Text style={styles.btnNegativeText}>
                {t('rating.negative')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: colors.night.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold.border,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
  },
  sparkle: {
    fontSize: 28,
    color: colors.gold.DEFAULT,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.xl,
    color: colors.parchment.DEFAULT,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.parchment.dim,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPositive: {
    backgroundColor: colors.gold.DEFAULT,
  },
  btnPositiveText: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.sm,
    color: colors.onPrimary,
    letterSpacing: 1,
  },
  btnNegative: {
    backgroundColor: colors.night.card,
    borderWidth: 1,
    borderColor: colors.gold.border,
  },
  btnNegativeText: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.sm,
    color: colors.parchment.dim,
    letterSpacing: 1,
  },
});
