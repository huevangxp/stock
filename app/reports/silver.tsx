import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LineChart } from 'react-native-gifted-charts';
import { fetchSilverPrice } from '@/services/stockService';

const { width } = Dimensions.get('window');
const LAK_RATE = 21450; // Fixed exchange rate for conversion

export default function SilverReportScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();

  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrice = async () => {
      const price = await fetchSilverPrice();
      if (price > 0) setLivePrice(price);
      setLoading(false);
    };
    loadPrice();
  }, []);

  const silverData = [
    { value: 24.20, label: '01/03' },
    { value: 24.35, label: '07/03' },
    { value: 24.45, label: '14/03' },
    { value: livePrice || 24.50, label: 'Now' },
  ];

  const priceLAK = livePrice ? livePrice * LAK_RATE : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Silver Reports', 
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Global Silver (Spot)</Text>
            {loading ? (
              <ActivityIndicator color="#A0AEC0" size="small" />
            ) : (
              <Text style={[styles.liveValue, { color: '#94A3B8' }]}>
                ${livePrice?.toLocaleString()}
              </Text>
            )}
          </View>
          
          <View style={styles.chartBox}>
            <LineChart
              areaChart
              data={silverData}
              width={width - 64}
              height={180}
              spacing={width / 5}
              color1="#94A3B8"
              startFillColor="#94A3B8"
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
             <MetalCard 
                name="Silver (Ounce)" 
                price={`₭ ${priceLAK.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                unit="LAK / oz" 
                subText={`$${livePrice?.toLocaleString()} Spot`} 
                colors={colors} 
                colorScheme={colorScheme} 
             />
             <MetalCard 
                name="Silver (Gram)" 
                price={`₭ ${(priceLAK / 31.1035).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                unit="LAK / g" 
                subText="Fine Silver" 
                colors={colors} 
                colorScheme={colorScheme} 
             />
          </View>

          <View style={[styles.converterCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
             <MaterialCommunityIcons name="blur" size={24} color="#94A3B8" style={{ marginBottom: 12 }} />
             <Text style={[styles.convTitle, { color: colors.text }]}>Silver Market Logic</Text>
             <Text style={[styles.convDesc, { color: colors.icon }]}>Exchange rate: 1 USD ≈ {LAK_RATE.toLocaleString()} LAK. Prices are updated in real-time.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetalCard({ name, price, unit, subText, colors, colorScheme }: any) {
  return (
    <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
      <Text style={[styles.cardName, { color: colors.icon }]}>{name}</Text>
      <Text style={[styles.cardPrice, { color: colors.text }]}>{price}</Text>
      <View style={styles.cardBottom}>
        <Text style={[styles.cardUnit, { color: colors.icon }]}>{unit}</Text>
        <Text style={[styles.cardSub, { color: '#94A3B8' }]}>{subText}</Text>
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
    borderColor: 'rgba(148,163,184,0.3)',
  },
  convTitle: { fontSize: 17, fontWeight: '800' },
  convDesc: { fontSize: 12, fontWeight: '600', marginTop: 4, opacity: 0.6 },
});
