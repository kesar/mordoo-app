import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { fonts } from '@/src/constants/typography';
import { useTranslation } from 'react-i18next';

interface OfflineBannerProps {
  visible: boolean;
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  const { t } = useTranslation('common');
  const translateY = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -40,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  // Always render so animation works, but pointer-events none when hidden
  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }] }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Text style={styles.text}>{t('errors.network')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(180, 60, 60, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: '#fff',
  },
});
