import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// NOTE: You need to install expo-camera for QR scanning to work
// Run: npx expo install expo-camera
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_BASE_URL = 'http://10.0.2.2:5551/api'; // Changed from localhost to 10.0.2.2 for Android emulator compatibility

// Placeholder for OneProofSlipCard since it wasn't provided
const OneProofSlipCard = ({ data }: { data: any }) => (
  <View style={styles.cardPlaceholder}>
    <Text style={styles.cardPlaceholderText}>Verification Data:</Text>
    <Text style={styles.cardDataText}>{JSON.stringify(data, null, 2)}</Text>
  </View>
);

export default function App() {
  const [qrString, setQrString] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oneProofData, setOneProofData] = useState<any>(null);

  const [openSelectQR, setOpenSelectQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarcodeScanned = ({ type, data }: any) => {
    if (data) {
      setQrString(data);
      setShowScanner(false);
      fetchOneProof(data);
    }
  };

  const fetchOneProof = async (qr: string) => {
    setLoading(true);
    setError('');
    try {
      // Assuming the scanned QR code acts as the ticket or contains the needed info
      const fccref = ''; 
      const ticket = qr;
      const url = `https://bcel.la:8083/onesure.php?fccref=${fccref}&ticket=${ticket}`;
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Dart/2.10 (dart:io)' },
      });
      setOneProofData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch proof data');
      setOneProofData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setOpenSelectQR(false);
        // Note: Decoding a QR code from a picked image purely in React Native without
        // backend assistance or native modules is complex. 
        // For demonstration, we alert the user:
        Alert.alert(
          "Image Processing", 
          "Extracting QR data from saved images requires extra native modules. Please use the camera scanner instead."
        );
      }
    } catch (err) {
      console.log("Image picker error:", err);
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission Required", "Camera access is needed to scan QR codes.");
        return;
      }
    }
    setOpenSelectQR(false);
    setShowScanner(true);
  };

  const reset = () => {
    setQrString('');
    setOneProofData(null);
    setError('');
    setShowScanner(false);
    setOpenSelectQR(false);
  };

  const promptManualQR = () => {
    Alert.prompt(
      "Enter QR String",
      "Paste the BCEL OnePay QR text manually",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Verify", 
          onPress: (text) => {
            if (text) {
              setQrString(text);
              fetchOneProof(text);
            }
          }
        }
      ],
      "plain-text"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="shield-check" size={56} color="#d42026" />
          </View>
          <Text style={styles.headerTitle}>BCEL OneProof Verify</Text>
          <Text style={styles.headerSubtitle}>Public Verification Tool</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainCard}>
          {!oneProofData && !showScanner && !loading && (
            <View style={styles.startState}>
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={48} color="#d42026" style={styles.infoIcon} />
                <Text style={styles.infoTitle}>Verify Transaction</Text>
                <Text style={styles.infoSubtitle}>Tap the button below to scan a BCEL OnePay QR code.</Text>
              </View>

              <View style={styles.actionBox}>
                <TouchableOpacity 
                  style={styles.scanButtonBig}
                  onPress={() => setOpenSelectQR(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={56} color="#d42026" />
                </TouchableOpacity>

                <TouchableOpacity onPress={promptManualQR} style={styles.manualEntryBtn}>
                  <Text style={styles.manualEntryText}>Or Enter QR Text Manually</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showScanner && (
            <View style={styles.scannerContainer}>
              <View style={styles.cameraWrapper}>
                {permission?.granted ? (
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={handleBarcodeScanned}
                    barcodeScannerSettings={{
                      barcodeTypes: ["qr"],
                    }}
                  />
                ) : (
                  <View style={styles.cameraPlaceholder}>
                    <Text style={{color: '#fff'}}>Requesting Camera Permission...</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.closeScannerBtn}
                  onPress={() => setShowScanner(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.scannerHelperText}>Align QR code within the frame</Text>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#d42026" />
              <Text style={styles.loadingText}>Verifying with BCEL...</Text>
            </View>
          )}

          {oneProofData && (
            <View style={styles.resultContainer}>
              <View style={styles.successHeader}>
                <MaterialCommunityIcons name="check-circle" size={56} color="#00e676" />
                <Text style={styles.successTitle}>Verification Success</Text>
              </View>

              <OneProofSlipCard data={oneProofData} />

              <TouchableOpacity style={styles.resetButton} onPress={reset} activeOpacity={0.8}>
                <MaterialCommunityIcons name="refresh" size={20} color="#d42026" />
                <Text style={styles.resetButtonText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Alert */}
          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError('')}>
                <MaterialCommunityIcons name="close" size={18} color="#f44336" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 BCEL OneProof Verification System</Text>
          <TouchableOpacity 
            style={styles.githubLink}
            onPress={() => Linking.openURL('https://github.com/soulideth/BcelSlipCheck')}
          >
            <MaterialCommunityIcons name="github" size={16} color="#666" />
            <Text style={styles.githubText}>OpenSource on GitHub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Select Option Modal */}
      <Modal
        visible={openSelectQR}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpenSelectQR(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Option</Text>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.modalOptionBtn} onPress={openCamera}>
                <MaterialCommunityIcons name="camera-outline" size={40} color="#d42026" />
                <Text style={styles.modalOptionText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOptionBtn} onPress={handleImagePicker}>
                <MaterialCommunityIcons name="image-outline" size={40} color="#d42026" />
                <Text style={styles.modalOptionText}>Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setOpenSelectQR(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 32, 38, 0.05)',
    borderRadius: 40,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mainCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    padding: 24,
    flexGrow: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 40,
  },
  startState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 36,
  },
  infoIcon: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionBox: {
    alignItems: 'center',
    width: '100%',
  },
  scanButtonBig: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 32, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 32, 38, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  manualEntryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  manualEntryText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  cameraWrapper: {
    width: '100%',
    height: Dimensions.get('window').width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(212, 32, 38, 0.3)',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeScannerBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerHelperText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  cardPlaceholder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  cardPlaceholderText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardDataText: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 32, 38, 0.08)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: '#d42026',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
  },
  modalOptionBtn: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    width: 100,
  },
  modalOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  modalActions: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    paddingTop: 16,
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  githubLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  githubText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});
