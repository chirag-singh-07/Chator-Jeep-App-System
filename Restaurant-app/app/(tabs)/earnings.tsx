import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/lib/api';

export default function EarningsScreen() {
  const [stats, setStats] = useState({ balance: 0, totalEarnings: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Withdrawal Modal State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        apiClient.get('/wallet/stats'),
        apiClient.get('/wallet/withdrawals')
      ]);
      setStats(statsRes.data.data);
      setHistory(historyRes.data.data);
    } catch (e) {
      console.warn("Failed to fetch wallet data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleWithdrawal = async () => {
    const val = parseFloat(amount);
    if (!val || val < 100) {
      Alert.alert("Invalid Amount", "Minimum withdrawal is ₹100");
      return;
    }
    if (val > stats.balance) {
      Alert.alert("Insufficient Balance", "You cannot withdraw more than your current balance.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/wallet/withdraw', { amount: val });
      Alert.alert("Success", "Withdrawal request submitted! It will be processed in 1-2 business days.");
      setShowWithdraw(false);
      setAmount("");
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
     return (
       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator size="large" color={Colors.light.primary} />
       </View>
     );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings Center</Text>
          <Text style={styles.headerSubtitle}>Manage your revenue and payouts</Text>
        </View>

        {/* Premium Wallet Card */}
        <View style={styles.walletCard}>
           <View style={styles.walletTop}>
              <View>
                 <Text style={styles.balanceLabel}>Available for Payout</Text>
                 <Text style={styles.balanceValue}>₹{stats.balance.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.walletIconContainer}>
                 <Ionicons name="card" size={32} color="black" />
              </View>
           </View>
           
           <TouchableOpacity 
             style={styles.withdrawBtn} 
             onPress={() => setShowWithdraw(true)}
           >
             <Text style={styles.withdrawText}>Request Transfer</Text>
             <Ionicons name="arrow-forward" size={18} color="black" />
           </TouchableOpacity>
        </View>

        {/* Quick Analytics Grid */}
        <View style={styles.analyticsRow}>
          <View style={styles.metricBox}>
            <View style={styles.metricIcon}>
               <Ionicons name="trending-up" size={18} color={Colors.light.primary} />
            </View>
            <Text style={styles.metricLabel}>Total Earnings</Text>
            <Text style={styles.metricValue}>₹{stats.totalEarnings.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.metricBox}>
            <View style={styles.metricIcon}>
               <Ionicons name="swap-horizontal" size={18} color={Colors.light.primary} />
            </View>
            <Text style={styles.metricLabel}>Total Transfers</Text>
            <Text style={styles.metricValue}>{history.length}</Text>
          </View>
        </View>

        {/* Transaction History Section */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.historyTitle}>Payout Reports</Text>
            <Ionicons name="filter" size={20} color="#666" />
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={50} color="#1A1A1A" />
              <Text style={styles.emptyText}>No transfer history found</Text>
              <Text style={styles.emptySubText}>Your processed payouts will appear here</Text>
            </View>
          ) : (
            history.map(tx => (
                <View key={tx._id} style={styles.txCard}>
                    <View style={styles.txLeft}>
                        <View style={[styles.txIconCircle, { 
                          backgroundColor: tx.status === 'COMPLETED' ? 'rgba(76, 175, 80, 0.1)' : 
                                          tx.status === 'REJECTED' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 255, 255, 0.05)' 
                        }]}>
                            <Ionicons 
                                name={tx.status === 'COMPLETED' ? "checkmark-circle" : tx.status === 'REJECTED' ? "close-circle" : "sync"} 
                                size={22} 
                                color={tx.status === 'COMPLETED' ? Colors.light.success : tx.status === 'REJECTED' ? Colors.light.error : "#888"} 
                            />
                        </View>
                        <View>
                            <Text style={styles.txDesc}>₹{tx.amount.toLocaleString('en-IN')}</Text>
                            <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                        </View>
                    </View>
                    <View style={styles.txRight}>
                        <View style={[styles.statusTag, { 
                          backgroundColor: tx.status === 'COMPLETED' ? Colors.light.success + '20' : 
                                         tx.status === 'REJECTED' ? Colors.light.error + '20' : '#222' 
                        }]}>
                          <Text style={[styles.statusTagText, { 
                            color: tx.status === 'COMPLETED' ? Colors.light.success : 
                                   tx.status === 'REJECTED' ? Colors.light.error : '#888' 
                          }]}>{tx.status}</Text>
                        </View>
                    </View>
                </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* PREMIUM WITHDRAW MODAL */}
      <Modal visible={showWithdraw} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Request Payout</Text>
                    <TouchableOpacity onPress={() => setShowWithdraw(false)} style={styles.closeModal}>
                       <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                    <Text style={styles.modalSub}>Funds will be credited to your linked accounts within 48 business hours.</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Amount to Withdraw</Text>
                        <View style={styles.amountInputRow}>
                           <Text style={styles.currencySymbol}>₹</Text>
                           <TextInput 
                              style={styles.amountInput}
                              placeholder="0"
                              placeholderTextColor="#333"
                              keyboardType="numeric"
                              value={amount}
                              onChangeText={setAmount}
                              autoFocus
                           />
                        </View>
                        <View style={styles.balanceInfo}>
                           <Text style={styles.balanceHint}>Total Available: ₹{stats.balance.toLocaleString('en-IN')}</Text>
                           <TouchableOpacity onPress={() => setAmount(stats.balance.toString())}>
                              <Text style={styles.maxBtn}>Use Max</Text>
                           </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.confirmBtn, (submitting || !amount) && { opacity: 0.5 }]} 
                        onPress={handleWithdrawal}
                        disabled={submitting || !amount}
                    >
                        {submitting ? (
                          <ActivityIndicator color="black" />
                        ) : (
                          <>
                            <Text style={styles.confirmBtnText}>Request Transfer Now</Text>
                            <Ionicons name="paper-plane" size={20} color="black" />
                          </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.feeNotice}>* Transfer fee may apply based on bank policies.</Text>
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  walletCard: {
    backgroundColor: Colors.light.primary,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 24,
    borderRadius: 32,
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    color: 'black',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 5,
  },
  withdrawBtn: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  withdrawText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  analyticsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 4,
  },
  historySection: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 18,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#111',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  txIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDesc: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  txDate: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: '#0A0A0A',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#111',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 12,
    color: '#222',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#222',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 30,
    position: 'relative',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeModal: {
    position: 'absolute',
    right: 25,
    top: 30,
    padding: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  modalBody: {
    paddingHorizontal: 30,
  },
  modalSub: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 15,
    textAlign: 'center',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderColor: '#222',
    paddingBottom: 10,
    marginHorizontal: 30,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    marginRight: 10,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    minWidth: 100,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  balanceHint: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  maxBtn: {
    color: Colors.light.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    padding: 20,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  confirmBtnText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
  },
  feeNotice: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginTop: 15,
  }
});

