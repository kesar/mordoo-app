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
import { signInWithPhone, verifyOTP } from '@/src/services/auth';

type Step = 'phone' | 'otp';

export default function PhoneAuth() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+66');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  const handleSendOTP = async () => {
    if (phone !== '+66000000' && phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      await signInWithPhone(phone);
      setStep('otp');
      if (phone === '+66000000') {
        setOtpCode('000000');
      } else {
        setTimeout(() => otpInputRef.current?.focus(), 300);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(phone, otpCode);
      router.replace('/(onboarding)/birth-data');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid verification code.');
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
            {step === 'phone' ? 'ENTER YOUR NUMBER' : 'VERIFY CODE'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'We will send a sacred code to your device.'
              : `Enter the 6-digit code sent to ${phone}`}
          </Text>

          {step === 'phone' ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+66 xxx xxx xxxx"
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
                placeholder="000000"
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
                title={step === 'phone' ? 'SEND CODE' : 'VERIFY'}
                onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
                variant="filled"
                fullWidth
                rounded
              />
            )}
          </View>

          {step === 'otp' && !loading && (
            <GoldButton
              title="Resend Code"
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
