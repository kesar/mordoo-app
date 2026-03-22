import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StarIcon, OracleHeartIcon } from '@/src/components/icons/TarotIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { lightHaptic } from '@/src/utils/haptics';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export default function MainLayout() {
  const { t } = useTranslation();

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
          paddingHorizontal: 48,
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
    name === 'pulse' ? (
      <StarIcon size={size} color={color} />
    ) : name === 'oracle' ? (
      <OracleHeartIcon size={size} color={color} />
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
