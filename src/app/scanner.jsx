/* global File */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getItem } from '../utils/storage';
import { API_URL } from '../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const VIEWPORT_SIZE = 260;

export default function ScannerScreen() {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [useMock, setUseMock] = useState(false);

  const cameraRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Handle laser animation loop
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [scanAnim]);

  // Request permission on mount if running on device
  useEffect(() => {
    if (Platform.OS !== 'web') {
      checkPermissions();
    } else {
      setUseMock(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPermission]);

  const checkPermissions = async () => {
    if (!cameraPermission) {
      const status = await requestCameraPermission();
      if (!status.granted) {
        setUseMock(true);
      }
    } else if (!cameraPermission.granted) {
      setUseMock(true);
    }
  };

  const takePhoto = async () => {
    if (useMock) {
      // Mock photo on Web / Simulator
      setImage({ uri: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600' });
      return;
    }

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: true,
        });
        if (photo && photo.uri) {
          setImage({ uri: photo.uri });
        }
      } catch (error) {
        console.error('Camera capture error, falling back to mock:', error);
        setImage({ uri: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600' });
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to select receipts.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const uploadReceipt = async () => {
    if (!image) return;

    setIsUploading(true);
    try {
      const token = await getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        router.replace('/');
        return;
      }

      const formData = new FormData();
      const uri = image.uri;
      const mimeType = image.mimeType || 'image/jpeg';
      const fileType = mimeType.split('/')[1] || 'jpeg';

      let fileToUpload;
      if (Platform.OS === 'web' || uri.startsWith('http')) {
        // Fetch web mock or gallery url as a blob
        const fileResponse = await fetch(uri);
        const blob = await fileResponse.blob();
        fileToUpload = new File([blob], `receipt.${fileType}`, { type: mimeType });
      } else {
        fileToUpload = {
          uri: uri,
          name: `receipt.${fileType}`,
          type: mimeType,
        };
      }

      formData.append('file', fileToUpload);

      const response = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Upload failed');
      }

      Alert.alert('Success', 'Receipt scanned successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to process receipt');
    } finally {
      setIsUploading(false);
    }
  };

  // Interpolate translate animation for the scan laser line
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, VIEWPORT_SIZE - 10],
  });

  const handleManualEntry = () => {
    router.replace({
      pathname: '/receipt/new',
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. Camera Viewfinder or Simulated Mock Viewfinder */}
      {!image ? (
        <View style={styles.cameraContainer}>
          {!useMock && cameraPermission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={flashMode}
              ref={cameraRef}
            />
          ) : (
            <View style={styles.mockCameraBackground}>
              <LinearGradient
                colors={['#0F172A', '#1E293B']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.mockViewfinderGraphic}>
                <Ionicons name="camera-outline" size={48} color="#475569" />
                <Text style={styles.mockCameraText}>Camera Viewfinder Active</Text>
                <TouchableOpacity onPress={() => setUseMock(false)} style={styles.retryPermsButton}>
                  <Text style={styles.retryPermsText}>Request Live Feed</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Viewfinder Translucent Border Overlays */}
          <View style={styles.overlayContainer}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayRow}>
              <View style={styles.overlaySide} />
              
              {/* Central Viewport Box */}
              <View style={styles.viewport}>
                {/* Corner blue brackets */}
                <View style={[styles.bracket, styles.bracketTL]} />
                <View style={[styles.bracket, styles.bracketTR]} />
                <View style={[styles.bracket, styles.bracketBL]} />
                <View style={[styles.bracket, styles.bracketBR]} />

                {/* AI Scanning Badge */}
                <View style={styles.scanningBadge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>AI SCANNING</Text>
                </View>

                {/* Animated Horizontal Laser Scan Line */}
                <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
              </View>
              
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>

          {/* Top Controls Header */}
          <SafeAreaView style={styles.topHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Scan Receipt</Text>
              <Text style={styles.headerSubtitle}>Align receipt within frame</Text>
            </View>

            <TouchableOpacity 
              onPress={() => setFlashMode(!flashMode)} 
              style={[styles.headerButton, flashMode && styles.headerButtonActive]}
            >
              <Ionicons name={flashMode ? "flash" : "flash-outline"} size={22} color={flashMode ? "#F59E0B" : "#FFFFFF"} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Bottom Footer Actions */}
          <View style={styles.footerContainer}>
            <Text style={styles.tipText}>Hold steady · Good lighting recommended</Text>
            
            <View style={styles.actionRow}>
              {/* Gallery Button */}
              <TouchableOpacity onPress={pickImage} style={styles.secondaryActionButton}>
                <Ionicons name="image-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Shutter Button */}
              <TouchableOpacity onPress={takePhoto} style={styles.shutterButtonOuter}>
                <View style={styles.shutterButtonInner} />
              </TouchableOpacity>

              {/* Manual Entry Button */}
              <TouchableOpacity onPress={handleManualEntry} style={styles.secondaryActionButton}>
                <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // 2. Preview & Upload State
        <View style={styles.previewContainer}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />

          {/* Viewport Laser overlay showing on top of the receipt during uploading */}
          <View style={styles.overlayContainer}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayRow}>
              <View style={styles.overlaySide} />
              <View style={styles.viewport}>
                <View style={[styles.bracket, styles.bracketTL]} />
                <View style={[styles.bracket, styles.bracketTR]} />
                <View style={[styles.bracket, styles.bracketBL]} />
                <View style={[styles.bracket, styles.bracketBR]} />

                <View style={styles.scanningBadge}>
                  <View style={[styles.badgeDot, isUploading && styles.badgeDotActive]} />
                  <Text style={styles.badgeText}>{isUploading ? 'EXTRACTING...' : 'AI SCANNING'}</Text>
                </View>

                <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>

          {/* Processing Indicator */}
          {isUploading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loaderText}>AI Extracting Merchant & Totals...</Text>
            </View>
          )}

          {/* Top Back Controls for Preview */}
          <SafeAreaView style={styles.topHeader}>
            <TouchableOpacity onPress={() => setImage(null)} style={styles.headerButton} disabled={isUploading}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Process Scan</Text>
            </View>
            <View style={{ width: 44 }} />
          </SafeAreaView>

          {/* Bottom Action buttons for Preview */}
          <View style={styles.previewFooter}>
            <TouchableOpacity 
              style={[styles.button, styles.retakeButton, isUploading && styles.disabled]} 
              onPress={() => setImage(null)}
              disabled={isUploading}
            >
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.uploadButton, isUploading && styles.disabled]} 
              onPress={uploadReceipt}
              disabled={isUploading}
            >
              <Text style={styles.uploadText}>Upload & Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
  },
  mockCameraBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockViewfinderGraphic: {
    alignItems: 'center',
    gap: 16,
  },
  mockCameraText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  retryPermsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryPermsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  overlayBottom: {
    flex: 1.3,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  overlayRow: {
    flexDirection: 'row',
    height: VIEWPORT_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  viewport: {
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  bracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#3B82F6',
  },
  bracketTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  bracketTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bracketBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bracketBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanningBadge: {
    position: 'absolute',
    top: -36,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  badgeDotActive: {
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  tipText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: width,
    paddingHorizontal: 30,
  },
  secondaryActionButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  shutterButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#3B82F6',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  shutterButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loaderContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  previewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    gap: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 16,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
