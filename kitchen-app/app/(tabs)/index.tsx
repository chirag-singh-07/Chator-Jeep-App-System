import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const RECENT_ORDERS = [
  { id: '101', customer: 'John Doe', items: '2x Burger, 1x Coke', total: '₹450', status: 'In Prep' },
  { id: '102', customer: 'Jane Smith', items: '1x Veg Pizza Large', total: '₹599', status: 'Ready' },
  { id: '103', customer: 'Rahul K.', items: '3x Paneer Tikka', total: '₹840', status: 'Pending' },
];

export default function KitchenDashboard() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Operational Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kitchenName}>Royal Spice Kitchen</Text>
            <Text style={[styles.statusText, { color: isOpen ? Colors.light.success : Colors.light.error }]}>
              {isOpen ? '● OPEN FOR ORDERS' : '● CLOSED'}
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <Switch
              trackColor={{ false: '#767577', true: Colors.light.success + '50' }}
              thumbColor={isOpen ? Colors.light.success : '#f4f3f4'}
              onValueChange={setIsOpen}
              value={isOpen}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
             <Ionicons name="cart" size={24} color={Colors.light.primary} />
             <Text style={styles.statValue}>12</Text>
             <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={styles.statCard}>
             <Ionicons name="cash" size={24} color="#4CAF50" />
             <Text style={styles.statValue}>₹4.2k</Text>
             <Text style={styles.statLabel}>Today's Revenue</Text>
          </View>
          <View style={styles.statCard}>
             <Ionicons name="star" size={24} color="#FFD700" />
             <Text style={styles.statValue}>4.8</Text>
             <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Management</Text>
        </View>
        <View style={styles.actionsRow}>
           <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="fast-food" size={20} color="white" />
              <Text style={styles.actionBtnText}>Update Menu</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="megaphone" size={20} color="white" />
              <Text style={styles.actionBtnText}>Broadcast Offer</Text>
           </TouchableOpacity>
        </View>

        {/* Live Orders Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Incoming Orders</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        
        <View style={styles.ordersList}>
           {RECENT_ORDERS.map((order) => (
             <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderLeft}>
                   <Text style={styles.orderId}>#{order.id}</Text>
                   <Text style={styles.customerName}>{order.customer}</Text>
                   <Text style={styles.orderItems} numberOfLines={1}>{order.items}</Text>
                </View>
                <View style={styles.orderRight}>
                   <Text style={styles.orderTotal}>{order.total}</Text>
                   <View style={[
                     styles.statusBadge, 
                     { backgroundColor: order.status === 'Ready' ? Colors.light.success + '20' : '#FFF5F5' }
                   ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        { color: order.status === 'Ready' ? Colors.light.success : Colors.light.primary }
                      ]}>{order.status}</Text>
                   </View>
                </View>
             </View>
           ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  kitchenName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 1,
  },
  switchContainer: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    padding: 20,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  viewAll: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  ordersList: {
    paddingHorizontal: 20,
    gap: 15,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  orderItems: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
  orderRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
