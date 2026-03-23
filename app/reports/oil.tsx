import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchEnergyPrices } from "@/services/stockService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function OilReportScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];
  const router = useRouter();

  const [fuelRates, setFuelRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const rates = await fetchEnergyPrices();
      setFuelRates(rates);
      setLoading(false);
    };
    loadData();
  }, []);

  // Historical Brent Crude Data (Global Market)
  const oilData = [
    { value: 78.5, label: "01/03" },
    { value: 80.2, label: "07/03" },
    { value: 82.45, label: "14/03" },
    { value: 81.3, label: "23/03" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Energy Reports",
          headerShown: true,
          headerTransparent: true,
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: 40,
        }}
      >
        <View style={styles.chartSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Brent Crude Market (USD)
          </Text>
          <View style={styles.chartBox}>
            <LineChart
              areaChart
              data={oilData}
              width={width - 64}
              height={180}
              spacing={width / 5}
              color1="#F43F5E"
              startFillColor="#F43F5E"
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
          <View style={styles.sourceHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Lao State Fuel Rates
            </Text>
            <MaterialCommunityIcons
              name="check-decagram"
              size={18}
              color="#0a7ea4"
            />
          </View>
          <Text style={[styles.sourceDesc, { color: colors.icon }]}>
            Official pricing from LSFC (Vientiane Base)
          </Text>

          <View style={styles.grid}>
            {loading ? (
              <View
                style={{
                  width: "100%",
                  height: 200,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color="#F43F5E" size="large" />
              </View>
            ) : (
              fuelRates.map((f, idx) => (
                <FuelCard
                  key={idx}
                  {...f}
                  colors={colors}
                  colorScheme={colorScheme}
                />
              ))
            )}
          </View>

          <View style={[styles.alertCard, { backgroundColor: "#F43F5E15" }]}>
            <MaterialCommunityIcons
              name="history"
              size={24}
              color="#F43F5E"
              style={{ marginBottom: 12 }}
            />
            <Text style={[styles.alertTitle, { color: colors.text }]}>
              Price Adjustment Notice
            </Text>
            <Text style={[styles.alertDesc, { color: colors.icon }]}>
              Prices were adjusted on March 6, 2026, due to the 33% increase in
              regional diesel costs and logistics premiums.
            </Text>
            <TouchableOpacity style={styles.externalLink} onPress={() => {}}>
              <Text style={styles.linkText}>View Historical Chart on LSFC</Text>
              <MaterialCommunityIcons
                name="open-in-new"
                size={14}
                color="#F43F5E"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FuelCard({
  name,
  price,
  unit,
  change,
  isUp,
  icon,
  colors,
  colorScheme,
}: any) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colorScheme === "dark" ? "#1B1E21" : "#F8FAFC" },
      ]}
    >
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={isUp ? "#F43F5E" : "#2E7D32"}
        />
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: isUp ? "#F43F5E20" : "#2E7D3220" },
          ]}
        >
          <Text
            style={[styles.cardChange, { color: isUp ? "#F43F5E" : "#2E7D32" }]}
          >
            {change}
          </Text>
        </View>
      </View>
      <Text style={[styles.cardName, { color: colors.text }]}>{name}</Text>
      <Text style={[styles.cardPrice, { color: colors.text }]}>{price}</Text>
      <Text style={[styles.cardUnit, { color: colors.icon }]}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chartSection: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  sourceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sourceDesc: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 20,
    opacity: 0.6,
  },
  chartBox: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.02)",
    marginTop: 16,
  },
  statsSection: { paddingHorizontal: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  card: { width: "48%", padding: 20, borderRadius: 28 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  cardName: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  cardPrice: { fontSize: 20, fontWeight: "900" },
  cardUnit: { fontSize: 11, fontWeight: "600", marginTop: 4, opacity: 0.6 },
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  cardChange: { fontSize: 10, fontWeight: "800" },
  alertCard: { padding: 24, borderRadius: 32, marginTop: 12 },
  alertTitle: { fontSize: 17, fontWeight: "800" },
  alertDesc: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    opacity: 0.7,
    lineHeight: 18,
  },
  externalLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  linkText: { fontSize: 12, fontWeight: "800", color: "#F43F5E" },
});
