import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const BANK_BRANCHES = [
  {
    id: 1,
    name: "BCEL Headquarters",
    lat: 17.9735,
    lng: 102.6105,
    type: "Bank",
    address: "Pangkham St, Vientiane",
  },
  {
    id: 2,
    name: "LDB Central Branch",
    lat: 17.9712,
    lng: 102.615,
    type: "Bank",
    address: "Lane Xang Ave, Vientiane",
  },
  {
    id: 3,
    name: "Lao-Viet Bank HQ",
    lat: 17.9625,
    lng: 102.612,
    type: "Bank",
    address: "Lanith Rd, Vientiane",
  },
  {
    id: 4,
    name: "Standard Chartered",
    lat: 17.968,
    lng: 102.605,
    type: "Bank",
    address: "Rue Setthathilath",
  },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = "light";
  const colors = Colors[colorScheme as "light" | "dark"];
  const [selectedBranch, setSelectedBranch] = useState(BANK_BRANCHES[0]);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [isCardVisible, setIsCardVisible] = useState(true);
  const mapRef = useRef<MapView>(null);

  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"));
  };

  const centerOnAll = () => {
    mapRef.current?.fitToCoordinates(
      BANK_BRANCHES.map((b) => ({ latitude: b.lat, longitude: b.lng })),
      {
        edgePadding: { top: 100, right: 100, bottom: 400, left: 100 },
        animated: true,
      },
    );
  };

  const mapStyle = colorScheme === "dark" ? darkMapStyle : [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: 17.97,
          longitude: 102.61,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapType === "standard" ? mapStyle : []}
      >
        {BANK_BRANCHES.map((branch) => (
          <Marker
            key={branch.id}
            coordinate={{ latitude: branch.lat, longitude: branch.lng }}
            onPress={() => {
              setSelectedBranch(branch);
              setIsCardVisible(true);
            }}
          >
            <View
              style={[
                styles.markerContainer,
                {
                  backgroundColor:
                    branch.id === selectedBranch?.id ? "#0a7ea4" : "#fff",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="bank"
                size={20}
                color={branch.id === selectedBranch?.id ? "#fff" : "#0a7ea4"}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Controls (Top Right) */}
      <View style={[styles.controlCol, { top: insets.top + 140 }]}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.background }]}
          onPress={toggleMapType}
        >
          <MaterialCommunityIcons
            name={mapType === "standard" ? "layers-outline" : "map-outline"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.background }]}
          onPress={centerOnAll}
        >
          <MaterialCommunityIcons name="target" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.background }]}
          onPress={() => setIsCardVisible(!isCardVisible)}
        >
          <MaterialCommunityIcons
            name={isCardVisible ? "chevron-down" : "chevron-up"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Floating Search Bar */}
      <View style={[styles.searchContainer, { top: insets.top + 16 }]}>
        <View
          style={[styles.searchBar, { backgroundColor: colors.background }]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={colors.icon}
          />
          <TextInput
            placeholder="Search branches..."
            placeholderTextColor={colors.icon + "80"}
            style={[styles.searchInput, { color: colors.text }]}
          />
          <MaterialCommunityIcons name="tune" size={24} color={colors.icon} />
        </View>
      </View>

      {/* Quick Filters */}
      <View style={[styles.filterRow, { top: insets.top + 80 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          <FilterChip icon="bank" label="Banks" active colors={colors} />
          <FilterChip icon="gold" label="Gold Shop" colors={colors} />
          <FilterChip icon="atm" label="ATMs" colors={colors} />
        </ScrollView>
      </View>

      {/* Bottom Detail Card with Hide Logic */}
      {isCardVisible && (
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dragger}
            onPress={() => setIsCardVisible(false)}
          />
          <View style={styles.detailHeader}>
            <View style={styles.titleInfo}>
              <Text style={[styles.branchName, { color: colors.text }]}>
                {selectedBranch.name}
              </Text>
              <Text style={[styles.branchAddress, { color: colors.icon }]}>
                {selectedBranch.address}
              </Text>
            </View>
            <TouchableOpacity style={styles.directionBtn}>
              <MaterialCommunityIcons
                name="directions"
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoGrid}>
            <Text
              style={[styles.infoText, { color: colors.text, opacity: 0.6 }]}
            >
              Verified Branch • Real-time Location
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function FilterChip({ icon, label, active, colors }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: active ? "#0a7ea4" : colors.background },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={active ? "#fff" : colors.icon}
      />
      <Text style={[styles.chipText, { color: active ? "#fff" : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  markerContainer: {
    padding: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#0a7ea4",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlCol: { position: "absolute", right: 20, gap: 12 },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchContainer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
    gap: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "600" },
  filterRow: { position: "absolute", height: 40, width: "100%" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    gap: 6,
    elevation: 2,
  },
  chipText: { fontSize: 13, fontWeight: "700" },
  detailCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  dragger: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleInfo: { flex: 1 },
  branchName: { fontSize: 22, fontWeight: "900" },
  branchAddress: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    opacity: 0.6,
  },
  directionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0a7ea4",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 8,
  },
  infoGrid: { marginTop: 12 },
  infoText: { fontSize: 14, fontWeight: "600" },
});

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
];
