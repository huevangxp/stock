import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StockData } from '@/services/stockService';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

interface StockCardProps {
  stock: StockData;
}

export function StockCard({ stock }: StockCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();
  
  const isPositive = stock.change >= 0;

  const handlePress = () => {
    router.push({
      pathname: "/stock/[id]",
      params: { 
        id: stock.id,
        name: stock.name,
        ticker: stock.ticker,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        logo: stock.logo,
        icode: stock.icode
      }
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={[styles.logoContainer, { backgroundColor: colorScheme === 'dark' ? '#2A2D30' : '#EDF2F7' }]}>
          <Text style={styles.logo}>{stock.logo}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.ticker, { color: colors.text }]} numberOfLines={1}>
            {stock.ticker}
          </Text>
          <Text style={[styles.name, { color: colors.icon }]} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.price, { color: colors.text }]}>
          {stock.price.toLocaleString()}
          <Text style={styles.currency}> LAK</Text>
        </Text>
        <View style={[styles.changeBadge, { backgroundColor: isPositive ? '#E8F5E930' : '#FFEBEE30' }]}>
          <MaterialCommunityIcons
            name={isPositive ? 'arrow-up-right' : 'arrow-down-left'}
            size={14}
            color={isPositive ? '#2E7D32' : '#C62828'}
          />
          <Text style={[styles.changePercent, { color: isPositive ? '#2E7D32' : '#C62828' }]}>
            {Math.abs(stock.changePercent)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
  },
  nameContainer: {
    marginLeft: 14,
    flex: 1,
  },
  ticker: {
    fontSize: 18,
    fontWeight: '800',
  },
  name: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  currency: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.6,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 6,
  },
  changePercent: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
});
