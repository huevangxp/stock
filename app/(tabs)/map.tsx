import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BillVerificationScreen() {
  const insets = useSafeAreaInsets();
  const [fccref, setFccref] = useState("");
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!fccref || !ticket) {
      Alert.alert("Input Required", "Please fill in both fields.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Connect to BCEL API using the provided URL and User-Agent header
      const url = `https://bcel.la:8083/onesure.php?fccref=${fccref}&ticket=${ticket}`;
      const response = await axios.get(url, {
        headers: { "User-Agent": "Dart/2.10 (dart:io)" },
      });

      setResult(response.data);
      console.log("API Response:", response.data);
    } catch (error: any) {
      console.error("Error connecting to BCEL API:", error);
      Alert.alert("Connection Error", error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBill = () => {
    // Placeholder for bill upload logic
    // Implementation tip: npx expo install expo-image-picker
    Alert.alert(
      "Upload Bill",
      "To enable image selection, please install expo-image-picker in your project terminal."
    );
  };

  return (
    <LinearGradient
      colors={["#004e92", "#000428"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-check" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>BCEL One Verify</Text>
          <Text style={styles.subtitle}>Check & Upload Your Bill Payment</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FCC Reference</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="numeric" size={20} color="#aaa" />
              <TextInput
                style={styles.input}
                placeholder="Ex: 12345678"
                placeholderTextColor="#999"
                value={fccref}
                onChangeText={setFccref}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ticket Number</Text>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="ticket-outline" size={20} color="#aaa" />
              <TextInput
                style={styles.input}
                placeholder="Ex: 987654"
                placeholderTextColor="#999"
                value={ticket}
                onChangeText={setTicket}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.verifyBtnText}>Verify Payment</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadBill}>
            <MaterialCommunityIcons name="camera-plus" size={24} color="#004e92" />
            <Text style={styles.uploadBtnText}>Upload Bill Screenshot</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultHeader}>Verification Result</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>
                {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginVertical: 30 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 5 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: "700", color: "#333", marginBottom: 8 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: "#000" },
  verifyBtn: {
    backgroundColor: "#004e92",
    height: 55,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  verifyBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { marginHorizontal: 10, color: "#999", fontSize: 12 },
  uploadBtn: {
    borderWidth: 2,
    borderColor: "#004e92",
    borderStyle: "dashed",
    height: 55,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  uploadBtnText: { color: "#004e92", fontSize: 16, fontWeight: "700" },
  resultContainer: { marginTop: 25 },
  resultHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    marginLeft: 5,
  },
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  resultText: { color: "#fff", fontSize: 13, fontFamily: "monospace" },
});
