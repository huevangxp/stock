import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LineChart } from 'react-native-gifted-charts';
import { fetchGoldPrice } from '@/services/stockService';

const { width } = Dimensions.get('window');
const LAK_RATE = 21450; // Fixed exchange rate for conversion

export default function CommodityReportScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();

  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrice = async () => {
      const price = await fetchGoldPrice();
      if (price > 0) setLivePrice(price);
      setLoading(false);
    };
    loadPrice();
  }, []);

  const goldData = [
    { value: 2420, label: '01/03' },
    { value: 2435, label: '07/03' },
    { value: 2445, label: '14/03' },
    { value: livePrice || 2450.50, label: 'Now' },
  ];

  const priceLAK = livePrice ? livePrice * LAK_RATE : 0;
  // Standard Lao Gold units (Estimated)
  const priceBahtLAK = priceLAK * (15.244 / 31.1035); // 1 Baht = 15.244g. 1 Oz = 31.1035g.

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Gold Reports', 
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
          <View style={styles.spotRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Global Gold (Spot)</Text>
            {loading ? (
              <ActivityIndicator color="#0a7ea4" size="small" />
            ) : (
              <Text style={[styles.liveValue, { color: '#FFB300' }]}>
                ${livePrice?.toLocaleString()}
              </Text>
            )}
          </View>
          
          <View style={styles.chartBox}>
            <LineChart
              areaChart
              data={goldData}
              width={width - 64}
              height={180}
              spacing={width / 5}
              color1="#FFB300"
              startFillColor="#FFB300"
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

        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 20 }]}>Commercial Pricing (LAK)</Text>
          <View style={styles.grid}>
             <GoldCard 
                name="Gold Price (Ounce)" 
                price={`₭ ${priceLAK.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                unit="LAK / oz" 
                subText={`$${livePrice?.toLocaleString()} Market`} 
                colors={colors} 
                colorScheme={colorScheme} 
             />
             <GoldCard 
                name="Gold Price (Baht)" 
                price={`₭ ${priceBahtLAK.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                unit="LAK / 15.2g" 
                subText="Standard Lao Unit" 
                colors={colors} 
                colorScheme={colorScheme} 
             />
          </View>

          <View style={[styles.converterCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
             <MaterialCommunityIcons name="calculator-variant" size={24} color="#FFB300" style={{ marginBottom: 12 }} />
             <Text style={[styles.convTitle, { color: colors.text }]}>Kip Exchange Estimate</Text>
             <Text style={[styles.convDesc, { color: colors.icon }]}>Based on current bank rate: 1 USD ≈ {LAK_RATE.toLocaleString()} LAK</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function GoldCard({ name, price, unit, subText, colors, colorScheme }: any) {
  return (
    <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
      <Text style={[styles.cardName, { color: colors.icon }]}>{name}</Text>
      <Text style={[styles.cardPrice, { color: colors.text }]}>{price}</Text>
      <View style={styles.cardBottom}>
        <Text style={[styles.cardUnit, { color: colors.icon }]}>{unit}</Text>
        <Text style={[styles.cardSub, { color: '#FFB300' }]}>{subText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chartSection: { padding: 20 },
  spotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  liveValue: { fontSize: 28, fontWeight: '900' },
  chartBox: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statsSection: { paddingHorizontal: 20 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, padding: 20, borderRadius: 28 },
  cardName: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, opacity: 0.7 },
  cardPrice: { fontSize: 18, fontWeight: '900' },
  cardBottom: { marginTop: 10 },
  cardUnit: { fontSize: 10, fontWeight: '600', opacity: 0.6 },
  cardSub: { fontSize: 10, fontWeight: '800', marginTop: 4 },
  converterCard: {
    padding: 24,
    borderRadius: 32,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.2)',
  },
  convTitle: { fontSize: 17, fontWeight: '800' },
  convDesc: { fontSize: 12, fontWeight: '600', marginTop: 4, opacity: 0.6 },
});
