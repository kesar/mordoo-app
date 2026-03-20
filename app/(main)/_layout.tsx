import { View, Text as RNText, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { lightHaptic } from '@/src/utils/haptics';

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
          paddingTop: 12,
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

function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const icons: Record<string, string> = {
    pulse: '✦',
    oracle: '♡',
  };
  return (
    <View style={tabStyles.iconWrap}>
      <RNText style={[tabStyles.icon, { color }]}>{icons[name] || '●'}</RNText>
      {focused && <View style={tabStyles.activeIndicator} />}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  activeIndicator: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gold.light,
    marginTop: 2,
    shadowColor: colors.gold.light,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
});
