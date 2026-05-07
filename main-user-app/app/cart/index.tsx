import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/useCartStore';
import Animated, { FadeInDown, SlideInBottom } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const { items, restaurantName, totalAmount, totalItems, updateQuantity, clearCart } = useCartStore();

  const deliveryFee = 30;
  const taxes = Math.round(totalAmount * 0.05); // 5% GST
  const grandTotal = totalAmount + deliveryFee + taxes;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContent}>
           <Image 
             source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }} 
             style={styles.emptyImg} 
           />
           <Text style={styles.emptyTitle}>Your cart is empty</Text>
           <Text style={styles.emptySub}>Good food is always cooking! Go ahead, order some yummy items from the menu.</Text>
           <TouchableOpacity 
             style={styles.shopBtn}
             onPress={() => router.push('/(tabs)')}
           >
             <Text style={styles.shopBtnText}>Browse Restaurants</Text>
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <View style={{marginLeft: 15}}>
              <Text style={styles.headerTitle}>{restaurantName}</Text>
              <Text style={styles.headerSub}>{totalItems} items in cart</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => {
            Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: clearCart }
            ]);
          }}>
            <Ionicons name="trash-outline" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cart Items */}
        <View style={styles.section}>
          {items.map((item, index) => (
            <Animated.View entering={FadeInDown.delay(index * 100)} key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100' }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity 
                  style={styles.qtyBtn} 
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item.id, -1); }}
                >
                  <Ionicons name="remove" size={16} color={Colors.light.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity 
                  style={styles.qtyBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item.id, 1); }}
                >
                  <Ionicons name="add" size={16} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Bill Details */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.billRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Ionicons name="information-circle-outline" size={12} color="#999" style={{marginLeft: 5}} />
            </View>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST and Restaurant Charges</Text>
            <Text style={styles.billValue}>₹{taxes}</Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.policyCard}>
           <Text style={styles.policyTitle}>Cancellation Policy</Text>
           <Text style={styles.policyText}>Orders cannot be cancelled once packed for delivery. In case of unexpected delay, a refund will be provided.</Text>
        </View>
      </ScrollView>

      {/* Footer Checkout */}
      <Animated.View entering={SlideInBottom} style={styles.footer}>
         <View style={styles.footerLeft}>
            <Text style={styles.footerPrice}>₹{grandTotal}</Text>
            <Text style={styles.viewDetailedBill}>VIEW DETAILED BILL</Text>
         </View>
         <TouchableOpacity 
           activeOpacity={0.9} 
           style={styles.checkoutBtn}
           onPress={() => router.push('/checkout')}
         >
            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
         </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  safeHeader: { backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.light.text },
  headerSub: { fontSize: 12, color: Colors.light.textMuted, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 150 },
  section: { backgroundColor: '#FFF', borderRadius: 25, padding: 15, marginBottom: 20 },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  itemImg: { width: 60, height: 60, borderRadius: 15 },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: Colors.light.primary + '20' },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { marginHorizontal: 10, fontWeight: '900', color: Colors.light.primary, fontSize: 14 },
  billCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, marginBottom: 20 },
  billTitle: { fontSize: 16, fontWeight: '900', color: Colors.light.text, marginBottom: 15 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  billValue: { fontSize: 14, color: Colors.light.text, fontWeight: '700' },
  billDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '900', color: Colors.light.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: Colors.light.text },
  policyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 20 },
  policyTitle: { fontSize: 14, fontWeight: '800', color: Colors.light.text, marginBottom: 5 },
  policyText: { fontSize: 12, color: '#999', lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, paddingBottom: 35, flexDirection: 'row', alignItems: 'center', borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  footerLeft: { flex: 1 },
  footerPrice: { fontSize: 20, fontWeight: '900', color: Colors.light.text },
  viewDetailedBill: { fontSize: 10, fontWeight: '800', color: Colors.light.primary, marginTop: 2 },
  checkoutBtn: { backgroundColor: Colors.light.primary, flex: 2, height: 55, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  emptyContainer: { flex: 1, backgroundColor: '#FFF' },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyImg: { width: 200, height: 200, marginBottom: 30 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: Colors.light.text },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  shopBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, marginTop: 30 },
  shopBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
