import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { ArrowLeftIcon, MenuIcon } from '@/src/components/icons/TarotIcons';

interface TopAppBarProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

export function TopAppBar({
  showBackButton = false,
  onBackPress,
  onMenuPress,
}: TopAppBarProps) {
  return (
    <View style={styles.container}>
      {/* Left icon */}
      <Pressable
        style={styles.iconButton}
        onPress={showBackButton ? onBackPress : onMenuPress}
        hitSlop={16}
        accessibilityRole="button"
        accessibilityLabel={showBackButton ? 'Go back' : 'Open menu'}
      >
        {showBackButton ? (
          <ArrowLeftIcon size={24} color={colors.gold.light} />
        ) : (
          <MenuIcon size={24} color={colors.gold.light} />
        )}
      </Pressable>

      {/* Center title */}
      <Text style={styles.title}>MOR DOO</Text>

      {/* Right avatar */}
      <View style={styles.avatar} />

      {/* Bottom gold divider */}
      <View style={styles.bottomLine} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(10, 10, 20, 0.9)',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.gold.light,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold.border,
    backgroundColor: 'transparent',
  },
  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.4)',
  },
});
