import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { SparkleIcon } from '@/src/components/icons/TarotIcons';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { getExpoPushToken, registerPushToken, getTimezone } from '@/src/services/notifications';
import { analytics } from '@/src/services/analytics';

interface NotificationPromptProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationPrompt({ visible, onClose }: NotificationPromptProps) {
  const { t } = useTranslation('common');
  const language = useSettingsStore((s) => s.language);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setNotificationPromptShown = useSettingsStore((s) => s.setNotificationPromptShown);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnable = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const token = await getExpoPushToken();
      if (!token) {
        analytics.track('notification_permission_result', { granted: false, trigger: 'pulse' });
        Alert.alert(
          t('notificationPrompt.title'),
          t('notificationPrompt.noSpam'),
        );
        setNotificationPromptShown(true);
        onClose();
        return;
      }
      setNotificationsEnabled(true);
      setNotificationPromptShown(true);
      analytics.track('notification_permission_result', { granted: true, trigger: 'pulse' });
      await registerPushToken(token, getTimezone(), language);
      onClose();
    } catch (error) {
      console.error('Failed to register push token:', error);
      setNotificationPromptShown(true);
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLater = () => {
    setNotificationPromptShown(true);
    analytics.track('notification_prompt_dismissed');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleLater}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <SparkleIcon size={28} color={colors.gold.DEFAULT} />
          <Text style={styles.title}>{t('notificationPrompt.title')}</Text>
          <Text style={styles.description}>{t('notificationPrompt.description')}</Text>
          <View style={styles.buttons}>
            <GoldButton
              title={t('notificationPrompt.enable')}
              onPress={handleEnable}
              variant="filled"
              fullWidth
              rounded
            />
            <GoldButton
              title={t('notificationPrompt.later')}
              onPress={handleLater}
              variant="ghost"
            />
          </View>
          <Text style={styles.note}>{t('notificationPrompt.noSpam')}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: 'rgba(31, 31, 41, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gold.border,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.gold.light,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttons: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  note: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.xs,
    color: 'rgba(208, 197, 178, 0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});
