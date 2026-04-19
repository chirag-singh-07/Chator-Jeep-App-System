import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { apiClient } from '@/lib/api';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      // const res = await apiClient.get(`/restaurants/orders/${id}`);
      // setOrder(res.data.data);
      
      // Mock data for UI 
      setTimeout(() => {
        setOrder({
          _id: id,
          orderNumber: id?.toString().slice(-6).toUpperCase(),
          status: 'preparing',
          totalAmount: 1150,
          paymentMethod: 'UPI',
          paymentStatus: 'Paid',
          customerData: {
            name: 'Riya Mehta',
            phone: '+91 9811022334',
            address: 'Sector 21, Noida, UP'
          },
          items: [
            { name: 'Family Burger Box', quantity: 1, price: 999 },
            { name: 'Cold Coffee', quantity: 2, price: 151 }
          ],
          createdAt: new Date().toISOString()
        });
        setLoading(false);
      }, 500);
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
             <Ionicons name="call" size={16} color="white" />
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
          <Text style={styles.infoText}><Text style={styles.boldText}>Method:</Text> {order.paymentMethod}</Text>
          <Text style={styles.infoText}>
             <Text style={styles.boldText}>Status:</Text> 
             <Text style={{ color: order.paymentStatus === 'Paid' ? Colors.light.success : Colors.light.error, fontWeight: 'bold' }}> {order.paymentStatus}</Text>
          </Text>
        </View>

      </ScrollView>

      {/* Persistent Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Print KOT Receipt</Text>
        </TouchableOpacity>
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
    color: 'white',
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
    my: 15,
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
  primaryBtn: {
    backgroundColor: Colors.light.text,
    width: '100%',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
