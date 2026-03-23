import React from 'react';
import { StyleSheet, View, Text, StatusBar, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CollapsibleHeader } from '@/components/Stock/CollapsibleHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function MarketMenuScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const menuItems = [
    { 
      title: 'Currency Exchange', 
      desc: 'USD/LAK, THB, CNY Prices', 
      icon: 'currency-usd', 
      route: '/reports/fx', 
      color: '#0a7ea4' 
    },
    { 
      title: 'Gold & Commodities', 
      desc: 'Lao Gold & Resources', 
      icon: 'gold', 
      route: '/reports/gold', 
      color: '#FFB300' 
    },
    { 
      title: 'Silver Market', 
      desc: 'Global Spot & Local Price', 
      icon: 'blur', 
      route: '/reports/silver', 
      color: '#94A3B8' 
    },
    { 
      title: 'Oil Price (Fuel)', 
      desc: 'National Diesel & Benzin', 
      icon: 'gas-station', 
      route: '/reports/oil', 
      color: '#F43F5E' 
    },
    { 
      title: 'Stock Market', 
      desc: 'Daily LSX Performance', 
      icon: 'chart-areaspline', 
      route: '/reports/stocks', 
      color: '#48BB78' 
    },
    { 
      title: 'Economic Calendar', 
      desc: 'Events & Holiday Dates', 
      icon: 'calendar-clock', 
      route: '/reports/calendar', 
      color: '#A0AEC0' 
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <CollapsibleHeader scrollY={scrollY} userName="Market Reports" />
      
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          paddingTop: insets.top + 100,
          paddingBottom: 120 
        }}
      >
        <View style={styles.menuHeader}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>Regional Reports</Text>
          <Text style={[styles.menuDesc, { color: colors.icon }]}>Explore detailed market analysis</Text>
        </View>

        <View style={styles.grid}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              onPress={() => item.route && router.push(item.route as any)}
              style={[
                styles.card, 
                { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }
              ]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.icon }]}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.disclaimerSection}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.icon} />
          <Text style={[styles.disclaimerText, { color: colors.icon }]}>
            Prices provided by Lao Securities Exchange and BCEL.
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  menuHeader: { paddingHorizontal: 20, marginBottom: 24, marginTop: 12 },
  menuTitle: { fontSize: 24, fontWeight: '900' },
  menuDesc: { fontSize: 13, fontWeight: '600', marginTop: 4, opacity: 0.7 },
  grid: { 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 16 
  },
  card: {
    width: (width - 56) / 2, // Perfect split for 2 columns including gaps
    padding: 24,
    borderRadius: 32,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  iconContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  cardContent: { width: '100%' },
  cardTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22 },
  cardDesc: { fontSize: 11, fontWeight: '600', marginTop: 8, opacity: 0.6 },
  disclaimerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 8, paddingHorizontal: 40 },
  disclaimerText: { fontSize: 11, fontWeight: '600', textAlign: 'center', opacity: 0.5 },
});
