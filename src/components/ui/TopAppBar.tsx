import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';

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
      <TouchableOpacity
        style={styles.iconButton}
        onPress={showBackButton ? onBackPress : onMenuPress}
        accessibilityRole="button"
        accessibilityLabel={showBackButton ? 'Go back' : 'Open menu'}
      >
        <Text style={styles.iconText}>{showBackButton ? '←' : '☰'}</Text>
      </TouchableOpacity>

      {/* Center title */}
      <Text style={styles.title}>MOR DOO</Text>

      {/* Right avatar */}
      <View style={styles.avatar} />

      {/* Bottom gold divider */}
      <View style={styles.bottomLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(10, 10, 20, 0.9)',
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: colors.gold.light,
    fontSize: 24,
    lineHeight: 28,
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
