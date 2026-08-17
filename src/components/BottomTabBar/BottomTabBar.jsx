import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './BottomTabBar.styles';

export default function BottomTabBar({ activeTab }) {
  return (
    <View style={styles.container}>
      {/* Background Tab Bar */}
      <View style={styles.tabBar}>
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace('/dashboard')}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'home' ? '#2563EB' : '#94A3B8'}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Placeholder for the floating scan button */}
        <View style={styles.placeholder} />

        {/* Settings Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace('/settings')}
        >
          <Ionicons
            name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
            size={24}
            color={activeTab === 'settings' ? '#2563EB' : '#94A3B8'}
          />
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Center Scan Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.scanButtonContainer}
        onPress={() => router.push('/scanner')}
      >
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']}
          style={styles.scanButtonGradient}
        >
          <Ionicons name="qr-code-outline" size={26} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
