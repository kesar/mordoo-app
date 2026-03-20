import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AmbientBackgroundProps {
  /** Position of the top glow blob */
  topOffset?: { top?: number; right?: number; left?: number };
  /** Position of the bottom glow blob */
  bottomOffset?: { bottom?: number; left?: number; right?: number };
}

export function AmbientBackground({
  topOffset = { top: -150, right: -80 },
  bottomOffset = { bottom: -150, left: -80 },
}: AmbientBackgroundProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.blob, topOffset]} />
      <View style={[styles.blob, bottomOffset]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 9999,
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
  },
});
