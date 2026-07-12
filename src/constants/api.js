import { Platform } from 'react-native';
import Constants from 'expo-constants';

// For physical devices, get the host IP of the development machine running Expo CLI/Metro.
// Fall back to 10.0.2.2 for Android emulator or localhost for iOS simulator.
const getLocalIp = () => {
  if (Platform.OS === 'web') {
    return 'localhost';
  }
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':').shift();
      if (ip) return ip;
    }
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const LOCAL_IP = getLocalIp();

export const API_URL = `http://${LOCAL_IP}:3000/api`;
