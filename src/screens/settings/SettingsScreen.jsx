import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { getItem, removeItem } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '@/components/BottomTabBar';
import { styles } from './SettingsScreen.styles';

export default function SettingsScreen() {
  const [userName, setUserName] = useState('Gus Fernandez');
  const [userEmail, setUserEmail] = useState('gus@studio.io');
  const [isPro, setIsPro] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const name = await getItem('userName');
      const email = await getItem('userEmail');
      const isProVal = await getItem('userIsPro');
      if (name) setUserName(name);
      if (email) setUserEmail(email);
      if (isProVal) setIsPro(isProVal === 'true');
    } catch (e) {
      console.error('Failed to load settings user info', e);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await removeItem('userToken');
          await removeItem('userName');
          await removeItem('userEmail');
          await removeItem('userIsPro');
          router.replace('/');
        },
      },
    ]);
  };

  const handleItemPress = (settingName) => {
    Alert.alert('Settings', `${settingName} settings are currently managed from the web application.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Settings Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            {isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
        </View>

        {/* Settings List Options */}
        <View style={styles.settingsList}>
          {/* Profile Item */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleItemPress('Profile')}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="person" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Profile</Text>
                <Text style={styles.settingValue}>{userName}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Export Preferences */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleItemPress('Export Preferences')}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="cloud-download" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Export Preferences</Text>
                <Text style={styles.settingValue}>CSV, PDF</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Notifications */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleItemPress('Notifications')}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="notifications" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingValue}>Enabled</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Privacy & Security */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleItemPress('Privacy & Security')}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F0FDFA' }]}>
                <Ionicons name="lock-closed" size={20} color="#14B8A6" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Privacy & Security</Text>
                <Text style={styles.settingValue}>Face ID on</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Subscription */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleItemPress('Subscription')}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="card" size={20} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Subscription</Text>
                <Text style={styles.settingValue}>{isPro ? 'Pro • $9/mo' : 'Free Trial'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Help & Support */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleItemPress('Help & Support')}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="help" size={20} color="#EF4444" style={{ fontWeight: 'bold' }} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.signOutButton}
          onPress={handleLogout}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar activeTab="settings" />
    </SafeAreaView>
  );
}
