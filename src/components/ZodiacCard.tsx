import React from 'react';
import { View, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { SacredCard } from '@/src/components/ui/SacredCard';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';

interface ZodiacCardProps {
  systemLabel: string;
  signName: string;
  element: string;
  rulingPlanet?: string;
  traits: string;
  image: ImageSourcePropType;
}

export function ZodiacCard({ systemLabel, signName, element, rulingPlanet, traits, image }: ZodiacCardProps) {
  const detailParts = [element, rulingPlanet, traits].filter(Boolean);

  return (
    <SacredCard
      variant="low"
      style={styles.card}
    >
      <View style={styles.row} accessible accessibilityLabel={`${systemLabel}: ${signName}`}>
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
        </View>
        <View style={styles.info}>
          <Text style={styles.systemLabel}>{systemLabel}</Text>
          <Text style={styles.signName}>{signName}</Text>
          <Text style={styles.details} numberOfLines={2}>{detailParts.join(' · ')}</Text>
        </View>
      </View>
    </SacredCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  imageContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold.border,
    overflow: 'hidden',
    backgroundColor: colors.night.DEFAULT,
  },
  image: {
    width: 52,
    height: 52,
  },
  info: {
    flex: 1,
  },
  systemLabel: {
    color: colors.gold.DEFAULT,
    fontSize: fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  signName: {
    color: colors.parchment.DEFAULT,
    fontSize: fontSizes.lg,
    fontFamily: fonts.display.bold,
  },
  details: {
    color: colors.outline,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
});
