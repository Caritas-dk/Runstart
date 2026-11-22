import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../ui/components';
import { C, F } from '../../ui/theme';
import { useT } from '../../store/store';

export default function TabsLayout() {
  const { t } = useT();
  const ins = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.navy },
        tabBarStyle: { backgroundColor: C.deep, borderTopColor: C.line, height: 62 + ins.bottom, paddingTop: 6 },
        tabBarActiveTintColor: C.lime,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontFamily: F.semibold, fontSize: 11 },
      }}>
      <Tabs.Screen name="index" options={{ title: t('nav_home'), tabBarIcon: ({ color }) => <Icon name="home" color={String(color)} /> }} />
      <Tabs.Screen name="programs" options={{ title: t('nav_programs'), tabBarIcon: ({ color }) => <Icon name="programs" color={String(color)} /> }} />
      <Tabs.Screen name="history" options={{ title: t('nav_history'), tabBarIcon: ({ color }) => <Icon name="history" color={String(color)} /> }} />
      <Tabs.Screen name="settings" options={{ title: t('nav_settings'), tabBarIcon: ({ color }) => <Icon name="settings" color={String(color)} /> }} />
    </Tabs>
  );
}
