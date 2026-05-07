import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * BillUploadScreen - A premium interface for uploading BCEL bill payments.
 * Connects to the BCEL Onesure API using Axios with custom headers.
 */
export default function BillUploadScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];

  // Form State
  const [fccref, setFccref] = useState("");
  const [ticket, setTicket] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pick an image from the library
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need access to your photos to upload a bill.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not open image picker. Please ensure expo-image-picker is installed.");
    }
  };

  // Handle the API connection and upload
  const handleUpload = async () => {
    if (!fccref || !ticket) {
      Alert.alert("Required Fields", "Please enter both FCC Reference and Ticket Number.");
      return;
    }

    setLoading(true);
    try {
      // API endpoint from user request
      const url = `https://bcel.la:8083/onesure.php?fccref=${fccref}&ticket=${ticket}`;
      
      const formData = new FormData();
      if (image) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        
        // Append image file to formData
        formData.append("file", {
          uri: image,
          name: `bill_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // Connecting to API using Axios with specific headers
      const response = await axios.post(url, formData, {
        headers: {
          "User-Agent": "Dart/2.10 (dart:io)",
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("BCEL Response:", response.data);

      if (response.status === 200) {
        Alert.alert("Success", "Payment receipt uploaded successfully!");
        // Reset form on success
        setFccref("");
        setTicket("");
        setImage(null);
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to connect to BCEL server.";
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={colorScheme === "dark" ? ["#121212", "#000"] : ["#f8f9fa", "#eef2f7"]}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" }]}>
              <MaterialCommunityIcons name="receipt-text-check" size={32} color="#0a7ea4" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Bill Payment</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>Securely upload your payment evidence</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>FCC Reference</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#f1f3f5" }]}>
                <MaterialCommunityIcons name="identifier" size={20} color="#0a7ea4" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter Reference"
                  placeholderTextColor={colors.icon + "80"}
                  value={fccref}
                  onChangeText={setFccref}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Ticket Number</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#f1f3f5" }]}>
                <MaterialCommunityIcons name="ticket-outline" size={20} color="#0a7ea4" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter Ticket ID"
                  placeholderTextColor={colors.icon + "80"}
                  value={ticket}
                  onChangeText={setTicket}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Image Picker Section */}
            <Text style={[styles.label, { color: colors.text, marginBottom: 12 }]}>Proof of Payment</Text>
            <TouchableOpacity 
              style={[
                styles.imagePicker, 
                { 
                  borderColor: colorScheme === "dark" ? "#333" : "#e9ecef",
                  backgroundColor: colorScheme === "dark" ? "#121212" : "#fafafa"
                }
              ]} 
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeBtn} 
                    onPress={() => setImage(null)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pickerPlaceholder}>
                  <View style={styles.pickerIconBg}>
                    <MaterialCommunityIcons name="camera-plus" size={24} color="#0a7ea4" />
                  </View>
                  <Text style={[styles.pickerText, { color: "#0a7ea4" }]}>Select Bill Image</Text>
                  <Text style={[styles.pickerSubtext, { color: colors.icon }]}>JPEG, PNG up to 5MB</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <LinearGradient
                  colors={["#0a7ea4", "#055e7a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Submit Payment</Text>
                  <MaterialCommunityIcons name="send-outline" size={18} color="#fff" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>

          {/* Trust Footer */}
          <View style={styles.footer}>
            <View style={styles.divider} />
            <View style={styles.trustRow}>
              <MaterialCommunityIcons name="lock-outline" size={14} color={colors.icon} />
              <Text style={[styles.footerText, { color: colors.icon }]}>End-to-end encrypted connection</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    fontWeight: "500",
  },
  card: {
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  inputIcon: {
    paddingLeft: 18,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  imagePicker: {
    width: "100%",
    height: 180,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    overflow: "hidden",
  },
  pickerPlaceholder: {
    alignItems: "center",
  },
  pickerIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: "700",
  },
  pickerSubtext: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 68, 68, 0.9)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    height: 64,
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 20,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
