import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Tabs } from 'expo-router';
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
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </Svg>
    ) : name === 'oracle' ? (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </Svg>
    ) : (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z" />
      </Svg>
    );
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
  icon: {
    fontSize: 22,
  },
});
