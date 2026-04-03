import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StarIcon, OracleHeartIcon, ProfileIcon } from '@/src/components/icons/TarotIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { lightHaptic } from '@/src/utils/haptics';
import { useFeatureFlagStore } from '@/src/stores/featureFlagStore';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export default function MainLayout() {
  const { t } = useTranslation();
  const dailyPulse = useFeatureFlagStore((s) => s.dailyPulse);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,20,0.95)',
          borderTopColor: 'rgba(201,168,76,0.25)',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 32,
          paddingTop: 0,
          paddingHorizontal: 24,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: 'absolute',
          elevation: 0,
          shadowColor: colors.gold.DEFAULT,
          shadowOffset: { width: 0, height: -15 },
          shadowOpacity: 0.12,
          shadowRadius: 50,
        },
        tabBarActiveTintColor: colors.gold.light,
        tabBarInactiveTintColor: 'rgba(201,168,76,0.5)',
        tabBarLabelStyle: {
          fontFamily: fonts.thai.medium,
          fontSize: 10,
          letterSpacing: 3,
          textTransform: 'uppercase',
        },
        tabBarButton: (props: BottomTabBarButtonProps) => <TabButton {...props} />,
      }}
    >
      {dailyPulse ? (
        <Tabs.Screen
          name="pulse"
          listeners={{ tabPress: () => lightHaptic() }}
          options={{
            title: t('tabs.pulse'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="pulse" color={color} focused={focused} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="home"
          listeners={{ tabPress: () => lightHaptic() }}
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
      )}
      {dailyPulse ? (
        <Tabs.Screen name="home" options={{ href: null }} />
      ) : (
        <Tabs.Screen name="pulse" options={{ href: null }} />
      )}
      <Tabs.Screen
        name="oracle"
        listeners={{ tabPress: () => lightHaptic() }}
        options={{
          title: t('tabs.oracle'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="oracle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{ tabPress: () => lightHaptic() }}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabButton({ children, accessibilityState, onPress, style }: BottomTabBarButtonProps) {
  const selected = accessibilityState?.selected ?? false;
  return (
    <Pressable
      onPress={onPress}
      style={[
        style,
        tabStyles.tabButton,
        selected && tabStyles.tabButtonActive,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      {children}
    </Pressable>
  );
}

function TabIcon({ name, color }: { name: string; color: string; focused: boolean }) {
  const size = 22;
  const icon =
    name === 'pulse' || name === 'home' ? (
      <StarIcon size={size} color={color} />
    ) : name === 'oracle' ? (
      <OracleHeartIcon size={size} color={color} />
    ) : name === 'profile' ? (
      <ProfileIcon size={size} color={color} />
    ) : null;
  return <View style={tabStyles.iconWrap}>{icon}</View>;
}

const tabStyles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
