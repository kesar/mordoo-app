import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { Text } from '@/src/components/ui/Text';
import { OracleHeartIcon, BambooIcon, ArrowRightIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';
import { fetchUserProfile } from '@/src/services/profile';
import { useAuthStore } from '@/src/stores/authStore';
import { getDailyProverb } from '@/src/constants/thai-proverbs';
import { lightHaptic } from '@/src/utils/haptics';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreetingKey(): 'greeting.morning' | 'greeting.afternoon' | 'greeting.evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'greeting.morning';
  if (hour < 17) return 'greeting.afternoon';
  return 'greeting.evening';
}

function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getFirstName(fullName: string | null | undefined): string | null {
  if (!fullName) return null;
  return fullName.trim().split(' ')[0] ?? null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProverbCard({ dateStr }: { dateStr: string }) {
  const { t, i18n } = useTranslation('home');
  const proverb = useMemo(() => getDailyProverb(dateStr), [dateStr]);
  const isThai = i18n.language === 'th';

  return (
    <View style={styles.proverbCard}>
      <Text style={styles.proverbLabel}>{t('proverb.label')}</Text>
      <View style={styles.proverbDivider} />
      <Text style={styles.proverbTh}>{proverb.th}</Text>
      {!isThai && (
        <Text style={styles.proverbEn}>{proverb.en}</Text>
      )}
      <View style={styles.proverbMeaningRow}>
        <View style={styles.proverbMeaningDot} />
        <Text style={styles.proverbMeaning}>
          {isThai ? proverb.meaningTh : proverb.meaning}
        </Text>
      </View>
      <Text style={styles.proverbAttribution}>{t('proverb.attribution')}</Text>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
      onPress={() => { lightHaptic(); onPress(); }}
    >
      <View style={styles.actionIconWrap}>{icon}</View>
      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{description}</Text>
      </View>
      <ArrowRightIcon size={18} color={colors.gold.muted.replace('0.15', '0.6')} />
    </Pressable>
  );
}

function CultureCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.cultureCard}>
      <Text style={styles.cultureTitle}>{title}</Text>
      <View style={styles.cultureDivider} />
      <Text style={styles.cultureBody}>{body}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const { t } = useTranslation('home');
  const userId = useAuthStore((s) => s.userId);
  const dateStr = useMemo(() => getTodayDateStr(), []);
  const greetingKey = useMemo(() => getGreetingKey(), []);

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: fetchUserProfile,
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });

  const firstName = getFirstName(profile?.fullName);
  const greeting = t(greetingKey);
  const greetingDisplay = firstName ? `${greeting}, ${firstName}` : greeting;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{greetingDisplay}</Text>
          <View style={styles.greetingUnderline} />
        </View>

        {/* Daily Proverb */}
        <ProverbCard dateStr={dateStr} />

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <ActionCard
            icon={<OracleHeartIcon size={28} color={colors.gold.DEFAULT} />}
            title={t('actions.askOracle')}
            description={t('actions.askOracleDesc')}
            onPress={() => router.push('/(main)/oracle')}
          />
          <ActionCard
            icon={<BambooIcon size={28} color={colors.gold.DEFAULT} />}
            title={t('actions.drawStick')}
            description={t('actions.drawStickDesc')}
            onPress={() => router.push('/(main)/oracle/siam-si')}
          />
        </View>

        {/* Cultural Education */}
        <View style={styles.cultureSection}>
          <CultureCard
            title={t('culture.siamSiTitle')}
            body={t('culture.siamSiBody')}
          />
          <CultureCard
            title={t('culture.mordooTitle')}
            body={t('culture.mordooBody')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },

  // ---- Greeting ----
  greetingSection: {
    gap: 8,
  },
  greetingText: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes['2xl'],
    color: colors.parchment.DEFAULT,
    letterSpacing: 0.5,
  },
  greetingUnderline: {
    width: 48,
    height: 2,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 1,
    opacity: 0.7,
  },

  // ---- Proverb Card ----
  proverbCard: {
    backgroundColor: colors.surface.containerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold.border,
    padding: 20,
    gap: 10,
  },
  proverbLabel: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.xs,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
  },
  proverbDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gold.border,
  },
  proverbTh: {
    fontFamily: fonts.thai.medium,
    fontSize: fontSizes.xl,
    color: colors.parchment.DEFAULT,
    lineHeight: 32,
  },
  proverbEn: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.base,
    color: colors.parchment.dim,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  proverbMeaningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 2,
  },
  proverbMeaningDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold.DEFAULT,
    marginTop: 8,
    opacity: 0.7,
  },
  proverbMeaning: {
    flex: 1,
    fontFamily: fonts.body.medium,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  proverbAttribution: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.xs,
    color: 'rgba(201,168,76,0.45)',
    textAlign: 'right',
    letterSpacing: 0.5,
  },

  // ---- Actions ----
  actionsSection: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.containerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  actionCardPressed: {
    opacity: 0.75,
    backgroundColor: colors.surface.container,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gold.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.base,
    color: colors.parchment.DEFAULT,
    letterSpacing: 0.3,
  },
  actionDesc: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
  },

  // ---- Culture Cards ----
  cultureSection: {
    gap: 16,
  },
  cultureCard: {
    backgroundColor: colors.surface.containerLowest,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201,168,76,0.12)',
    padding: 18,
    gap: 10,
  },
  cultureTitle: {
    fontFamily: fonts.display.bold,
    fontSize: fontSizes.xs,
    color: colors.gold.DEFAULT,
    letterSpacing: 2.5,
    opacity: 0.85,
  },
  cultureDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  cultureBody: {
    fontFamily: fonts.body.regular,
    fontSize: fontSizes.sm,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
});
