import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator/web
const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// Replace with your actual local IP if testing on a physical device, e.g. 192.168.1.X
export const API_URL = `http://${LOCAL_IP}:3000/api`;
