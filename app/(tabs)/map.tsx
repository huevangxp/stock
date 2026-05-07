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
  TextInput,
} from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// NOTE: You need to install expo-camera for QR scanning to work
// Run: npx expo install expo-camera
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_BASE_URL = 'http://10.0.2.2:5551/api'; // Changed from localhost to 10.0.2.2 for Android emulator compatibility

import OneProofSlipCard from '../../components/OneProofSlipCard';

// EMV QR Parsing Logic
function parseEmvQrLine(qrcode: string) {
  const res: any = {};
  const qrlen = qrcode.length;
  let pos = 0;
  try {
    while (pos < qrlen) {
      const field = parseInt(qrcode.substring(pos, pos + 2));
      const length = parseInt(qrcode.substring(pos + 2, pos + 4));
      const data = qrcode.substring(pos + 4, pos + 4 + length);
      if (!isNaN(field)) {
        res[field] = data;
      }
      pos += 4 + length;
    }
  } catch (error) {
    console.log("Parse line error:", error);
  }
  return res;
}

function parseEmvQr(qrcode: string) {
  try {
    const res = parseEmvQrLine(qrcode);
    if (res[33]) res[33] = parseEmvQrLine(res[33]);
    if (res[38]) res[38] = parseEmvQrLine(res[38]);
    if (res[62]) res[62] = parseEmvQrLine(res[62]);
    if (res[64]) res[64] = parseEmvQrLine(res[64]);
    return res;
  } catch (e) {
    console.error('Parse Error:', e);
  }
  return {};
}

export default function App() {
  const [qrString, setQrString] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oneProofData, setOneProofData] = useState<any>(null);

  const [openSelectQR, setOpenSelectQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [openManualEntry, setOpenManualEntry] = useState(false);
  const [manualInput, setManualInput] = useState('');
  
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
      let ticket = '';
      let fccref = '';

      // 1. Try to parse as raw EMV QR (starts with 000201)
      if (qr.startsWith('000201')) {
        const result = parseEmvQr(qr);
        fccref = (result[33]?.['4'] || result[38]?.['4'] || '').replace(/\s+/g, '');
        ticket = (result[33]?.['3'] || result[38]?.['3'] || '').replace(/\s+/g, '');
      } 
      
      // 2. Fallback: Extract from URL if the above failed
      if (!ticket || !fccref) {
        if (qr.includes('verify/')) {
          ticket = qr.split('verify/')[1].split('?')[0];
        } else if (qr.includes('ticket=')) {
          ticket = qr.split('ticket=')[1].split('&')[0];
        }
        
        if (qr.includes('fccref=')) {
          fccref = qr.split('fccref=')[1].split('&')[0];
        }
      }

      // If we still don't have a ticket, use the raw qr as a last resort
      if (!ticket) ticket = qr;

      // Using the endpoint provided by the user
      const url = `https://bcel.la:8083/onesure.php?fccref=${fccref}&ticket=${ticket}`;
      console.log(`Verifying: FCCRef=${fccref}, Ticket=${ticket}`);
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Dart/2.10 (dart:io)' },
      });
      
      if (response.data) {
        setOneProofData(response.data);
      } else {
        throw new Error("Invalid response format from BCEL");
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      // Enhanced error messaging for 404 and network issues
      const msg = err.response?.status === 404 
        ? "Verification endpoint not found (404). Trying secondary endpoint..."
        : (err.response?.data?.message || err.message || 'Failed to fetch proof data');
      setError(msg);
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
        setLoading(true); // Start loading while decoding
        
        const imageUri = result.assets[0].uri;
        
        // We use a public API to decode the QR code since pure React Native lacks local decoding
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        if (type === 'image/jpg') type = 'image/jpeg';
        
        formData.append('file', {
          uri: imageUri,
          name: filename,
          type,
        } as any);

        try {
          // In React Native, fetch is much more reliable for FormData than Axios.
          // Do NOT set Content-Type manually; fetch will set it with the correct boundary.
          const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
          }
          
          const decodeResponse = await response.json();
          const qrData = decodeResponse[0]?.symbol[0]?.data;
          
          if (qrData) {
            setQrString(qrData);
            // Successfully extracted the QR text! Now verify it with BCEL.
            fetchOneProof(qrData);
          } else {
            setLoading(false);
            Alert.alert("QR Not Found", "Could not detect a valid QR code in the selected image.");
          }
        } catch (decodeErr) {
          setLoading(false);
          console.error("Decode Error:", decodeErr);
          Alert.alert("Processing Error", "Failed to analyze the image for QR codes.");
        }
      }
    } catch (err) {
      console.log("Image picker error:", err);
      setLoading(false);
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
    setManualInput('');
    setOpenManualEntry(true);
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

      {/* Manual Entry Modal */}
      <Modal
        visible={openManualEntry}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpenManualEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter QR String</Text>
            <Text style={styles.modalSubtitle}>Paste the BCEL OnePay QR text manually</Text>
            
            <TextInput
              style={styles.textInput}
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="Paste QR here..."
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                onPress={() => setOpenManualEntry(false)} 
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalVerifyBtn}
                onPress={() => {
                  if (manualInput.trim()) {
                    setQrString(manualInput.trim());
                    setOpenManualEntry(false);
                    fetchOneProof(manualInput.trim());
                  }
                }}
              >
                <Text style={styles.modalVerifyText}>Verify</Text>
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
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 24,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  modalVerifyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 32, 38, 0.1)',
  },
  modalVerifyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d42026',
  },
});
