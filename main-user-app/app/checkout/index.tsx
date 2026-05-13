import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useOrderStore } from '@/store/useOrderStore';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import api from '@/lib/api';
import RazorpayCheckout from 'react-native-razorpay';

WebBrowser.maybeCompleteAuthSession();

type PaymentMethod = 'COD' | 'ONLINE';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, totalAmount, restaurantId, clearCart } = useCartStore();
  const { savedAddresses, currentAddress } = useLocationStore();
  const { placeOrder, isLoading } = useOrderStore();

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<any>(savedAddresses[0] || currentAddress || null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const defaultAddress = currentAddress || savedAddresses[0] || null;
    if (!selectedAddress || (currentAddress && selectedAddress?.id !== currentAddress.id)) {
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [savedAddresses, currentAddress]);

  const addressList = savedAddresses.length > 0 ? savedAddresses : currentAddress ? [currentAddress] : [];

  const [discount, setDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const DELIVERY_FEE = 30;
  const TAXES = Math.round(totalAmount * 0.05);
  const subTotal = totalAmount + DELIVERY_FEE + TAXES;
  const grandTotal = Math.max(0, subTotal - discount);

  const handleRazorpayPayment = async (razorpayData: any) => {
    const options = {
      description: 'Food Order Payment',
      image: 'https://chatorijeeb.com/logo.png',
      currency: razorpayData.currency || 'INR',
      key: razorpayData.key,
      amount: razorpayData.amount,
      name: 'Chatori Jeeb',
      order_id: razorpayData.razorpayOrderId,
      prefill: {
        email: 'user@example.com',
        contact: '9876543210',
        name: 'Customer',
      },
      theme: { color: '#3399cc' }
    };

    try {
      const data = await RazorpayCheckout.open(options);
      return {
        razorpayOrderId: razorpayData.razorpayOrderId,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature,
      };
    } catch (error: any) {
      console.log('Razorpay Error:', error);
      throw new Error(error.description || error.reason || 'Payment failed or cancelled');
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode) return;
    setIsApplyingPromo(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      const code = promoCode.toUpperCase();
      let appliedDiscount = 0;
      if (code === 'CHATORI100') appliedDiscount = 100;
      else if (code === 'SAVE50') appliedDiscount = 50;
      else if (code === 'WELCOME') appliedDiscount = Math.round(totalAmount * 0.2);

      if (appliedDiscount > 0) {
        setDiscount(appliedDiscount);
        Alert.alert('Success', 'Promo code applied!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setDiscount(0);
        Alert.alert('Error', 'Invalid promo code');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    try {
      const baseOrderData = {
        restaurantId,
        items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        deliveryAddress: `${selectedAddress.label || selectedAddress.type || 'Address'}: ${selectedAddress.line1 || selectedAddress.flat}, ${selectedAddress.city || selectedAddress.area}`,
        location: {
          type: 'Point',
          coordinates: selectedAddress.coordinates
            ? [selectedAddress.coordinates.longitude, selectedAddress.coordinates.latitude]
            : [77.1025, 28.7041],
        },
        paymentMethod: paymentMethod,
      };

      if (paymentMethod === 'ONLINE') {
        const payRes = await api.post('/orders/payment/checkout', baseOrderData);
        const razorpayData = payRes.data.data;
        const paymentResult = await handleRazorpayPayment(razorpayData);

        const createRes = await api.post('/orders/payment/verify-create', {
          ...baseOrderData,
          ...paymentResult,
        });
        const order = createRes.data.data;
        const orderId = order._id || order.id;

        clearCart();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push(`/order/status?status=success&orderId=${orderId}`);
        return;
      }

      const order = await placeOrder(baseOrderData);
      const orderId = order._id || order.id;
      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/order/status?status=success&orderId=${orderId}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Something went wrong';
      if (paymentMethod === 'ONLINE') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        router.push(`/order/status?status=failed&reason=${encodeURIComponent(msg)}`);
      } else {
        Alert.alert('Order Failed', msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (step > 1 ? setStep((value) => value - 1) : router.back())} style={styles.backBtn}>
            <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={{ width: 50, height: 2, backgroundColor: step >= 2 ? Colors.light.primary : '#E5E7EB', marginHorizontal: 6 }} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <Animated.View entering={FadeInRight} style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            {addressList.length > 0 ? (
              <>
                {addressList.map((addr: any, index: number) => (
                  <TouchableOpacity
                    key={addr.id || index}
                    style={[styles.addressCard, selectedAddress?.id === addr.id && styles.selectedCard]}
                    onPress={() => setSelectedAddress(addr)}
                  >
                    <View style={styles.addressIcon}>
                      <Ionicons
                        name={(addr.label || addr.type) === 'Home' ? 'home' : 'location'}
                        size={20}
                        color={(selectedAddress?.id === addr.id) ? Colors.light.primary : '#999'}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={styles.addressType}>{addr.label || addr.type}</Text>
                      <Text style={styles.addressText}>{addr.line1 || `${addr.flat}, ${addr.area}`}</Text>
                      {addr.city ? <Text style={styles.addressText}>{addr.city}</Text> : null}
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.addAddressBtn, { marginTop: 10 }]} onPress={() => router.push('/address-picker')}>
                  <Text style={styles.addAddressBtnText}>Add New Address</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No delivery address found</Text>
                <Text style={styles.emptyText}>Please add an address before placing your order.</Text>
                <TouchableOpacity style={styles.addAddressBtn} onPress={() => router.push('/address-picker')}>
                  <Text style={styles.addAddressBtnText}>Add New Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInRight} style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <TouchableOpacity
              style={[styles.paymentCard, paymentMethod === 'COD' && styles.selectedCard]}
              onPress={() => setPaymentMethod('COD')}
            >
              <Ionicons name="cash-outline" size={22} color={paymentMethod === 'COD' ? Colors.light.primary : '#888'} />
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              </View>
              <View style={styles.radio}>{paymentMethod === 'COD' && <View style={styles.radioInner} />}</View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentCard, paymentMethod === 'ONLINE' && styles.selectedCard]}
              onPress={() => setPaymentMethod('ONLINE')}
            >
              <Ionicons name="card-outline" size={22} color={paymentMethod === 'ONLINE' ? '#3399cc' : '#888'} />
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Online Payment</Text>
              </View>
              <View style={styles.radio}>{paymentMethod === 'ONLINE' && <View style={[styles.radioInner, { backgroundColor: '#3399cc' }]} />}</View>
            </TouchableOpacity>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>Rs.{totalAmount}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.grandTotalLabel}>Total to Pay</Text>
                <Text style={styles.grandTotalValue}>Rs.{grandTotal}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)} disabled={!selectedAddress}>
            <Text style={styles.nextBtnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={isProcessing}>
            <Text style={styles.placeOrderText}>{isProcessing ? 'Processing...' : paymentMethod === 'ONLINE' ? 'Pay & Place Order' : 'Place Order'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  safeHeader: { backgroundColor: '#FFF', paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  stepDotActive: { backgroundColor: Colors.light.primary },
  scroll: { padding: 20 },
  stepContent: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 18 },
  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1.5, borderColor: '#F3F4F6' },
  selectedCard: { borderColor: Colors.light.primary },
  addressIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  addressType: { fontSize: 15, fontWeight: '800' },
  addressText: { fontSize: 12, color: '#666' },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1.5, borderColor: '#F3F4F6', gap: 14 },
  paymentTitle: { fontSize: 15, fontWeight: '800' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.light.primary },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginTop: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '900', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#666' },
  summaryValue: { fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  grandTotalLabel: { fontSize: 16, fontWeight: '900' },
  grandTotalValue: { fontSize: 20, fontWeight: '900', color: Colors.light.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  addAddressBtn: { backgroundColor: Colors.light.primary, paddingVertical: 15, borderRadius: 20, paddingHorizontal: 25, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  addAddressBtnText: { color: Colors.light.black, fontSize: 15, fontWeight: '900' },
  footer: { padding: 20, backgroundColor: '#FFF' },
  nextBtn: { backgroundColor: Colors.light.primary, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: Colors.light.black, fontSize: 16, fontWeight: '900' },
  placeOrderBtn: { backgroundColor: '#22C55E', height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  placeOrderText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
