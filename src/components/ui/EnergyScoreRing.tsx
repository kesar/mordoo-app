import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Filter, FeGaussianBlur, FeComposite } from 'react-native-svg';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';

interface EnergyScoreRingProps {
  score: number;        // 0-100
  size?: number;        // diameter in px, default 200
  label?: string;       // e.g., "Energy Score" or "Prana Index"
  strokeWidth?: number; // default 4
}

export function EnergyScoreRing({
  score,
  size = 200,
  label = 'Energy Score',
  strokeWidth = 4,
}: EnergyScoreRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  const center = size / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedScore / 100);

  // Inner circle visual dimensions
  const innerCircleSize = size * 0.72;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* SVG ring — rotated so arc starts from the top */}
      <Svg
        width={size}
        height={size}
        style={styles.svg}
      >
        <Defs>
          <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="3" result="coloredBlur" />
            <FeComposite in="SourceGraphic" in2="coloredBlur" operator="over" />
          </Filter>
        </Defs>

        {/* Track circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Glow layer for score arc (blurred, wider stroke) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.gold.light}
          strokeWidth={strokeWidth + 4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          opacity={0.25}
          transform={`rotate(-90, ${center}, ${center})`}
        />

        {/* Score arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.gold.light}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>

      {/* Inner circle with dark background */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerCircleSize,
            height: innerCircleSize,
            borderRadius: innerCircleSize / 2,
          },
        ]}
      >
        <Text style={styles.scoreText} numberOfLines={1}>
          {clampedScore}
        </Text>
        {label ? (
          <Text style={styles.labelText} numberOfLines={1}>
            {label.toUpperCase()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  innerCircle: {
    backgroundColor: colors.surface.containerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scoreText: {
    fontFamily: fonts.display.bold,
    fontSize: 48,
    color: colors.gold.light,
    includeFontPadding: false,
  },
  labelText: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: 'rgba(230, 195, 100, 0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
