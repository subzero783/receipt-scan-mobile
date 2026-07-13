import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { getItem } from '../utils/storage';
import { API_URL } from '../constants/api';

export default function ScannerScreen() {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to scan receipts.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
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
      const mimeType = image.mimeType || 'image/jpeg';
      const fileType = mimeType.split('/')[1] || 'jpeg';
      
      let fileToUpload;
      if (Platform.OS === 'web') {
        const fileResponse = await fetch(image.uri);
        const blob = await fileResponse.blob();
        fileToUpload = new File([blob], `receipt.${fileType}`, { type: mimeType });
      } else {
        fileToUpload = {
          uri: image.uri,
          name: `receipt.${fileType}`,
          type: mimeType,
        };
      }
      
      formData.append('file', fileToUpload);

      // Using fetch instead of axios for FormData in React Native can sometimes be more stable
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

  return (
    <View style={styles.container}>
      {!image ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={pickImage}>
            <Text style={styles.outlineButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, isUploading && styles.disabled]} 
              onPress={() => setImage(null)}
              disabled={isUploading}
            >
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, isUploading && styles.disabled]} 
              onPress={uploadReceipt}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Upload & Scan</Text>
              )}
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
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  outlineButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
