import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useWalletStore } from '@/store/useWalletStore';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import api from '@/lib/api';

// NOTE: react-native-razorpay is a native module — ensure it is linked in android/ios.
// For Expo bare/managed, use the package directly after expo prebuild.
let RazorpayCheckout: any = null;
try { RazorpayCheckout = require('react-native-razorpay').default; } catch {}

type PaymentMethod = 'COD' | 'ONLINE' | 'WALLET' | 'PARTIAL_WALLET';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, totalAmount, restaurantId, clearCart } = useCartStore();
  const { savedAddresses } = useLocationStore();
  const { placeOrder, isLoading } = useOrderStore();
  const { balance, fetchBalance } = useWalletStore();

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<any>(savedAddresses[0] || null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [useWalletPartial, setUseWalletPartial] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const DELIVERY_FEE = 30;
  const TAXES = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + DELIVERY_FEE + TAXES;

  const walletDeductable = Math.min(balance, grandTotal);
  const remainingAfterWallet = grandTotal - walletDeductable;

  useEffect(() => { fetchBalance(); }, []);

  // Auto-select wallet if full coverage
  const effectivePaymentMethod: PaymentMethod =
    paymentMethod === 'WALLET' ? 'WALLET' :
    paymentMethod === 'ONLINE' && useWalletPartial && walletDeductable > 0 ? 'PARTIAL_WALLET' :
    paymentMethod;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    try {
      const baseOrderData = {
        restaurantId,
        items: items.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        deliveryAddress: `${selectedAddress.label || selectedAddress.type || 'Address'}: ${selectedAddress.line1 || selectedAddress.flat}, ${selectedAddress.city || selectedAddress.area}`,
        location: { type: "Point", coordinates: selectedAddress.coordinates ? [selectedAddress.coordinates.longitude, selectedAddress.coordinates.latitude] : [77.1025, 28.7041] },
        paymentMethod: effectivePaymentMethod,
        useWalletAmount: effectivePaymentMethod === 'PARTIAL_WALLET' ? walletDeductable : undefined,
      };

      // ── Razorpay flow ────────────────────────────────────────────────────
      if (effectivePaymentMethod === 'ONLINE' || effectivePaymentMethod === 'PARTIAL_WALLET') {
        // 1. Place order (creates DB entry, deducts wallet if PARTIAL)
        const order = await placeOrder(baseOrderData);
        const orderId = order._id || order.id;

        // 2. Initiate Razorpay order from backend
        const payRes = await api.post(`/orders/${orderId}/payment`);
        const { razorpayOrderId, amount, currency, key } = payRes.data.data;

        if (!RazorpayCheckout || !key) {
          // Fallback if Razorpay not linked (dev only)
          Alert.alert("Dev Mode", "Razorpay not linked. Order placed, payment pending.");
          clearCart();
          router.push(`/order-tracking/${orderId}`);
          return;
        }

        // 3. Open Razorpay SDK checkout
        const options = {
          description: 'Food Order Payment',
          image: 'https://your-logo-url.png',
          currency,
          key,
          amount: amount * 100,
          name: 'Chator Jeep',
          order_id: razorpayOrderId,
          prefill: { email: '', contact: '' },
          theme: { color: Colors.light.primary },
        };

        const rzpData = await RazorpayCheckout.open(options);

        // 4. Verify on backend
        await api.post(`/orders/${orderId}/payment/verify`, {
          razorpayOrderId: rzpData.razorpay_order_id,
          razorpayPaymentId: rzpData.razorpay_payment_id,
          razorpaySignature: rzpData.razorpay_signature,
        });

        clearCart();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push(`/order-tracking/${orderId}`);
        return;
      }

      // ── COD / Full Wallet flow ───────────────────────────────────────────
      const order = await placeOrder(baseOrderData);
      const orderId = order._id || order.id;
      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/order-tracking/${orderId}`);

    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Something went wrong";
      if (msg.includes('cancelled') || error?.code === 'PAYMENT_CANCELLED') {
        Alert.alert("Payment Cancelled", "Your payment was cancelled.");
      } else {
        Alert.alert("Order Failed", msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const canAffordWithWallet = balance >= grandTotal;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : router.back()} style={styles.backBtn}>
            <Ionicons name={step > 1 ? "arrow-back" : "close"} size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── STEP 1: Address ─────────────────────────────── */}
        {step === 1 ? (
          <Animated.View entering={FadeInRight} style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            {savedAddresses.length > 0 ? (
              savedAddresses.map((addr: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.addressCard, selectedAddress?.label === addr.label && styles.selectedCard]}
                  onPress={() => { setSelectedAddress(addr); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <View style={styles.addressIcon}>
                    <Ionicons name={(addr.label || addr.type) === 'Home' ? "home" : (addr.label || addr.type) === 'Work' ? "briefcase" : "location"} size={20} color={(selectedAddress?.label || selectedAddress?.type) === (addr.label || addr.type) ? Colors.light.primary : "#999"} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.addressType}>{addr.label || addr.type}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>{addr.line1 || addr.flat}, {addr.city || addr.area}</Text>
                  </View>
                  {(selectedAddress?.label || selectedAddress?.type) === (addr.label || addr.type) && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.light.primary} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noAddress}>
                <Ionicons name="location-outline" size={48} color="#DDD" />
                <Text style={styles.noAddressText}>No saved addresses</Text>
                <TouchableOpacity style={styles.addAddrBtn} onPress={() => router.push('/address-picker')}>
                  <Text style={styles.addAddrBtnText}>+ Add Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

        ) : (
          /* ── STEP 2: Payment ─────────────────────────────── */
          <Animated.View entering={FadeInRight} style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            {/* COD */}
            <TouchableOpacity
              style={[styles.paymentCard, paymentMethod === 'COD' && styles.selectedCard]}
              onPress={() => { setPaymentMethod('COD'); setUseWalletPartial(false); }}
            >
              <View style={styles.paymentIconBox}>
                <Ionicons name="cash-outline" size={22} color={paymentMethod === 'COD' ? Colors.light.primary : "#888"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                <Text style={styles.paymentSub}>Pay when your food arrives</Text>
              </View>
              <View style={styles.radio}>{paymentMethod === 'COD' && <View style={styles.radioInner} />}</View>
            </TouchableOpacity>

            {/* Online (Razorpay) */}
            <TouchableOpacity
              style={[styles.paymentCard, paymentMethod === 'ONLINE' && styles.selectedCard]}
              onPress={() => setPaymentMethod('ONLINE')}
            >
              <View style={styles.paymentIconBox}>
                <Ionicons name="card-outline" size={22} color={paymentMethod === 'ONLINE' ? Colors.light.primary : "#888"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Pay Online</Text>
                <Text style={styles.paymentSub}>UPI, Cards, Net Banking (Razorpay)</Text>
              </View>
              <View style={styles.radio}>{paymentMethod === 'ONLINE' && <View style={styles.radioInner} />}</View>
            </TouchableOpacity>

            {/* Wallet (Full) */}
            <TouchableOpacity
              style={[styles.paymentCard, paymentMethod === 'WALLET' && styles.selectedCard, !canAffordWithWallet && styles.disabledCard]}
              onPress={() => canAffordWithWallet ? setPaymentMethod('WALLET') : null}
            >
              <View style={styles.paymentIconBox}>
                <Ionicons name="wallet-outline" size={22} color={paymentMethod === 'WALLET' ? Colors.light.primary : "#888"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Wallet — ₹{balance.toFixed(0)}</Text>
                <Text style={styles.paymentSub}>{canAffordWithWallet ? "Pay fully from wallet" : "Insufficient balance"}</Text>
              </View>
              <View style={styles.radio}>{paymentMethod === 'WALLET' && <View style={styles.radioInner} />}</View>
            </TouchableOpacity>

            {/* Partial wallet toggle (if ONLINE selected and has balance) */}
            {paymentMethod === 'ONLINE' && balance > 0 && (
              <View style={styles.partialWalletRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partialTitle}>Use ₹{walletDeductable.toFixed(0)} from Wallet</Text>
                  <Text style={styles.partialSub}>Pay remaining ₹{remainingAfterWallet.toFixed(0)} online</Text>
                </View>
                <Switch
                  value={useWalletPartial}
                  onValueChange={setUseWalletPartial}
                  trackColor={{ true: Colors.light.primary }}
                  thumbColor="#FFF"
                />
              </View>
            )}

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              {items.map((item: any, i: number) => (
                <View key={i} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel} numberOfLines={1}>{item.quantity}× {item.name}</Text>
                  <Text style={styles.summaryValue}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes (5%)</Text>
                <Text style={styles.summaryValue}>₹{TAXES}</Text>
              </View>
              {(useWalletPartial || paymentMethod === 'WALLET') && walletDeductable > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#22C55E' }]}>Wallet Discount</Text>
                  <Text style={[styles.summaryValue, { color: '#22C55E' }]}>−₹{walletDeductable.toFixed(0)}</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.grandTotalLabel}>Total to Pay</Text>
                <Text style={styles.grandTotalValue}>
                  ₹{(paymentMethod === 'WALLET' ? 0 : useWalletPartial ? remainingAfterWallet : grandTotal).toFixed(0)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Footer ────────────────────────────────────────── */}
      <View style={styles.footer}>
        {step === 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !selectedAddress && styles.btnDisabled]}
            onPress={() => setStep(2)}
            disabled={!selectedAddress}
          >
            <Text style={styles.nextBtnText}>Continue to Payment</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.placeOrderBtn, (isLoading || isProcessing) && styles.btnDisabled]}
            onPress={handlePlaceOrder}
            disabled={isLoading || isProcessing}
          >
            {isLoading || isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="bag-check" size={20} color="#FFF" />
                <Text style={styles.placeOrderText}>
                  {paymentMethod === 'COD' ? 'Place Order (COD)' :
                   paymentMethod === 'WALLET' ? 'Pay from Wallet' :
                   useWalletPartial ? `Pay ₹${remainingAfterWallet.toFixed(0)} Online` :
                   `Pay ₹${grandTotal} Online`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  safeHeader: { backgroundColor: '#FFF', paddingBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  stepDotActive: { backgroundColor: Colors.light.primary },
  stepLine: { width: 50, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: Colors.light.primary },
  scroll: { padding: 20, paddingBottom: 40 },
  stepContent: {},
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111', marginBottom: 18 },
  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1.5, borderColor: '#F3F4F6' },
  selectedCard: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primary + '08' },
  addressIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  addressType: { fontSize: 15, fontWeight: '800', color: '#111' },
  addressText: { fontSize: 12, color: '#666', marginTop: 2 },
  noAddress: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  noAddressText: { color: '#999', fontSize: 14, fontWeight: '600' },
  addAddrBtn: { backgroundColor: Colors.light.primary + '15', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  addAddrBtnText: { color: Colors.light.primary, fontWeight: '800', fontSize: 14 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1.5, borderColor: '#F3F4F6', gap: 14 },
  disabledCard: { opacity: 0.5 },
  paymentIconBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  paymentTitle: { fontSize: 15, fontWeight: '800', color: '#111' },
  paymentSub: { fontSize: 12, color: '#888', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.light.primary },
  partialWalletRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 18, marginBottom: 14, gap: 12 },
  partialTitle: { fontSize: 14, fontWeight: '800', color: '#166534' },
  partialSub: { fontSize: 11, color: '#4D7C0F', marginTop: 2 },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginTop: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: '#111', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#666', fontWeight: '600', flex: 1, marginRight: 10 },
  summaryValue: { fontWeight: '700', color: '#111' },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  grandTotalLabel: { fontSize: 16, fontWeight: '900', color: '#111' },
  grandTotalValue: { fontSize: 20, fontWeight: '900', color: Colors.light.primary },
  footer: { padding: 20, paddingBottom: 36, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nextBtn: { backgroundColor: Colors.light.primary, height: 58, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  btnDisabled: { opacity: 0.45 },
  placeOrderBtn: { backgroundColor: '#22C55E', height: 58, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  placeOrderText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
