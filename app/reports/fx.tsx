import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function CurrencyReportScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();

  const fxData = [
    { value: 21100, label: '01/03' },
    { value: 21250, label: '07/03' },
    { value: 21380, label: '14/03' },
    { value: 21450, label: '21/03' },
  ];

  const pairs = [
    { code: 'USD/LAK', rate: '21,450', high: '21,580', low: '21,300', trend: '+0.12%', isUp: true },
    { code: 'THB/LAK', rate: '615.42', high: '620.10', low: '612.05', trend: '-0.05%', isUp: false },
    { code: 'CNY/LAK', rate: '2,980.12', high: '3,010.00', low: '2,950.45', trend: '+0.08%', isUp: true },
    { code: 'EUR/LAK', rate: '23,120.45', high: '23,450', low: '22,900', trend: '-0.21%', isUp: false },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'FX Report', 
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
        <View style={styles.chartSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>USD / LAK Trend (30D)</Text>
          <View style={styles.chartBox}>
            <LineChart
              areaChart
              data={fxData}
              width={width - 64}
              height={180}
              spacing={width / 5}
              color1="#0a7ea4"
              startFillColor="#0a7ea4"
              startOpacity={0.2}
              endOpacity={0.05}
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              curved
              yAxisTextStyle={{ color: colors.icon, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.icon, fontSize: 10 }}
            />
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Daily Exchange Rates</Text>
          {pairs.map((p, idx) => (
            <View key={idx} style={[styles.fxCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
              <View style={styles.fxLeft}>
                <Text style={[styles.fxCode, { color: colors.text }]}>{p.code}</Text>
                <Text style={[styles.fxRate, { color: colors.icon }]}>{p.rate}</Text>
              </View>
              <View style={styles.fxRight}>
                <View style={[styles.trendBadge, { backgroundColor: p.isUp ? '#E8F5E9' : '#FFEBEE' }]}>
                  <Text style={[styles.trendText, { color: p.isUp ? '#2E7D32' : '#C62828' }]}>{p.trend}</Text>
                </View>
                <Text style={styles.lowHigh}>L:{p.low} H:{p.high}</Text>
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
  chartSection: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  chartBox: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  listSection: { paddingHorizontal: 20 },
  fxCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    marginBottom: 12,
  },
  fxLeft: { flex: 1 },
  fxCode: { fontSize: 17, fontWeight: '800' },
  fxRate: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  fxRight: { alignItems: 'flex-end' },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 12, fontWeight: '800' },
  lowHigh: { fontSize: 10, marginTop: 6, opacity: 0.5 },
});
