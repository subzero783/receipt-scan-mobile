import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import { getItem, setItem } from '@/utils/storage';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './LoginScreen.styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await getItem('userToken');
      if (token) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    } catch (_) {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/auth/mobile-login`, { email, password });
      if (res.data.token) {
        await setItem('userToken', res.data.token);
        // Save user info for high fidelity display
        const user = res.data.user || {};
        await setItem('userName', user.name || 'Gus');
        await setItem('userEmail', user.email || email);
        await setItem('userIsPro', String(user.isPro || false));
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Please reset your password on the web application at:\nhttps://receiptscan.io/forgot-password'
    );
  };

  const handleSocialLogin = (platform) => {
    Alert.alert('Social Authentication', `${platform} sign-in will be available in the production release.`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Gradient Section */}
          <LinearGradient
            colors={['#DBEAFE', '#F8FAFC']}
            style={styles.headerGradient}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="document-text" size={32} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.formContainer}>
            {/* Header Text */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to manage your receipts.</Text>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.button}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.buttonArrow} />
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                onPress={() => handleSocialLogin('Google')}
                style={styles.socialButton}
              >
                <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.socialIcon} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialLogin('Apple')}
                style={styles.socialButton}
              >
                <Ionicons name="logo-apple" size={20} color="#000000" style={styles.socialIcon} />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
