import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/src/constants/colors';

interface SacredCardProps {
  variant?: 'low' | 'high';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SacredCard({ variant = 'low', children, style }: SacredCardProps) {
  return (
    <View style={[styles.base, variant === 'high' ? styles.high : styles.low, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  low: {
    backgroundColor: colors.surface.containerLow,
  },
  high: {
    backgroundColor: colors.surface.containerHigh,
  },
});
