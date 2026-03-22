import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { Text } from '@/src/components/ui/Text';
import { ProgressIndicator } from '@/src/components/ui/ProgressIndicator';
import { SacredCard } from '@/src/components/ui/SacredCard';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { TopAppBar } from '@/src/components/ui/TopAppBar';
import { useOnboardingStore, NameData } from '@/src/stores/onboardingStore';
import { SparkleIcon } from '@/src/components/icons/TarotIcons';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const nameDataSchema = z.object({
  fullName: z.string().min(1),
  phoneNumber: z.string(),
  carPlate: z.string(),
});

type NameDataForm = z.infer<typeof nameDataSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NameNumbersScreen() {
  const router = useRouter();
  const setNameData = useOnboardingStore((s) => s.setNameData);
  const setStep = useOnboardingStore((s) => s.setStep);

  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [carPlateFocused, setCarPlateFocused] = useState(false);

  const { control, handleSubmit } = useForm<NameDataForm>({
    resolver: zodResolver(nameDataSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      carPlate: '',
    },
  });

  const onSubmit = (data: NameDataForm) => {
    const nameData: NameData = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || undefined,
      carPlate: data.carPlate || undefined,
    };
    setNameData(nameData);
    setStep(4);
    router.push('/(onboarding)/life-context');
  };

  return (
    <SafeAreaView style={styles.screenContainer} edges={['top']}>
      <TopAppBar showBackButton onBackPress={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <ProgressIndicator
          currentStep={3}
          totalSteps={6}
          label="Phase 3 of 6 — The Vibration"
        />

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Your Cosmic Signature</Text>
          <Text style={styles.subtitle}>
            Names and numbers carry vibrational frequencies that shape your destiny.
          </Text>
        </View>

        {/* ── Full Name ── */}
        <SacredCard variant="low" style={styles.card}>
          {/* Decorative icon */}
          <View style={styles.cardDecorativeIcon}>
            <SparkleIcon size={28} color={colors.gold.DEFAULT} />
          </View>

          {/* Card label */}
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>Name Vibration (Full Name)</Text>
          </View>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.textInput,
                  fullNameFocused && styles.textInputFocused,
                ]}
                value={value}
                onChangeText={onChange}
                placeholder="Enter your full name..."
                placeholderTextColor="rgba(208, 197, 178, 0.3)"
                onFocus={() => setFullNameFocused(true)}
                onBlur={() => setFullNameFocused(false)}
              />
            )}
          />
        </SacredCard>

        {/* ── Phone Number ── */}
        <SacredCard variant="high" style={styles.card}>
          {/* Card label */}
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>Digital Signal (Phone — Optional)</Text>
          </View>

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.textInput,
                  phoneFocused && styles.textInputFocused,
                ]}
                value={value}
                onChangeText={onChange}
                placeholder="0XX-XXX-XXXX"
                placeholderTextColor="rgba(208, 197, 178, 0.3)"
                keyboardType="phone-pad"
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
              />
            )}
          />

          {/* Info note */}
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteText}>
              Your number carries numerological significance
            </Text>
          </View>
        </SacredCard>

        {/* ── Car Plate ── */}
        <SacredCard variant="low" style={styles.card}>
          {/* Card label */}
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>Vehicle Resonance (Car Plate — Optional)</Text>
          </View>

          <Controller
            control={control}
            name="carPlate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.textInput,
                  carPlateFocused && styles.textInputFocused,
                ]}
                value={value}
                onChangeText={onChange}
                placeholder="e.g. กข 1234"
                placeholderTextColor="rgba(208, 197, 178, 0.3)"
                autoCapitalize="characters"
                onFocus={() => setCarPlateFocused(true)}
                onBlur={() => setCarPlateFocused(false)}
              />
            )}
          />
        </SacredCard>

        {/* CTA */}
        <GoldButton
          title="SEAL THE VIBRATION"
          onPress={handleSubmit(onSubmit)}
          variant="filled"
          fullWidth
          rounded
        />

        {/* Footer */}
        <Text style={styles.footerText}>Your name echoes in the cosmic ledger</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const GOLD = colors.gold.DEFAULT;
const GOLD_LIGHT = colors.gold.light;
const GOLD_20 = 'rgba(201, 168, 76, 0.2)';
const GOLD_5 = 'rgba(201, 168, 76, 0.05)';
const OUTLINE_50 = 'rgba(77, 70, 55, 0.5)';

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 24,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  headerSection: {
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 28,
    color: GOLD_LIGHT,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.lg,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ── Card shared ──────────────────────────────────────────────────────────
  card: {
    overflow: 'hidden',
  },
  cardDecorativeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.2,
  },
  cardLabelRow: {
    borderBottomWidth: 1,
    borderBottomColor: GOLD_20,
    paddingBottom: 8,
    marginBottom: 24,
  },
  cardLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 12,
    color: GOLD_LIGHT,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ── Text inputs ──────────────────────────────────────────────────────────
  textInput: {
    fontFamily: fonts.body.regular,
    fontSize: 22,
    color: colors.onSurface,
    borderBottomWidth: 2,
    borderBottomColor: OUTLINE_50,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  textInputFocused: {
    borderBottomColor: GOLD,
  },

  // ── Info note ────────────────────────────────────────────────────────────
  infoNote: {
    marginTop: 16,
    backgroundColor: GOLD_5,
    borderRadius: 8,
    padding: 12,
  },
  infoNoteText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footerText: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.xs,
    color: GOLD_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 24,
  },
});
