import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StockData } from '@/services/stockService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TopGainersProps {
  stocks: StockData[];
}

export function TopGainers({ stocks }: TopGainersProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const gainers = stocks
    .filter(s => s.change > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4);

  if (gainers.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Top Gainers (Laos)</Text>
        <MaterialCommunityIcons name="trending-up" size={20} color="#2E7D32" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {gainers.map((stock) => (
          <TouchableOpacity
            key={stock.id}
            onPress={() => router.push({ pathname: '/stock/[id]', params: { ...stock } })}
            style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}
          >
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logo}>{stock.logo}</Text>
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>+{stock.changePercent}%</Text>
              </View>
            </View>
            <Text style={[styles.ticker, { color: colors.text }]}>{stock.ticker}</Text>
            <Text style={[styles.price, { color: colors.text }]}>
              {stock.price.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 12,
  },
  card: {
    width: 140,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
  },
  percentBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  percentText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '800',
  },
  ticker: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    opacity: 0.9,
  },
});
