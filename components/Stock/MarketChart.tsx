import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchLaoMarketIndex } from '@/services/stockService';

const { width } = Dimensions.get('window');

const RANGES = [
  { label: 'Weekly', value: '1W', count: 7 },
  { label: 'Monthly', value: '1M', count: 25 },
  { label: 'Yearly', value: '1Y', count: 250 }
];

export function MarketChart() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const [data, setData] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState('1M');

  const loadIndex = async (rangeValue: string) => {
    setLoading(true);
    const range = RANGES.find(r => r.value === rangeValue);
    const indexData = await fetchLaoMarketIndex(range?.count);
    if (indexData.length > 0) {
      setData(indexData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadIndex('1M');
  }, []);

  const latest = data[data.length - 1];
  const first = data[0];
  const isUp = latest && first ? latest.value >= first.value : true;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.icon }]}>Market Index (LSX)</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {latest?.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '--'}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isUp ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={[styles.badgeText, { color: isUp ? '#2E7D32' : '#C62828' }]}>
            {isUp ? '+' : '-'}{latest && first ? Math.abs(((latest.value - first.value) / first.value) * 100).toFixed(2) : '0.00'}%
          </Text>
        </View>
      </View>

      <View style={styles.rangeSelector}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.value}
            onPress={() => {
              setActiveRange(r.value);
              loadIndex(r.value);
            }}
            style={[
              styles.rangeButton,
              activeRange === r.value && { backgroundColor: '#0a7ea4' }
            ]}
          >
            <Text style={[
              styles.rangeText,
              { color: activeRange === r.value ? '#fff' : colors.icon }
            ]}>
              {r.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      ) : (
        <LineChart
          areaChart
          data={data}
          width={width - 80}
          height={180}
          spacing={(width - 100) / data.length}
          color1={isUp ? "#2E7D32" : "#C62828"}
          startFillColor={isUp ? "#2E7D32" : "#C62828"}
          endFillColor={isUp ? "#E8F5E9" : "#FFEBEE"}
          startOpacity={0.4}
          endOpacity={0.1}
          initialSpacing={10}
          noOfSections={4}
          yAxisThickness={0}
          xAxisThickness={0}
          hideDataPoints
          curved
          hideRules
          yAxisTextStyle={{ color: colors.icon, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.icon, fontSize: 10 }}
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 2,
            pointerColor: 'lightgray',
            radius: 6,
            pointerLabelComponent: (items: any) => {
              return (
                <View style={styles.pointerLabel}>
                  <Text style={styles.pointerText}>{items[0].value.toFixed(2)}</Text>
                </View>
              );
            },
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#0a7ea410',
    overflow: 'hidden',
    minHeight: 320,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    marginTop: 10,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#00000008',
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pointerLabel: {
    backgroundColor: '#333',
    padding: 6,
    borderRadius: 8,
  },
  pointerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
