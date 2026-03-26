import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
import { useOnboardingStore, BirthData } from '@/src/stores/onboardingStore';
import { CalendarIcon, LocationPinIcon, SearchIcon, InfoCircleIcon } from '@/src/components/icons/TarotIcons';
import { useTranslation } from 'react-i18next';
import { analytics } from '@/src/services/analytics';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const birthDataSchema = z.object({
  day: z.string().min(1),
  month: z.string().min(1),
  year: z.string().min(1),
  hour: z.string(),
  minute: z.string(),
  isAM: z.boolean(),
  birthPlace: z.string().min(1),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not']).optional(),
});

type BirthDataForm = z.infer<typeof birthDataSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BirthDataScreen() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const setBirthData = useOnboardingStore((s) => s.setBirthData);
  const setStep = useOnboardingStore((s) => s.setStep);

  const [dayFocused, setDayFocused] = useState(false);
  const [monthFocused, setMonthFocused] = useState(false);
  const [yearFocused, setYearFocused] = useState(false);
  const [hourFocused, setHourFocused] = useState(false);
  const [minuteFocused, setMinuteFocused] = useState(false);
  const [placeFocused, setPlaceFocused] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<BirthDataForm>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      day: '',
      month: '',
      year: '',
      hour: '',
      minute: '',
      isAM: true,
      birthPlace: '',
      gender: undefined,
    },
  });

  const isAM = watch('isAM');
  const gender = watch('gender');

  const onSubmit = (data: BirthDataForm) => {
    const hour24 = data.hour
      ? data.isAM
        ? parseInt(data.hour) % 12
        : (parseInt(data.hour) % 12) + 12
      : 0;

    const birthData: BirthData = {
      dateOfBirth: `${data.year.padStart(4, '0')}-${data.month.padStart(2, '0')}-${data.day.padStart(2, '0')}`,
      timeOfBirth: { hour: hour24, minute: data.minute ? parseInt(data.minute) : 0 },
      timeApproximate: !data.hour,
      placeOfBirth: { name: data.birthPlace, latitude: 0, longitude: 0, country: '' },
      gender: data.gender,
    };

    setBirthData(birthData);
    setStep(3);
    analytics.track('onboarding_birth_data_completed', {
      has_time: !!data.hour,
      has_gender: !!data.gender,
    });
    router.push('/(onboarding)/name-numbers');
  };

  const genderOptions: { label: string; value: BirthDataForm['gender'] }[] = [
    { label: t('birthData.genderOptions.male'), value: 'male' },
    { label: t('birthData.genderOptions.female'), value: 'female' },
    { label: t('birthData.genderOptions.nonBinary'), value: 'non-binary' },
    { label: t('birthData.genderOptions.preferNot'), value: 'prefer-not' },
  ];

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
          currentStep={2}
          totalSteps={4}
          label={t('birthData.step')}
        />

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{t('birthData.title')}</Text>
          <Text style={styles.subtitle}>
            {t('birthData.subtitle')}
          </Text>
        </View>

        {/* ── Date of Birth ── */}
        <SacredCard variant="low" style={styles.card}>
          {/* Decorative icon */}
          <View style={styles.cardDecorativeIcon}>
            <CalendarIcon size={28} color={colors.gold.DEFAULT} />
          </View>

          {/* Card label */}
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>{t('birthData.dateLabel')}</Text>
          </View>

          {/* Day / Month / Year */}
          <View style={styles.dateRow}>
            {/* Day */}
            <View style={styles.dateField}>
              <Text style={styles.inputLabel}>{t('birthData.day')}</Text>
              <Controller
                control={control}
                name="day"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.dateInput,
                      dayFocused && styles.dateInputFocused,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    placeholder={t('birthData.placeholderDD')}
                    placeholderTextColor="rgba(208, 197, 178, 0.3)"
                    maxLength={2}
                    onFocus={() => setDayFocused(true)}
                    onBlur={() => setDayFocused(false)}
                  />
                )}
              />
            </View>

            {/* Month */}
            <View style={styles.dateField}>
              <Text style={styles.inputLabel}>{t('birthData.month')}</Text>
              <Controller
                control={control}
                name="month"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.dateInput,
                      monthFocused && styles.dateInputFocused,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    placeholder={t('birthData.placeholderMM')}
                    placeholderTextColor="rgba(208, 197, 178, 0.3)"
                    maxLength={2}
                    onFocus={() => setMonthFocused(true)}
                    onBlur={() => setMonthFocused(false)}
                  />
                )}
              />
            </View>

            {/* Year */}
            <View style={[styles.dateField, styles.dateFieldYear]}>
              <Text style={styles.inputLabel}>{t('birthData.year')}</Text>
              <Controller
                control={control}
                name="year"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.dateInput,
                      yearFocused && styles.dateInputFocused,
                    ]}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    placeholder={t('birthData.placeholderYYYY')}
                    placeholderTextColor="rgba(208, 197, 178, 0.3)"
                    maxLength={4}
                    onFocus={() => setYearFocused(true)}
                    onBlur={() => setYearFocused(false)}
                  />
                )}
              />
            </View>
          </View>
        </SacredCard>

        {/* ── Time of Birth ── */}
        <SacredCard variant="high" style={styles.card}>
          {/* Card label */}
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>{t('birthData.timeLabel')}</Text>
          </View>

          <View style={styles.timeRow}>
            {/* Hour */}
            <Controller
              control={control}
              name="hour"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.timeInput,
                    hourFocused && styles.timeInputFocused,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  placeholder={t('birthData.placeholderHH')}
                  placeholderTextColor="rgba(208, 197, 178, 0.3)"
                  maxLength={2}
                  textAlign="center"
                  onFocus={() => setHourFocused(true)}
                  onBlur={() => setHourFocused(false)}
                />
              )}
            />

            {/* Separator */}
            <Text style={styles.timeSeparator}>:</Text>

            {/* Minute */}
            <Controller
              control={control}
              name="minute"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.timeInput,
                    minuteFocused && styles.timeInputFocused,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  placeholder={t('birthData.placeholderMin')}
                  placeholderTextColor="rgba(208, 197, 178, 0.3)"
                  maxLength={2}
                  textAlign="center"
                  onFocus={() => setMinuteFocused(true)}
                  onBlur={() => setMinuteFocused(false)}
                />
              )}
            />

            {/* AM / PM toggle */}
            <View style={styles.ampmColumn}>
              <TouchableOpacity
                style={[
                  styles.ampmButton,
                  isAM ? styles.ampmButtonActive : styles.ampmButtonInactive,
                ]}
                onPress={() => setValue('isAM', true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.ampmText,
                    isAM ? styles.ampmTextActive : styles.ampmTextInactive,
                  ]}
                >
                  {t('birthData.am')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.ampmButton,
                  !isAM ? styles.ampmButtonActive : styles.ampmButtonInactive,
                ]}
                onPress={() => setValue('isAM', false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.ampmText,
                    !isAM ? styles.ampmTextActive : styles.ampmTextInactive,
                  ]}
                >
                  {t('birthData.pm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info note */}
          <View style={styles.infoNote}>
            <InfoCircleIcon size={14} color={colors.gold.DEFAULT} />
            <Text style={styles.infoNoteText}>
              {t('birthData.timeHint')}
            </Text>
          </View>
        </SacredCard>

        {/* ── Place of Birth ── */}
        <SacredCard variant="low" style={styles.card}>
          {/* Card label */}
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>{t('birthData.placeLabel')}</Text>
          </View>

          <View style={styles.placeRow}>
            <LocationPinIcon size={18} color={colors.gold.DEFAULT} />
            <Controller
              control={control}
              name="birthPlace"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.placeInput,
                    placeFocused && styles.placeInputFocused,
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('birthData.placePlaceholder')}
                  placeholderTextColor="rgba(208, 197, 178, 0.3)"
                  onFocus={() => setPlaceFocused(true)}
                  onBlur={() => setPlaceFocused(false)}
                />
              )}
            />
            <SearchIcon size={18} color={colors.gold.DEFAULT} />
          </View>
        </SacredCard>

        {/* ── Gender ── */}
        <SacredCard variant="high" style={{ ...styles.card, overflow: 'visible' }}>
          {/* Card label */}
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>{t('birthData.genderLabel')}</Text>
          </View>

          <View style={styles.genderGrid}>
            {genderOptions.map((option) => {
              const isActive = gender === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderButton,
                    isActive ? styles.genderButtonActive : styles.genderButtonInactive,
                  ]}
                  onPress={() =>
                    setValue('gender', isActive ? undefined : option.value)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      isActive
                        ? styles.genderButtonTextActive
                        : styles.genderButtonTextInactive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SacredCard>

        {/* CTA */}
        <GoldButton
          title={t('birthData.cta')}
          onPress={handleSubmit(onSubmit)}
          variant="filled"
          fullWidth
          rounded
        />

        {/* Footer */}
        <Text style={styles.footerText}>{t('birthData.footer')}</Text>
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
const GOLD_10 = 'rgba(201, 168, 76, 0.1)';
const OUTLINE_50 = 'rgba(77, 70, 55, 0.5)';
const OUTLINE_30 = 'rgba(77, 70, 55, 0.3)';
const OUTLINE_40 = 'rgba(77, 70, 55, 0.4)';

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
    fontSize: fontSizes.xs,
    color: GOLD_LIGHT,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ── Input labels ─────────────────────────────────────────────────────────
  inputLabel: {
    fontFamily: fonts.thai.regular,
    fontSize: 11,
    color: GOLD_LIGHT,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // ── Date inputs ──────────────────────────────────────────────────────────
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateField: {
    flex: 1,
  },
  dateFieldYear: {
    flex: 2,
  },
  dateInput: {
    fontFamily: fonts.body.regular,
    fontSize: 22,
    color: colors.onSurface,
    borderBottomWidth: 2,
    borderBottomColor: OUTLINE_50,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dateInputFocused: {
    borderBottomColor: GOLD,
  },

  // ── Time inputs ──────────────────────────────────────────────────────────
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timeInput: {
    width: 80,
    backgroundColor: colors.surface.containerLowest,
    borderWidth: 2,
    borderColor: OUTLINE_30,
    borderRadius: 8,
    fontSize: 28,
    fontFamily: fonts.body.regular,
    color: colors.onSurface,
    paddingVertical: 16,
    textAlign: 'center',
  },
  timeInputFocused: {
    borderColor: GOLD,
  },
  timeSeparator: {
    fontFamily: fonts.body.regular,
    fontSize: 28,
    color: colors.onSurfaceVariant,
  },
  ampmColumn: {
    gap: 6,
    marginLeft: 4,
  },
  ampmButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  ampmButtonActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  ampmButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: OUTLINE_50,
  },
  ampmText: {
    fontFamily: fonts.thai.regular,
    fontSize: 12,
    letterSpacing: 1,
  },
  ampmTextActive: {
    color: colors.onPrimary,
  },
  ampmTextInactive: {
    color: colors.onSurfaceVariant,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: GOLD_5,
    borderWidth: 1,
    borderColor: GOLD_10,
    borderRadius: 8,
    padding: 12,
  },
  infoNoteText: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    flex: 1,
  },

  // ── Place input ──────────────────────────────────────────────────────────
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: OUTLINE_50,
    paddingBottom: 4,
  },
  placeInput: {
    flex: 1,
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    color: colors.onSurface,
    paddingVertical: 8,
  },
  placeInputFocused: {
    // borderBottom is on the row, handled by parent focus state separately
  },
  // ── Gender grid ──────────────────────────────────────────────────────────
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    minWidth: '44%',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  genderButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: OUTLINE_40,
  },
  genderButtonText: {
    fontFamily: fonts.thai.regular,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  genderButtonTextActive: {
    color: colors.onPrimary,
  },
  genderButtonTextInactive: {
    color: colors.onSurfaceVariant,
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
