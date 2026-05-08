import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// EMVCo CRC16 Calculation (CCITT-FALSE)
const calculateCRC16 = (data: string) => {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const appendDynamicDataToQR = (baseStr: string, amount: string, detail: string) => {
  if (!baseStr || baseStr.length < 8) return baseStr;
  
  // EMVCo payload always ends with Tag 6304 + 4 bytes CRC = 8 chars
  const payloadBeforeCrc = baseStr.substring(0, baseStr.length - 8); 
  
  let dynamicTags = "";
  
  // Tag 54: Transaction Amount
  if (amount && Number(amount) > 0) {
    const amountStr = amount.trim();
    const lengthStr = amountStr.length.toString().padStart(2, "0");
    dynamicTags += `54${lengthStr}${amountStr}`;
  }
  
  // Tag 62: Additional Data Field Template (Sub-tag 08: Purpose of Transaction)
  if (detail && detail.trim().length > 0) {
    const detailStr = detail.trim();
    const subTagLen = detailStr.length.toString().padStart(2, "0");
    const subTag = `08${subTagLen}${detailStr}`;
    const tag62Len = subTag.length.toString().padStart(2, "0");
    dynamicTags += `62${tag62Len}${subTag}`;
  }
  
  if (!dynamicTags) return baseStr; // No dynamic data added

  // Change Tag 01 (Point of Initiation Method) from "11" (Static) to "12" (Dynamic)
  let newPayload = payloadBeforeCrc;
  if (newPayload.includes("010211")) {
    newPayload = newPayload.replace("010211", "010212");
  }
  
  newPayload += dynamicTags;
  newPayload += "6304";
  
  const newCrc = calculateCRC16(newPayload);
  return newPayload + newCrc;
};

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setErrorMsg("");
    Keyboard.dismiss();
    try {
      const response = await axios.get(
        `https://bcel.la:8093/onepay-qr/request.php?search=${encodeURIComponent(search.trim())}`,
      );

      if (response.data && response.data.result === 0 && response.data.data?.length > 0) {
        const allResults = response.data.data;

        // Smart filter: prioritize exact matches
        const q = search.trim().toUpperCase();
        const exactMatches = allResults.filter((item: any) =>
          item.MERCHANT_ENG?.toUpperCase().includes(q) ||
          item.MCID?.toUpperCase().includes(q) ||
          item.strqr?.includes(search.trim())
        );

        setResults(exactMatches.length > 0 ? exactMatches : allResults);
      } else {
        setResults([]);
        setErrorMsg(
          "Not found in OnePay registry.\n\n" +
          "💡 Tips:\n" +
          "• Try searching by business name\n" +
          "• Try searching by account number\n" +
          "• Check spelling and try again"
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setErrorMsg("Cannot connect to OnePay.\nPlease check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (qrString: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrString)}&margin=10`;
    Linking.openURL(qrUrl).catch((err) =>
      console.error("Failed to open URL:", err),
    );
  };

  const renderQRItem = ({ item }: { item: any }) => {
    const finalQrString = appendDynamicDataToQR(item.strqr, amount, detail);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="account-check-outline"
              size={26}
              color="#0284C7"
            />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{item.MERCHANT_NAME}</Text>
            <Text style={styles.accountEng}>{item.MERCHANT_ENG}</Text>
          </View>
          {item.strqr?.startsWith("000201") && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#059669" />
              <Text style={styles.verifiedText}>LaoQR</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.qrCenter}>
          <View style={styles.qrWrapper}>
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(finalQrString)}&margin=10`,
              }}
              style={styles.qrImage}
            />
          </View>
        </View>

        <View style={styles.detailsRow}>
          <DetailRow icon="identifier" label="ID" value={item.MCID} />
          <DetailRow icon="map-marker-outline" label="Province" value={item.PROVINCE} />
          <DetailRow icon="shield-check-outline" label="Status" value="Verified ✓" />
        </View>

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(finalQrString)}
        >
          <MaterialCommunityIcons name="download" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Download QR</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="qrcode-scan" size={28} color="#0a7ea4" />
        </View>
        <View>
          <Text style={styles.headerTitle}>My QR Code</Text>
          <Text style={styles.headerSubtitle}>LaoQR Individual Payment</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="account-search-outline" size={22} color="#94A3B8" />
          <TextInput
            style={styles.input}
            placeholder="Account number or name..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); setResults([]); setErrorMsg(""); }}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.inputRow}>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <MaterialCommunityIcons name="cash" size={22} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Amount (LAK) - Optional"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <MaterialCommunityIcons name="text-box-outline" size={22} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Description / Detail - Optional"
              placeholderTextColor="#94A3B8"
              value={detail}
              onChangeText={setDetail}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Find & Generate QR</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => item.MCID + index}
        renderItem={renderQRItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              {errorMsg ? (
                <>
                  <View style={[styles.emptyIconContainer, { backgroundColor: "#FEF2F2" }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: "#DC2626" }]}>Not Found</Text>
                  <Text style={styles.emptyText}>{errorMsg}</Text>
                </>
              ) : (
                <>
                  <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons name="qrcode-plus" size={48} color="#CBD5E1" />
                  </View>
                  <Text style={styles.emptyTitle}>Find Your QR Code</Text>
                  <Text style={styles.emptyText}>
                    Search by account number or name to generate your individual payment QR code
                  </Text>
                </>
              )}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.detailItem}>
    <MaterialCommunityIcons name={icon} size={14} color="#94A3B8" />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  searchSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  searchButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0a7ea4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  accountInfo: {
    marginLeft: 14,
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  accountEng: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  qrCenter: {
    alignItems: "center",
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  qrImage: {
    width: width - 120,
    height: width - 120,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  detailItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  downloadButton: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});
