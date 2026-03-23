import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { lightHaptic } from '@/src/utils/haptics';
import { scale } from '@/src/utils/scale';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'ghost';
  fullWidth?: boolean;
  rounded?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function GoldButton({
  title,
  onPress,
  variant = 'filled',
  fullWidth = false,
  rounded = false,
  disabled = false,
  style,
}: GoldButtonProps) {
  const borderRadius = rounded ? 9999 : 12;

  const handlePress = useCallback(() => {
    lightHaptic();
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'filled' ? styles.filled : variant === 'outlined' ? styles.outlined : styles.ghost,
        { borderRadius },
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {() => (
        <Text
          style={[
            styles.baseText,
            variant === 'filled' ? styles.filledText : variant === 'outlined' ? styles.outlinedText : styles.ghostText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(20),
    paddingHorizontal: scale(32),
    alignSelf: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },

  // Filled variant
  filled: {
    backgroundColor: colors.gold.DEFAULT,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(61, 46, 0, 0.2)', // onPrimary at 20% opacity
    shadowColor: '#e6c364',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },

  // Outlined variant
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gold.border,
  },

  // Ghost variant
  ghost: {
    backgroundColor: 'transparent',
  },

  // Disabled state
  disabled: {
    opacity: 0.4,
  },

  // Text base
  baseText: {
    letterSpacing: scale(3.5),
    textTransform: 'uppercase',
  },

  // Filled text
  filledText: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.base,
    color: colors.onPrimary,
  },

  // Outlined text
  outlinedText: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.base,
    color: colors.gold.light,
    letterSpacing: scale(3.5),
  },

  // Ghost text
  ghostText: {
    fontFamily: fonts.body.medium,
    fontSize: fontSizes.xl,
    color: colors.parchment.DEFAULT,
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(201, 168, 76, 0.5)', // gold at 50% opacity
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  disabledText: {
    // opacity is handled on the container; no extra text style needed
  },
});
