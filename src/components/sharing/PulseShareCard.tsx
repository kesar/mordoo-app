import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import type { DailyPulseResponse } from '@shared/types';

interface PulseShareCardProps {
  pulse: DailyPulseResponse;
  dateStr: string;
  lang: 'en' | 'th';
  subScoreLabels: { business: string; heart: string; body: string };
  luckyLabels: { color: string; number: string; direction: string };
}

export function PulseShareCard({ pulse, dateStr, lang, subScoreLabels, luckyLabels }: PulseShareCardProps) {
  const bodyFont = lang === 'th' ? fonts.thai.regular : fonts.body.regular;

  return (
    <View style={styles.card}>
      <Text style={styles.brandLabel}>MORDOO</Text>
      <Text style={styles.dateLabel}>{dateStr}</Text>

      <Text style={styles.scoreValue}>{pulse.energyScore}</Text>
      <Text style={styles.scoreLabel}>Energy Score</Text>

      <View style={styles.subScoresRow}>
        <SubScoreItem label={subScoreLabels.business} value={pulse.subScores.business} color={colors.elements.fire} bodyFont={bodyFont} />
        <SubScoreItem label={subScoreLabels.heart} value={pulse.subScores.heart} color="#ec4899" bodyFont={bodyFont} />
        <SubScoreItem label={subScoreLabels.body} value={pulse.subScores.body} color={colors.elements.wood} bodyFont={bodyFont} />
      </View>

      <View style={styles.divider} />

      <View style={styles.luckyRow}>
        <View style={styles.luckyItem}>
          <Text style={[styles.luckyLabel, { fontFamily: bodyFont }]}>{luckyLabels.color}</Text>
          <View style={[styles.colorSwatch, { backgroundColor: pulse.luckyColor.hex }]} />
          <Text style={styles.luckyValue}>{pulse.luckyColor.name}</Text>
        </View>
        <View style={styles.luckyItem}>
          <Text style={[styles.luckyLabel, { fontFamily: bodyFont }]}>{luckyLabels.number}</Text>
          <Text style={styles.luckyNumberValue}>{pulse.luckyNumber}</Text>
        </View>
        <View style={styles.luckyItem}>
          <Text style={[styles.luckyLabel, { fontFamily: bodyFont }]}>{luckyLabels.direction}</Text>
          <Text style={styles.luckyValue}>{pulse.luckyDirection}</Text>
        </View>
      </View>

      <Text style={[styles.insightText, { fontFamily: bodyFont }]} numberOfLines={4}>{pulse.insight}</Text>

      <Text style={styles.footerBrand}>MORDOO</Text>
    </View>
  );
}

function SubScoreItem({ label, value, color, bodyFont }: { label: string; value: number; color: string; bodyFont: string }) {
  return (
    <View style={styles.subScoreItem}>
      <Text style={[styles.subScoreLabel, { fontFamily: bodyFont }]}>{label}</Text>
      <Text style={[styles.subScoreValue, { color }]}>{value}</Text>
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
    marginBottom: 8,
  },
  dateLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 11,
    color: 'rgba(201, 168, 76, 0.7)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  scoreValue: {
    fontFamily: fonts.display.bold,
    fontSize: 64,
    color: colors.gold.DEFAULT,
    lineHeight: 72,
  },
  scoreLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: 'rgba(244, 232, 193, 0.5)',
    letterSpacing: 2,
    marginBottom: 20,
  },
  subScoresRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 20,
  },
  subScoreItem: {
    alignItems: 'center',
    gap: 4,
  },
  subScoreLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: 'rgba(244, 232, 193, 0.5)',
  },
  subScoreValue: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    marginVertical: 16,
  },
  luckyRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  luckyItem: {
    alignItems: 'center',
    gap: 6,
  },
  luckyLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 9,
    color: 'rgba(244, 232, 193, 0.5)',
    letterSpacing: 1,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  luckyValue: {
    fontFamily: fonts.display.regular,
    fontSize: 11,
    color: colors.parchment.DEFAULT,
  },
  luckyNumberValue: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: colors.gold.light,
  },
  insightText: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(244, 232, 193, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  footerBrand: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201, 168, 76, 0.4)',
    letterSpacing: 4,
  },
});
