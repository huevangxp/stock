import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchStockHistory, DailyPrice } from '@/services/stockService';
import { LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function StockDetailsScreen() {
  const { id, name, ticker, price, change, changePercent, logo, icode } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const [history, setHistory] = useState<{ value: number; label: string; fullData: DailyPrice }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState(30);

  const isPositive = Number(change) >= 0;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await fetchStockHistory(icode as string, activeRange);
      setHistory(data);
      setLoading(false);
    };
    if (icode) loadHistory();
  }, [icode, activeRange]);

  const stats = history.length > 0 ? history[history.length - 1].fullData : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: ticker as string,
          headerTransparent: true,
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 40 }}>
        {/* Modern Header Card */}
        <View style={styles.headerSection}>
          <View style={[styles.mainCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
            <View style={styles.topRow}>
              <View style={[styles.logoCircle, { backgroundColor: colorScheme === 'dark' ? '#2A2D30' : '#EDF2F7' }]}>
                <Text style={styles.logoEmoji}>{logo}</Text>
              </View>
              <View style={styles.nameBlock}>
                <Text style={[styles.stockName, { color: colors.text }]}>{name}</Text>
                <Text style={[styles.stockTicker, { color: colors.icon }]}>{ticker}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={[styles.currentPrice, { color: colors.text }]}>
                  {Number(price).toLocaleString()}
                  <Text style={styles.currencySmall}> LAK</Text>
                </Text>
                <View style={styles.changeMiniRow}>
                  <MaterialCommunityIcons 
                    name={isPositive ? "trending-up" : "trending-down"} 
                    size={16} 
                    color={isPositive ? "#2E7D32" : "#C62828"} 
                  />
                  <Text style={[styles.changeValue, { color: isPositive ? "#2E7D32" : "#C62828" }]}>
                    {isPositive ? '+' : ''}{change} ({changePercent}%)
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.tradeButton}>
                <Text style={styles.tradeButtonText}>Buy/Sell</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatBox label="Open" value={stats?.OPrice.toLocaleString()} color={colors.text} />
          <StatBox label="High" value={stats?.HPrice.toLocaleString()} color="#2E7D32" />
          <StatBox label="Low" value={stats?.LPrice.toLocaleString()} color="#C62828" />
          <StatBox label="Traded Volume" value={stats?.TVolume.toLocaleString()} color={colors.icon} />
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Price History</Text>
            <View style={styles.rangeOptions}>
              {[7, 30, 90].map(r => (
                <TouchableOpacity 
                  key={r} 
                  onPress={() => setActiveRange(r)}
                  style={[styles.rangePill, activeRange === r && { backgroundColor: '#0a7ea4' }]}
                >
                  <Text style={[styles.rangePillText, activeRange === r && { color: '#fff' }]}>
                    {r === 7 ? '1W' : r === 30 ? '1M' : '3M'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator color="#0a7ea4" size="large" />
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <LineChart
                areaChart
                data={history}
                width={width - 40}
                height={220}
                spacing={(width - 40) / history.length}
                color1={isPositive ? "#2E7D32" : "#C62828"}
                startFillColor={isPositive ? "#2E7D32" : "#C62828"}
                endFillColor={colorScheme === 'dark' ? '#1B1E21' : '#fff'}
                startOpacity={0.3}
                endOpacity={0.05}
                initialSpacing={10}
                noOfSections={5}
                yAxisThickness={0}
                xAxisThickness={0}
                hideDataPoints
                curved
                hideRules
                verticalLinesThickness={0}
                yAxisTextStyle={{ color: colors.icon, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.icon, fontSize: 10 }}
                pointerConfig={{
                  pointerStripHeight: 200,
                  pointerStripColor: 'rgba(0,0,0,0.1)',
                  pointerStripWidth: 2,
                  pointerColor: '#0a7ea4',
                  radius: 4,
                  pointerLabelComponent: (items: any) => (
                    <View style={styles.pointerLabel}>
                      <Text style={styles.pointerPrice}>{items[0].value.toLocaleString()}</Text>
                      <Text style={styles.pointerDate}>{items[0].fullData.ODate}</Text>
                    </View>
                  ),
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modern Bottom Bar */}
      <View style={[styles.bottomBar, { marginBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.secondaryButton}>
          <MaterialCommunityIcons name="heart-outline" size={20} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>watchlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Stock Market</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value?: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value ?? '--'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginLeft: 8,
  },
  headerSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mainCard: {
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoEmoji: {
    fontSize: 32,
  },
  nameBlock: {
    flex: 1,
  },
  stockName: {
    fontSize: 20,
    fontWeight: '800',
  },
  stockTicker: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 34,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  currencySmall: {
    fontSize: 16,
    opacity: 0.6,
  },
  changeMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  changeValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  tradeButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  tradeButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 16,
    borderRadius: 20,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  chartSection: {
    paddingHorizontal: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  rangeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  rangePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  rangePillText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
  },
  loadingArea: {
    height: 220,
    justifyContent: 'center',
  },
  chartContainer: {
    marginLeft: -20, // Adjust for Y-axis labels
  },
  pointerLabel: {
    backgroundColor: '#1B1E21',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 100,
  },
  pointerPrice: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  pointerDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  buttonText: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
  },
  primaryButton: {
    flex: 2,
    height: 56,
    backgroundColor: '#0a7ea4',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
  },
});
