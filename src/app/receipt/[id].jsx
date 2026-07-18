import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getItem } from '../../utils/storage';
import axios from 'axios';
import { API_URL } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../../components/BottomTabBar';

export default function ReceiptDetailsScreen() {
  const { id, merchantName: paramMerchant, totalAmount: paramAmount, transactionDate: paramDate, category: paramCategory } = useLocalSearchParams();

  const [merchantName, setMerchantName] = useState(paramMerchant || '');
  const [totalAmount, setTotalAmount] = useState(paramAmount || '');
  const [transactionDate, setTransactionDate] = useState(paramDate || '');
  const [category, setCategory] = useState(paramCategory || 'Other');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If accessed directly without params, load from server
    if (!paramMerchant) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const token = await getItem('userToken');
      if (!token) {
        router.replace('/');
        return;
      }
      const res = await axios.get(`${API_URL}/receipts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const found = (res.data.receipts || []).find((r) => r._id === id);
      if (found) {
        setMerchantName(found.merchantName || '');
        setTotalAmount(String(found.totalAmount || ''));
        setTransactionDate(found.transactionDate || '');
        setCategory(found.category || 'Other');
      } else {
        Alert.alert('Error', 'Receipt not found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!merchantName || !totalAmount) {
      Alert.alert('Error', 'Merchant name and total amount are required');
      return;
    }

    setIsSaving(true);
    try {
      const token = await getItem('userToken');
      
      let res;
      if (id === 'new') {
        res = await axios.post(`${API_URL}/receipts`, {
          merchantName,
          totalAmount: Number(totalAmount),
          transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
          category,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.put(`${API_URL}/receipts`, {
          id,
          merchantName,
          totalAmount: Number(totalAmount),
          transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
          category,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data) {
        Alert.alert(
          'Success', 
          id === 'new' ? 'Receipt created successfully!' : 'Receipt updated successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                if (id === 'new') {
                  router.replace('/dashboard');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = (format) => {
    Alert.alert('Export', `Receipt is being compiled and downloaded as ${format}.`);
  };

  // Helper to format date display in the preview card
  const getFormattedDate = () => {
    try {
      const dateObj = transactionDate ? new Date(transactionDate) : new Date();
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return '';
    }
  };

  const categories = ['Software', 'Travel', 'Meals', 'Office', 'Marketing', 'Other'];

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
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt Details</Text>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>AI Extracted</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Receipt Preview Card */}
          <View style={styles.receiptPreviewCard}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptSubtitle}>RECEIPT DOCUMENT</Text>
              <View style={styles.fileBadge}>
                <Text style={styles.fileBadgeText}>JPG</Text>
              </View>
            </View>
            <View style={styles.dashedLine} />
            <View style={styles.receiptBody}>
              <Text style={styles.receiptMerchantText}>{merchantName || 'New Merchant'}</Text>
              <Text style={styles.receiptDateText}>{getFormattedDate()}</Text>

              {/* Simulated items lists visual */}
              <View style={styles.simulatedItemRow}>
                <View style={styles.simulatedItemLabel} />
                <View style={styles.simulatedItemValue} />
              </View>
              <View style={styles.simulatedItemRow}>
                <View style={styles.simulatedItemLabel2} />
                <View style={styles.simulatedItemValue2} />
              </View>
              <View style={styles.simulatedItemRow}>
                <View style={styles.simulatedItemLabel3} />
                <View style={styles.simulatedItemValue} />
              </View>
            </View>
            <View style={styles.dashedLine} />
            <View style={styles.receiptFooter}>
              <Text style={styles.receiptTotalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.receiptTotalValue}>${Number(totalAmount || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Section: EXTRACTED INFORMATION */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>EXTRACTED INFORMATION</Text>

            {/* Merchant Name Card */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>MERCHANT NAME</Text>
              <TextInput
                style={styles.fieldInput}
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="Enter merchant name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Date Card */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>DATE</Text>
              <TextInput
                style={styles.fieldInput}
                value={transactionDate}
                onChangeText={setTransactionDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Total Amount Card (highlighted with blue border) */}
            <View style={[styles.fieldCard, styles.fieldCardHighlight]}>
              <View style={styles.amountFieldRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, styles.fieldLabelHighlight]}>TOTAL AMOUNT</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.amountInput]}
                    value={totalAmount}
                    onChangeText={setTotalAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyText}>USD</Text>
                </View>
              </View>
            </View>

            {/* Tax Category Card */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>TAX CATEGORY</Text>
              <View style={styles.chipsContainer}>
                {categories.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save Changes Button (Visible only when details are changed) */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            {/* Action Row Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport('CSV')}
              >
                <Ionicons name="document-text" size={18} color="#FFFFFF" style={styles.actionIcon} />
                <Text style={styles.exportButtonText}>Export to CSV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pdfButton}
                onPress={() => handleExport('PDF')}
              >
                <Ionicons name="document" size={18} color="#2563EB" style={styles.actionIcon} />
                <Text style={styles.pdfButtonText}>PDF Invoice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTabBar activeTab="none" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Bottom tab navigation spacer
  },
  receiptPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 20,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  fileBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  fileBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  receiptBody: {
    paddingVertical: 14,
    gap: 8,
  },
  receiptMerchantText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  receiptDateText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  simulatedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 8,
    marginVertical: 4,
  },
  simulatedItemLabel: {
    width: '40%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  simulatedItemLabel2: {
    width: '55%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  simulatedItemLabel3: {
    width: '30%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  simulatedItemValue: {
    width: '15%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  simulatedItemValue2: {
    width: '20%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  receiptTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  receiptTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldCardHighlight: {
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  fieldLabelHighlight: {
    color: '#2563EB',
  },
  fieldInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  amountFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '800',
  },
  currencyBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    height: 52,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 16,
    height: 52,
  },
  pdfButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionIcon: {
    marginRight: 6,
  },
});
