import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { TopAppBar } from '@/src/components/ui/TopAppBar';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { useTranslation } from 'react-i18next';
import { signInWithPhone, verifyOTP } from '@/src/services/auth';
import { fetchExistingBirthData } from '@/src/services/birth-data';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

type Step = 'phone' | 'otp';

export default function PhoneAuth() {
  const router = useRouter();
  const { t } = useTranslation('onboarding');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+66');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  /** Normalize to E.164: strip spaces/dashes and remove leading 0 after country code */
  const normalizePhone = (raw: string): string => {
    const stripped = raw.replace(/[\s\-()]/g, '');
    // +660XXXXXXXX → +66XXXXXXXX
    return stripped.replace(/^(\+\d{1,3})0+/, '$1');
  };

  const handleSendOTP = async () => {
    if (phone !== '+66000000' && phone.length < 10) {
      Alert.alert(t('phoneAuth.invalidNumberTitle'), t('phoneAuth.invalidNumberMessage'));
      return;
    }
    setLoading(true);
    try {
      await signInWithPhone(normalizePhone(phone));
      setStep('otp');
      if (phone === '+66000000') {
        setOtpCode('000000');
      } else {
        setTimeout(() => otpInputRef.current?.focus(), 300);
      }
    } catch (error: any) {
      Alert.alert(t('phoneAuth.errorTitle'), error.message || t('phoneAuth.errorSendCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert(t('phoneAuth.invalidCodeTitle'), t('phoneAuth.invalidCodeMessage'));
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(normalizePhone(phone), otpCode);

      // Check if user already has birth data in the database
      const existing = await fetchExistingBirthData();
      if (existing) {
        // Restore onboarding store from server data and skip to main app
        const store = useOnboardingStore.getState();
        store.setBirthData(existing.birthData);
        if (existing.nameData) store.setNameData(existing.nameData);
        if (existing.concerns.length > 0) store.setConcerns(existing.concerns);
        if (existing.urgencyContext) store.setUrgencyContext(existing.urgencyContext);
        store.completeOnboarding();
        router.replace('/(main)/pulse');
      } else {
        router.replace('/(onboarding)/birth-data');
      }
    } catch (error: any) {
      Alert.alert(t('phoneAuth.errorTitle'), error.message || t('phoneAuth.errorVerifyCode'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <TopAppBar showBackButton onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {step === 'phone' ? t('phoneAuth.titlePhone') : t('phoneAuth.titleOtp')}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? t('phoneAuth.subtitlePhone')
              : t('phoneAuth.subtitleOtp', { phone })}
          </Text>

          {step === 'phone' ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('phoneAuth.phonePlaceholder')}
                placeholderTextColor={colors.outlineVariant}
                keyboardType="phone-pad"
                autoFocus
                editable={!loading}
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                ref={otpInputRef}
                style={styles.otpInput}
                value={otpCode}
                onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder={t('phoneAuth.otpPlaceholder')}
                placeholderTextColor={colors.outlineVariant}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.ctaWrapper}>
            {loading ? (
              <ActivityIndicator color={colors.gold.DEFAULT} size="large" />
            ) : (
              <GoldButton
                title={step === 'phone' ? t('phoneAuth.sendCode') : t('phoneAuth.verify')}
                onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
                variant="filled"
                fullWidth
                rounded
              />
            )}
          </View>

          {step === 'otp' && !loading && (
            <GoldButton
              title={t('phoneAuth.resendCode')}
              onPress={() => {
                setOtpCode('');
                handleSendOTP();
              }}
              variant="ghost"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
    gap: 24,
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: 26,
    color: colors.gold.light,
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
    lineHeight: 26,
  },
  inputContainer: {
    width: '100%',
    marginTop: 8,
  },
  phoneInput: {
    fontFamily: fonts.body.regular,
    fontSize: 24,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.gold.border,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  otpInput: {
    fontFamily: fonts.display.regular,
    fontSize: 36,
    color: colors.gold.light,
    borderWidth: 1,
    borderColor: colors.gold.border,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    letterSpacing: 12,
  },
  ctaWrapper: {
    width: '100%',
    marginTop: 8,
    minHeight: 56,
    justifyContent: 'center',
  },
});
