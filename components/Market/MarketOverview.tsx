import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { fetchGoldPrice } from '@/services/stockService';

export function MarketOverview() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const [liveGoldPrice, setLiveGoldPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGold = async () => {
      const price = await fetchGoldPrice();
      if (price > 0) setLiveGoldPrice(price);
      setLoading(false);
    };
    loadGold();
  }, []);

  const exchangeRates = [
    { pair: 'USD / LAK', rate: '21,450', change: '+0.15', isUp: true },
    { pair: 'THB / LAK', rate: '615.40', change: '-0.05', isUp: false },
    { pair: 'CNY / LAK', rate: '2,980', change: '+0.10', isUp: true },
  ];

  const commodities = [
    { 
      name: 'Gold (Spot)', 
      price: liveGoldPrice ? liveGoldPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '2,450.50', 
      unit: 'USD/oz', 
      change: '+1.20%', 
      isUp: true, 
      icon: 'gold',
      loading: loading && !liveGoldPrice 
    },
    { name: 'Sinium (Lao)', price: '45,200', unit: 'LAK/kg', change: '-0.42%', isUp: false, icon: 'mine' },
    { name: 'Fuel (Diesel)', price: '19,450', unit: 'LAK/L', change: '0.00%', isUp: true, icon: 'gas-station' },
  ];

  return (
    <View style={styles.container}>
      {/* Exchange Rate Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Currency Exchange</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>BCEL Rates</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.fxScrollContent}
      >
        {exchangeRates.map((item, index) => (
          <View key={index} style={[styles.fxCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
            <Text style={[styles.fxPair, { color: colors.icon }]}>{item.pair}</Text>
            <Text style={[styles.fxRate, { color: colors.text }]}>{item.rate}</Text>
            <View style={[styles.miniBadge, { backgroundColor: item.isUp ? '#E8F5E950' : '#FFEBEE50' }]}>
              <Text style={[styles.changeText, { color: item.isUp ? '#2E7D32' : '#C62828' }]}>
                {item.change}%
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Commodities Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gold & Commodities</Text>
      </View>
      <View style={styles.commodityGrid}>
        {commodities.map((item, index) => (
          <View key={index} style={[styles.commodityItem, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
            <View style={styles.commodityTop}>
              <View style={[styles.iconBox, { backgroundColor: item.isUp ? '#E8F5E950' : '#FFEBEE50' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={item.isUp ? '#2E7D32' : '#C62828'} />
              </View>
              <View style={[styles.trendDot, { backgroundColor: item.isUp ? '#2E7D32' : '#C62828' }]} />
            </View>
            <Text style={[styles.commodityName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            {item.loading ? (
              <ActivityIndicator size="small" color="#0a7ea4" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            ) : (
              <Text style={[styles.commodityPrice, { color: colors.text }]}>{item.price}</Text>
            )}
            <Text style={[styles.commodityUnit, { color: colors.icon }]}>{item.unit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a7ea4',
  },
  fxScrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 12,
  },
  fxCard: {
    width: 130,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  fxPair: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  fxRate: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  commodityGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  commodityItem: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  commodityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  commodityName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  commodityPrice: {
    fontSize: 17,
    fontWeight: '800',
  },
  commodityUnit: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.7,
  },
});
