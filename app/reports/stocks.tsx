import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MarketChart } from '@/components/Stock/MarketChart';
import { StockList } from '@/components/Stock/StockList';
import { useStocks } from '@/hooks/use-stocks';

export default function StockReportScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();

  const [activeType, setActiveType] = useState<'LAO' | 'FOREIGN'>('LAO');
  const { laoStocks, foreignStocks, loading, refreshing, onRefresh } = useStocks();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'LSX Market Report', 
        headerShown: true, 
        headerTransparent: true, 
        headerTintColor: colors.text,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView 
        contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={[styles.title, { color: colors.text }]}>LSX Composite Index</Text>
          <MarketChart />
        </View>

        <View style={styles.section}>
          <Text style={[styles.title, { color: colors.text, marginBottom: 16, paddingHorizontal: 20 }]}>Full Listing Status</Text>
          <StockList 
            stocks={activeType === 'LAO' ? laoStocks : foreignStocks} 
            type={activeType}
            onTypeChange={setActiveType}
            loading={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginVertical: 12 },
  title: { fontSize: 22, fontWeight: '900', paddingHorizontal: 20 },
});
