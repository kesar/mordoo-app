import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';

const FORTUNE_COLORS: Record<string, string> = {
  excellent: colors.energy.high,
  good: colors.gold.light,
  fair: colors.onSurfaceVariant,
  caution: colors.energy.low,
};

interface SiamSiShareCardProps {
  stickNumber: number;
  fortune: 'excellent' | 'good' | 'fair' | 'caution';
  fortuneLabel: string;
  title: string;
  meaning: string;
  lang: 'en' | 'th';
}

export function SiamSiShareCard({ stickNumber, fortune, fortuneLabel, title, meaning, lang }: SiamSiShareCardProps) {
  const fortuneColor = FORTUNE_COLORS[fortune] ?? colors.gold.DEFAULT;
  const bodyFont = lang === 'th' ? fonts.thai.regular : fonts.body.regular;

  return (
    <View style={styles.card}>
      <Text style={styles.brandLabel}>MORDOO</Text>
      <Text style={styles.typeLabel}>SIAM SI</Text>

      <Text style={styles.stickNumber}>#{stickNumber}</Text>

      <View style={[styles.fortuneBadge, { backgroundColor: fortuneColor }]}>
        <Text style={styles.fortuneText}>{fortuneLabel}</Text>
      </View>

      <Text style={[styles.titleText, lang === 'th' && { fontFamily: fonts.thai.medium }]}>{title}</Text>

      <View style={styles.divider} />

      <Text style={[styles.meaningText, { fontFamily: bodyFont }]} numberOfLines={5}>{meaning}</Text>

      <Text style={styles.footerBrand}>MORDOO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    aspectRatio: 4 / 5,
    backgroundColor: '#0a0a14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201, 168, 76, 0.5)',
    letterSpacing: 4,
    marginBottom: 4,
  },
  typeLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 11,
    color: 'rgba(201, 168, 76, 0.7)',
    letterSpacing: 3,
    marginBottom: 28,
  },
  stickNumber: {
    fontFamily: fonts.display.bold,
    fontSize: 56,
    color: colors.gold.DEFAULT,
    lineHeight: 64,
    marginBottom: 12,
  },
  fortuneBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  fortuneText: {
    fontFamily: fonts.display.bold,
    fontSize: 11,
    color: colors.onPrimary,
    letterSpacing: 3,
  },
  titleText: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    marginVertical: 16,
  },
  meaningText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(244, 232, 193, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  footerBrand: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201, 168, 76, 0.4)',
    letterSpacing: 4,
  },
});
