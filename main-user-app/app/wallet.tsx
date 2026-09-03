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
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useWalletStore } from '@/store/useWalletStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>My Wallet</Text>
              <Text style={styles.headerSubtitle}>Manage your balance</Text>
            </View>
          </View>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.balanceCard}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>₹{balance}</Text>
            </View>
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.addMoneyBtn}>
                <Ionicons name="add-circle" size={20} color="#161616" />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
              <Ionicons name="card" size={32} color="rgba(17,17,17,0.2)" />
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
                { backgroundColor: item.type === 'CREDIT' ? '#D8F5DA' : '#FFF0F0' }
              ]}>
                <Ionicons 
                  name={item.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} 
                  size={20} 
                  color={item.type === 'CREDIT' ? '#39A545' : '#C94444'} 
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
                { color: item.type === 'CREDIT' ? '#39A545' : '#161616' }
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
            <View style={[styles.offerCard, { backgroundColor: '#FFF8D0' }]}>
              <Ionicons name="flash" size={24} color="#806900" />
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
    backgroundColor: '#111',
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 17,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  balanceCard: {
    backgroundColor: '#FFD400',
    marginHorizontal: 18,
    borderRadius: 24,
    padding: 25,
    marginTop: 10,
  },
  balanceInfo: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(17,17,17,0.6)',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    color: '#111',
    fontSize: 40,
    fontFamily: 'Inter-Black',
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
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#111',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#161616',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FFD400',
    fontFamily: 'Inter-Bold',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 18,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#ECECEC',
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
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#161616',
  },
  transactionDate: {
    fontSize: 13,
    color: '#737373',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  transactionAmount: {
    fontSize: 17,
    fontFamily: 'Inter-Black',
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
    backgroundColor: '#FFF8D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#161616',
  },
  emptySubText: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
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
    borderRadius: 20,
    gap: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1A1A1A',
    marginTop: 5,
  },
  offerDesc: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
});
