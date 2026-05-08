import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          elevation: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        sceneStyle: { backgroundColor: '#FFFFFF' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="view-dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="chart-line" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="map-marker-radius-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
