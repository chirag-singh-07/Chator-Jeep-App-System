import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function EarningsScreen() {
  const transactionHistory = [
    { id: 'tx_1', date: '19 Apr 2026', desc: 'Order Payout #CJ12091', amount: '+₹450' },
    { id: 'tx_2', date: '19 Apr 2026', desc: 'Order Payout #CJ12090', amount: '+₹1240' },
    { id: 'tx_3', date: '18 Apr 2026', desc: 'Bank Withdrawal', amount: '-₹5000' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings & Wallet</Text>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>₹12,450</Text>
          
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawText}>Request Payout</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Analytics */}
        <View style={styles.analyticsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Today</Text>
            <Text style={styles.metricValue}>₹4,200</Text>
            <Text style={styles.metricTrend}>+12%</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>This Week</Text>
            <Text style={styles.metricValue}>₹28,500</Text>
            <Text style={styles.metricTrend}>+5%</Text>
          </View>
        </View>

        {/* Graphical Placeholder */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
             <Text style={styles.chartTitle}>Weekly Revenue</Text>
             <Ionicons name="bar-chart" size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.chartPlaceholder}>
             {/* Note: React Native Chart Kit or similar required for actual SVG charts */}
             <View style={styles.dummyBarContainer}>
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <View key={i} style={styles.barCol}>
                     <View style={[styles.barFill, { height: `${h}%` }]} />
                     <Text style={styles.barDay}>{['M','T','W','T','F','S','S'][i]}</Text>
                  </View>
                ))}
             </View>
          </View>
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          {transactionHistory.map(tx => (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txLeft}>
                <View style={styles.txIcon}>
                  <Ionicons name={tx.amount.startsWith('-') ? "arrow-up" : "arrow-down"} size={16} color={tx.amount.startsWith('-') ? "red" : Colors.light.success} />
                </View>
                <View>
                  <Text style={styles.txDesc}>{tx.desc}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount.startsWith('-') ? Colors.light.text : Colors.light.success }]}>
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
  },
  walletCard: {
    backgroundColor: Colors.light.primary,
    margin: 20,
    marginTop: 10,
    padding: 25,
    borderRadius: 30,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
    marginVertical: 10,
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 15,
  },
  withdrawText: {
    color: 'white',
    fontWeight: 'bold',
  },
  analyticsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 5,
  },
  metricTrend: {
    color: Colors.light.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  chartPlaceholder: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dummyBarContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barCol: {
    width: '10%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 5,
  },
  barDay: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.textMuted,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 15,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDesc: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  txDate: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '900',
  }
});
