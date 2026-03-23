import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { StockCard } from './StockCard';
import { StockData } from '@/services/stockService';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StockListProps {
  stocks: StockData[];
  type: 'LAO' | 'FOREIGN';
  onTypeChange: (type: 'LAO' | 'FOREIGN') => void;
  loading?: boolean;
}

export function StockList({ stocks, type, onTypeChange, loading }: StockListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            type === 'LAO' && { backgroundColor: '#0a7ea4' },
          ]}
          onPress={() => onTypeChange('LAO')}>
          <Text
            style={[
              styles.tabText,
              { color: type === 'LAO' ? '#fff' : colors.icon },
            ]}>
            Lao Stocks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            type === 'FOREIGN' && { backgroundColor: '#0a7ea4' },
          ]}
          onPress={() => onTypeChange('FOREIGN')}>
          <Text
            style={[
              styles.tabText,
              { color: type === 'FOREIGN' ? '#fff' : colors.icon },
            ]}>
            Foreign Stocks
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stocks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StockCard stock={item} />}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>Loading markets...</Text>
          ) : (
            <Text style={[styles.emptyText, { color: colors.icon }]}>No data available</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#0a7ea410',
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontWeight: '500',
  },
});

