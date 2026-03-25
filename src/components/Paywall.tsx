import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { type PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
import { Text } from '@/src/components/ui/Text';
import { GoldButton } from '@/src/components/ui/GoldButton';
import { StarIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { scale } from '@/src/utils/scale';
import { useSubscription } from '@/src/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { lightHaptic } from '@/src/utils/haptics';
import { analytics } from '@/src/services/analytics';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribed?: () => void;
  source?: string;
}

export function Paywall({ visible, onClose, onSubscribed, source }: PaywallProps) {
  const { t } = useTranslation('paywall');
  const { offering, subscribe, restore, isPurchasing, isRestoring } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  useEffect(() => {
    if (visible) {
      analytics.track('paywall_shown', { source: source ?? 'unknown' });
    }
  }, [visible, source]);

  const annualPkg = offering?.availablePackages.find(
    (p) => p.packageType === PACKAGE_TYPE.ANNUAL,
  );
  const monthlyPkg = offering?.availablePackages.find(
    (p) => p.packageType === PACKAGE_TYPE.MONTHLY,
  );

  const selectedPkg: PurchasesPackage | undefined =
    selectedPlan === 'annual' ? annualPkg : monthlyPkg;

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    lightHaptic();
    analytics.track('paywall_purchase_initiated', { plan: selectedPlan, source: source ?? 'unknown' });
    try {
      const result = await subscribe(selectedPkg);
      if (result.isPremium) {
        analytics.track('subscription_started', { plan: selectedPlan, source: source ?? 'unknown' });
        onSubscribed?.();
        onClose();
      }
    } catch {
      analytics.track('paywall_purchase_failed', { plan: selectedPlan, source: source ?? 'unknown' });
      Alert.alert(t('purchaseError'));
    }
  };

  const handleRestore = async () => {
    lightHaptic();
    analytics.track('restore_purchases_tapped');
    try {
      const restored = await restore();
      if (restored) {
        analytics.track('restore_purchases_result', { found: true });
        Alert.alert(t('restoreSuccess'));
        onSubscribed?.();
        onClose();
      } else {
        analytics.track('restore_purchases_result', { found: false });
        Alert.alert(t('restoreNotFound'));
      }
    } catch {
      analytics.track('restore_purchases_result', { found: false });
      Alert.alert(t('restoreNotFound'));
    }
  };

  const benefits = [
    t('benefits.unlimitedOracle'),
    t('benefits.unlimitedSiamSi'),
    t('benefits.memory'),
    t('benefits.tarot'),
  ];

  const busy = isPurchasing || isRestoring;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={() => { analytics.track('paywall_dismissed', { source: source ?? 'unknown' }); onClose(); }} hitSlop={16}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Star icon */}
          <View style={styles.iconContainer}>
            <StarIcon size={40} color={colors.gold.DEFAULT} />
          </View>

          {/* Title & subtitle */}
          <Text style={styles.title}>{t('title')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>

          {/* Benefits list */}
          <View style={styles.benefitsCard}>
            {benefits.map((benefit, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={styles.benefitStar}>✦</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <View style={styles.planRow}>
            {/* Annual */}
            <Pressable
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => { lightHaptic(); setSelectedPlan('annual'); analytics.track('paywall_plan_selected', { plan: 'annual' }); }}
            >
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{t('annual.badge')}</Text>
              </View>
              <Text style={styles.planLabel}>{t('annual.label')}</Text>
              <Text style={styles.planPrice}>{annualPkg?.product.priceString ?? '—'}</Text>
            </Pressable>

            {/* Monthly */}
            <Pressable
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => { lightHaptic(); setSelectedPlan('monthly'); analytics.track('paywall_plan_selected', { plan: 'monthly' }); }}
            >
              <Text style={styles.planLabel}>{t('monthly.label')}</Text>
              <Text style={styles.planPrice}>{monthlyPkg?.product.priceString ?? '—'}</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <GoldButton
            title={busy ? '' : t('cta')}
            onPress={handlePurchase}
            fullWidth
            rounded
            disabled={busy || !selectedPkg}
          />
          {busy && (
            <ActivityIndicator
              color={colors.gold.DEFAULT}
              style={styles.spinner}
            />
          )}

          {/* Auto-renewal disclosure */}
          <Text style={styles.disclosureText}>
            {t('autoRenewDisclosure', {
              price: selectedPkg?.product.priceString ?? '',
            })}
          </Text>

          {/* Footer links */}
          <View style={styles.footer}>
            <Pressable onPress={handleRestore} disabled={busy}>
              <Text style={styles.footerLink}>{t('restore')}</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://www.mordoo.app/terms.html')}>
              <Text style={styles.footerLink}>{t('terms')}</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://www.mordoo.app/privacy.html')}>
              <Text style={styles.footerLink}>{t('privacy')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  closeBtn: {
    position: 'absolute',
    top: scale(56),
    right: scale(20),
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: colors.parchment.muted,
  },
  scrollContent: {
    paddingHorizontal: scale(28),
    paddingTop: scale(80),
    paddingBottom: scale(40),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: scale(20),
  },
  title: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes['2xl'],
    color: colors.gold.DEFAULT,
    textAlign: 'center',
    marginBottom: scale(12),
  },
  subtitle: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    color: colors.parchment.dim,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: scale(28),
    paddingHorizontal: scale(8),
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: colors.night.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold.border,
    padding: scale(20),
    gap: scale(14),
    marginBottom: scale(28),
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  benefitStar: {
    fontSize: 14,
    color: colors.gold.DEFAULT,
  },
  benefitText: {
    fontFamily: fonts.body.medium,
    fontSize: fontSizes.base,
    color: colors.parchment.DEFAULT,
    flex: 1,
  },
  planRow: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
    marginBottom: scale(28),
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.night.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold.border,
    padding: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
  },
  planCardSelected: {
    borderColor: colors.gold.DEFAULT,
    borderWidth: 2,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
  },
  badgeContainer: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: scale(4),
  },
  badgeText: {
    fontFamily: fonts.display.bold,
    fontSize: 10,
    color: colors.onPrimary,
    letterSpacing: 1,
  },
  planLabel: {
    fontFamily: fonts.display.regular,
    fontSize: fontSizes.sm,
    color: colors.parchment.dim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planPrice: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.lg,
    color: colors.parchment.DEFAULT,
  },
  planPerMonth: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.gold.light,
  },
  spinner: {
    marginTop: scale(12),
  },
  disclosureText: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.parchment.muted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: scale(16),
    paddingHorizontal: scale(8),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(24),
    marginTop: scale(20),
  },
  footerLink: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.parchment.muted,
    textDecorationLine: 'underline',
  },
});
