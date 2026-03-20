import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';

interface ProgressIndicatorProps {
  currentStep: number; // 1-based index of active step
  totalSteps: number;  // total number of steps (e.g., 3 or 6)
  label: string;       // text label below dots (e.g., "Step 1: Initiation")
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  label,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {/* Dots row */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isLast = index === totalSteps - 1;

          return (
            <React.Fragment key={stepNumber}>
              {/* Dot */}
              <View
                style={[
                  styles.dotWrapper,
                  isActive ? styles.dotWrapperActive : null,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </View>

              {/* Connecting line (not after last dot) */}
              {!isLast && <View style={styles.line} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const GOLD_LIGHT = colors.gold.light;          // '#e6c364'
const GOLD_MUTED = 'rgba(201, 168, 76, 0.2)'; // lines and ring
const SURFACE_HIGHEST = colors.surface.containerHighest; // '#34343f'

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Wrapper provides the "ring" halo effect for the active dot
  dotWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dotWrapperActive: {
    backgroundColor: GOLD_MUTED,
  },
  dot: {
    borderRadius: 99,
  },
  dotActive: {
    width: 16,
    height: 16,
    backgroundColor: GOLD_LIGHT,
    // React Native shadow (iOS)
    shadowColor: GOLD_LIGHT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    // Android elevation gives a subtle glow approximation
    elevation: 6,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: SURFACE_HIGHEST,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: GOLD_MUTED,
    minWidth: 16,
  },
  label: {
    fontFamily: fonts.display.bold,
    fontSize: 10,
    letterSpacing: 4,
    color: GOLD_LIGHT,
    textTransform: 'uppercase',
  },
});
