import React from 'react';
import { StyleSheet, View, Text, StatusBar, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TopGainers } from '@/components/Stock/TopGainers';
import { CollapsibleHeader } from '@/components/Stock/CollapsibleHeader';
import { useStocks } from '@/hooks/use-stocks';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const scrollY = useSharedValue(0);
  const { laoStocks, refreshing, onRefresh } = useStocks();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <CollapsibleHeader scrollY={scrollY} userName="Huevang Vang" />
      
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          paddingTop: insets.top + 100,
          paddingBottom: 100 
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />
        }
      >
        {/* Modern Portfolio Card */}
        <View style={styles.portfolioSection}>
           <View style={[styles.mainCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#0a7ea4' }]}>
              <View style={styles.cardInfo}>
                 <Text style={styles.cardLabel}>TOTAL ASSETS VALUE</Text>
                 <Text style={styles.cardValue}>₭ 120,450,000</Text>
                 <View style={styles.cardTrends}>
                    <Text style={styles.cardTrendText}>+₭ 1,240,000 Today</Text>
                    <MaterialCommunityIcons name="trending-up" size={16} color="#52FFB8" />
                 </View>
              </View>
              <View style={styles.cardActions}>
                 <TouchableOpacity style={styles.actionBtn}>
                    <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                    <Text style={styles.actionText}>Invest</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.actionBtn, { opacity: 0.7 }]}>
                    <MaterialCommunityIcons name="history" size={20} color="#fff" />
                    <Text style={styles.actionText}>History</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </View>

        {/* Market News Flash */}
        <View style={styles.newsBox}>
           <MaterialCommunityIcons name="flash" size={18} color="#FFD700" />
           <Text style={[styles.newsText, { color: colors.text }]}>LSX Composite up 1.2% this morning. BCEL leads gains.</Text>
        </View>

        {/* Top Highlights */}
        <TopGainers stocks={laoStocks} />

        {/* Investment Analytics Report */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Investment Report</Text>
          <TouchableOpacity>
             <Text style={styles.viewFull}>View Full Report</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <ReportCard 
            title="Active Stocks" 
            value="12" 
            desc="Lao & Foreign" 
            icon="briefcase" 
            color="#0a7ea4"
            colors={colors}
            colorScheme={colorScheme}
          />
          <ReportCard 
            title="Portfolio Risk" 
            value="Stable" 
            desc="Conservative" 
            icon="shield-check" 
            color="#48BB78"
            colors={colors}
            colorScheme={colorScheme}
          />
        </View>

        <View style={[styles.statsGrid, { marginTop: 12 }]}>
          <ReportCard 
            title="Avg Yield" 
            value="6.24%" 
            desc="Annualized" 
            icon="finance" 
            color="#FF9F43"
            colors={colors}
            colorScheme={colorScheme}
          />
          <ReportCard 
            title="Cash Reserve" 
            value="₭ 4.5M" 
            desc="Available now" 
            icon="wallet" 
            color="#7E57C2"
            colors={colors}
            colorScheme={colorScheme}
          />
        </View>

        <TouchableOpacity style={styles.proButton}>
           <Text style={styles.proText}>Unlock AI Wealth Insights</Text>
           <MaterialCommunityIcons name="creation" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
}

function ReportCard({ title, value, desc, icon, color, colors, colorScheme }: any) {
  return (
    <View style={[styles.rCard, { backgroundColor: colorScheme === 'dark' ? '#1B1E21' : '#F8FAFC' }]}>
       <View style={[styles.rIconBox, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
       </View>
       <Text style={[styles.rLabel, { color: colors.icon }]}>{title}</Text>
       <Text style={[styles.rValue, { color: colors.text }]}>{value}</Text>
       <Text style={[styles.rDesc, { color: colors.icon }]}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  portfolioSection: { paddingHorizontal: 20, marginBottom: 12 },
  mainCard: { padding: 24, borderRadius: 32, overflow: 'hidden' },
  cardInfo: { marginBottom: 24 },
  cardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  cardValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 8 },
  cardTrends: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  cardTrendText: { color: '#52FFB8', fontSize: 13, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    padding: 12, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8 
  },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  newsBox: { 
     flexDirection: 'row', 
     marginHorizontal: 20, 
     padding: 14, 
     borderRadius: 16, 
     backgroundColor: 'rgba(255,160,0,0.08)', 
     alignItems: 'center', 
     gap: 12,
     marginTop: 12,
     marginBottom: 8,
  },
  newsText: { fontSize: 13, fontWeight: '600', flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '900' },
  viewFull: { fontSize: 14, fontWeight: '700', color: '#0a7ea4' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  rCard: { flex: 1, minWidth: '45%', padding: 20, borderRadius: 28 },
  rIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  rLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 },
  rValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  rDesc: { fontSize: 11, fontWeight: '600', marginTop: 2, opacity: 0.5 },
  proButton: { 
     margin: 20, 
     marginTop: 32, 
     backgroundColor: '#7E57C2', 
     height: 56, 
     borderRadius: 18, 
     flexDirection: 'row', 
     justifyContent: 'center', 
     alignItems: 'center', 
     gap: 12 
  },
  proText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default HomeScreen;
