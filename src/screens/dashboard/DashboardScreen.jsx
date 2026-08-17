import BottomTabBar from '@/components/BottomTabBar';
import { API_URL } from '@/constants/api';
import { getItem } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './DashboardScreen.styles';

export default function DashboardScreen() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Gus');
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    loadUserInfo();
    fetchReceipts();
  }, []);

  const loadUserInfo = async () => {
    try {
      const name = await getItem('userName');
      const isProVal = await getItem('userIsPro');
      if (name) setUserName(name);
      if (isProVal) setIsPro(isProVal === 'true');
    } catch (e) {
      console.error('Failed to load user info', e);
    }
  };

  const fetchReceipts = async () => {
    try {
      const token = await getItem('userToken');
      if (!token) {
        router.replace('/');
        return;
      }
      const res = await axios.get(`${API_URL}/receipts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReceipts(res.data.receipts || []);
      if (res.data.isPro !== undefined) {
        setIsPro(res.data.isPro);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch receipts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  const formatCurrency = (amount) => {
    return '$' + Number(amount).toFixed(2);
  };

  // Calculate dynamic stats
  const totalExpenses = receipts.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const totalCount = receipts.length;
  const categoriesCount = new Set(receipts.map((item) => item.category)).size;

  // Format dynamic month/year for header card
  const getCurrentMonthName = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const d = new Date();
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Helper to get category icons and colors
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Software':
        return {
          icon: 'laptop-outline',
          bg: '#EEF2FF',
          color: '#4F46E5',
        };
      case 'Travel':
        return {
          icon: 'car-outline',
          bg: '#FFF7ED',
          color: '#EA580C',
        };
      case 'Meals':
        return {
          icon: 'restaurant-outline',
          bg: '#ECFDF5',
          color: '#059669',
        };
      case 'Office':
        return {
          icon: 'briefcase-outline',
          bg: '#F0F9FF',
          color: '#0284C7',
        };
      case 'Marketing':
        return {
          icon: 'megaphone-outline',
          bg: '#FDF2F8',
          color: '#DB2777',
        };
      default:
        return {
          icon: 'receipt-outline',
          bg: '#F8FAFC',
          color: '#475569',
        };
    }
  };

  const renderItem = ({ item }) => {
    const theme = getCategoryTheme(item.category);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.receiptCard}
        onPress={() =>
          router.push({
            pathname: `/receipt/${item._id}`,
            params: {
              merchantName: item.merchantName,
              totalAmount: item.totalAmount,
              transactionDate: item.transactionDate,
              category: item.category,
              imageUrl: item.imageUrl || '',
            },
          })
        }
      >
        <View style={styles.receiptLeft}>
          <View style={[styles.categoryIconContainer, { backgroundColor: theme.bg }]}>
            <Ionicons name={theme.icon} size={22} color={theme.color} />
          </View>
          <View style={styles.receiptMeta}>
            <Text style={styles.merchantText} numberOfLines={1}>
              {item.merchantName}
            </Text>
            <Text style={styles.categoryDateText}>
              {item.category} • {new Date(item.transactionDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <Text style={styles.amountText}>{formatCurrency(item.totalAmount)}</Text>
      </TouchableOpacity>
    );
  };

  // Header Component for the FlatList
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Welcome Bar */}
      <View style={styles.welcomeBar}>
        <View>
          <Text style={styles.welcomeSubtitle}>WELCOME BACK</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.welcomeTitle}>Hello, {userName} 🖐</Text>
            {isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.statusDot} />
        </View>
      </View>

      {/* Blue Expenses Card */}
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.expensesCard}
      >
        <View style={styles.expensesLeft}>
          <Text style={styles.expensesLabel}>TOTAL EXPENSES</Text>
          <Text style={styles.expensesMonth}>{getCurrentMonthName()}</Text>
          <Text style={styles.expensesAmount}>
            {formatCurrency(totalExpenses)}
          </Text>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={14} color="#10B981" />
            <Text style={styles.trendText}>+12.4% vs last month</Text>
          </View>
        </View>

        {/* Dynamic circular chart visual representation */}
        <View style={styles.chartContainer}>
          <View style={styles.circleOutline}>
            <View style={styles.circleInner} />
          </View>
        </View>

        {/* Wave Graphic overlay at the bottom */}
        <View style={styles.waveOverlay}>
          <View style={styles.waveLine} />
        </View>
      </LinearGradient>

      {/* Stats row cards */}
      <View style={styles.statsRow}>
        <View style={styles.statsCard}>
          <View style={styles.statsIconBox}>
            <Ionicons name="document-text-outline" size={20} color="#64748B" />
          </View>
          <View>
            <Text style={styles.statsNumber}>{totalCount}</Text>
            <Text style={styles.statsLabel}>Receipts Scanned</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsIconBox}>
            <Ionicons name="pricetag-outline" size={20} color="#64748B" />
          </View>
          <View>
            <Text style={styles.statsNumber}>{categoriesCount}</Text>
            <Text style={styles.statsLabel}>Categories</Text>
          </View>
        </View>
      </View>

      {/* Recent Scans header */}
      <View style={styles.recentScansHeader}>
        <Text style={styles.recentTitle}>Recent Scans</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.seeAllText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No receipts found. Scan one to get started!</Text>
            </View>
          }
        />
      )}
      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
}
