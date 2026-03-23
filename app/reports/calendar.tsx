import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();

  const events = [
    { title: 'LSX Quarterly Report (Banks)', date: '25 Mar 2026', type: 'Earnings', icon: 'bank' },
    { title: 'Lao New Year (Market Closed)', date: '14-16 Apr 2026', type: 'Holiday', icon: 'leaf' },
    { title: 'BOL Interest Rate Meeting', date: '22 Apr 2026', type: 'Policy', icon: 'finance' },
    { title: 'BCEL General Shareholder Meeting', date: '05 May 2026', type: 'Meeting', icon: 'account-group' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Economic Calendar', 
        headerShown: true, 
        headerTransparent: true, 
        headerTintColor: colors.text,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 40 }}>
        <Text style={[styles.title, { color: colors.text, paddingHorizontal: 20 }]}>Upcoming Market Events</Text>
        <View style={styles.eventGrid}>
          {events.map((e, idx) => (
            <View key={idx} style={[styles.eventCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
              <View style={[styles.iconBox, { backgroundColor: '#0a7ea410' }]}>
                <MaterialCommunityIcons name={e.icon as any} size={24} color="#0a7ea4" />
              </View>
              <View style={styles.eventInfo}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{e.title}</Text>
                <View style={styles.eventBottom}>
                  <Text style={[styles.eventDate, { color: colors.icon }]}>{e.date}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{e.type}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 24 },
  eventGrid: { paddingHorizontal: 20, gap: 12 },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '800' },
  eventBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  eventDate: { fontSize: 13, fontWeight: '700' },
  badge: { backgroundColor: '#0a7ea4' , paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});
