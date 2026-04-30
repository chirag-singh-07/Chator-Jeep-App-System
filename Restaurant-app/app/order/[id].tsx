import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { apiClient } from '@/lib/api';
import { useOrderStore } from '@/store/useOrderStore';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prepTime, setPrepTime] = useState('15');

  const { orders, updateOrderStatus } = useOrderStore();

  useEffect(() => {
    const foundOrder = orders.find(o => o._id === id);
    if (foundOrder) {
      setOrder(foundOrder);
      setLoading(false);
    } else {
      fetchOrderDetails();
    }
  }, [id, orders]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders/restaurant`);
      const matchedOrder = res.data.data.find((o: any) => o._id === id);
      if (matchedOrder) {
        setOrder(matchedOrder);
      }
      setLoading(false);
    } catch (e) {
      console.warn("Error fetching order details", e);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={{ color: Colors.light.primary, marginTop: 10 }}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Tracker */}
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>CURRENT STATUS</Text>
          <Text style={[styles.statusValue, { color: Colors.light.primary }]}>
            {order.status.toUpperCase().replace('_', ' ')}
          </Text>
        </View>

        {/* Customer Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Customer Details</Text>
          </View>
          <Text style={styles.infoText}><Text style={styles.boldText}>Name:</Text> {order.customerData.name}</Text>
          <Text style={styles.infoText}><Text style={styles.boldText}>Phone:</Text> {order.customerData.phone}</Text>
          <Text style={styles.infoText}><Text style={styles.boldText}>Delivery Address:</Text> {order.customerData.address}</Text>
          
          <TouchableOpacity style={styles.actionBtn}>
             <Ionicons name="call" size={16} color="black" />
             <Text style={styles.actionBtnText}>Call Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Order Items */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fast-food" size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Order Items</Text>
          </View>
          
          {order.items.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.qtyBox}><Text style={styles.qtyText}>{item.quantity}x</Text></View>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
             <Text style={styles.totalLabel}>Total Amount</Text>
             <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {/* Payment & Other Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>
          <Text style={styles.infoText}><Text style={styles.boldText}>Method:</Text> {order.paymentMethod || "Online"}</Text>
          <Text style={styles.infoText}>
             <Text style={styles.boldText}>Status:</Text> 
             <Text style={{ color: order.paymentStatus === 'Paid' ? Colors.light.success : Colors.light.error, fontWeight: 'bold' }}> {order.paymentStatus || "Paid"}</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Persistent Bottom Action */}
      <View style={styles.footer}>
        {order.status === 'ACCEPTED' && (
           <>
              <View style={styles.prepTimeRow}>
                 <Text style={styles.prepTimeLabel}>Prep Time (mins):</Text>
                 <TextInput 
                   style={styles.prepTimeInput} 
                   value={prepTime} 
                   onChangeText={setPrepTime} 
                   keyboardType="numeric" 
                 />
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => updateOrderStatus(order._id, 'PREPARING')}>
                <Ionicons name="flame" size={20} color="#000" />
                <Text style={styles.primaryBtnText}>Start Preparing</Text>
              </TouchableOpacity>
           </>
        )}
        
        {order.status === 'PREPARING' && (
           <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: '#00E676'}]} onPress={() => updateOrderStatus(order._id, 'READY')}>
             <Ionicons name="checkmark-circle" size={20} color="#000" />
             <Text style={styles.primaryBtnText}>Ready for Pickup</Text>
           </TouchableOpacity>
        )}
        
        {order.status === 'READY' && (
           <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: '#FF8C00'}]} onPress={() => updateOrderStatus(order._id, 'OUT_FOR_DELIVERY')}>
             <Ionicons name="bicycle" size={20} color="#000" />
             <Text style={styles.primaryBtnText}>Handover to Rider</Text>
           </TouchableOpacity>
        )}
        
        {['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
           <TouchableOpacity style={styles.secondaryBtn}>
             <Ionicons name="print" size={20} color="#FFF" />
             <Text style={styles.secondaryBtnText}>Print KOT Receipt</Text>
           </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  content: {
    padding: 20,
    gap: 15,
  },
  statusBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.textMuted,
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  boldText: {
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    gap: 8,
  },
  actionBtnText: {
    color: 'black',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  qtyBox: {
    backgroundColor: '#F0F0F0',
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  qtyText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.textMuted,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  prepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  prepTimeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },
  prepTimeInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: 'bold',
    width: 80,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    width: '100%',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    backgroundColor: '#111',
    flexDirection: 'row',
    width: '100%',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
