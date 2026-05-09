import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '@/store/useWalletStore';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
} from 'react-native-reanimated';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function WalletScreen() {
  const router = useRouter();
  const { balance, transactions, isLoading, fetchBalance, fetchTransactions } = useWalletStore();

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    fetchBalance();
    fetchTransactions();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Balance Card */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Wallet</Text>
            <View style={{ width: 45 }} />
          </View>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.balanceCard}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
            </View>
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.addMoneyBtn}>
                <Ionicons name="add-circle" size={20} color="#1A1A1A" />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
              <Ionicons name="card" size={32} color="rgba(255,255,255,0.2)" />
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.light.primary} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          transactions.map((item, index) => (
            <Animated.View 
              key={item._id || index} 
              entering={FadeInDown.delay(index * 100)}
              style={styles.transactionCard}
            >
              <View style={[
                styles.iconBox, 
                { backgroundColor: item.type === 'CREDIT' ? '#E8F5E9' : '#FFEBEE' }
              ]}>
                <Ionicons 
                  name={item.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} 
                  size={20} 
                  color={item.type === 'CREDIT' ? '#2E7D32' : '#C62828'} 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{item.description || 'Order Payment'}</Text>
                <Text style={styles.transactionDate}>
                  {item.createdAt ? format(new Date(item.createdAt), 'dd MMM, hh:mm a') : 'Recently'}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: item.type === 'CREDIT' ? '#2E7D32' : '#1A1A1A' }
              ]}>
                {item.type === 'CREDIT' ? '+' : '-'}₹{item.amount}
              </Text>
            </Animated.View>
          ))
        ) : !isLoading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={40} color="#DDD" />
            </View>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>When you order or add money, it will show up here.</Text>
          </View>
        )}

        {isLoading && transactions.length === 0 && (
          <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 50 }} />
        )}

        <View style={styles.offersSection}>
          <Text style={styles.sectionTitle}>Wallet Offers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersList}>
            <View style={[styles.offerCard, { backgroundColor: '#F0F7FF' }]}>
              <Ionicons name="gift" size={24} color="#007AFF" />
              <Text style={styles.offerTitle}>Flat ₹50 Cashback</Text>
              <Text style={styles.offerDesc}>On first wallet recharge above ₹500</Text>
            </View>
            <View style={[styles.offerCard, { backgroundColor: '#FFF5F0' }]}>
              <Ionicons name="flash" size={24} color="#FF6B00" />
              <Text style={styles.offerTitle}>Super Fast Refunds</Text>
              <Text style={styles.offerDesc}>Instant refunds to your wallet</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 25,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  balanceCard: {
    backgroundColor: Colors.light.primary,
    marginHorizontal: 25,
    borderRadius: 30,
    padding: 25,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceInfo: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    color: '#1A1A1A',
    fontSize: 40,
    fontWeight: '900',
    marginTop: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
    gap: 8,
  },
  addMoneyText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '800',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  offersSection: {
    marginTop: 30,
    marginBottom: 50,
  },
  offersList: {
    paddingTop: 15,
    gap: 15,
  },
  offerCard: {
    width: 220,
    padding: 20,
    borderRadius: 25,
    gap: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 5,
  },
  offerDesc: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    lineHeight: 18,
  },
});
