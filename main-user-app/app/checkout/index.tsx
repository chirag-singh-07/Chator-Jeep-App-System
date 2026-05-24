import React, { useEffect, useState, useCallback } from 'react';
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
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useOrderStore } from '@/store/useOrderStore';
import Animated, { FadeInRight, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import api from '@/lib/api';
import RazorpayCheckout from 'react-native-razorpay';

WebBrowser.maybeCompleteAuthSession();

type PaymentMethod = 'COD' | 'ONLINE';

interface CouponItem {
  _id: string;
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
}

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
  const [breakdown, setBreakdown] = useState({ foodAmount: totalAmount, deliveryFee: 0, platformFee: 0, totalAmount: totalAmount });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Coupon state
  const [discount, setDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([]);
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false);

  useEffect(() => {
    const defaultAddress = currentAddress || savedAddresses[0] || null;
    if (!selectedAddress || (currentAddress && selectedAddress?.id !== currentAddress.id)) {
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [savedAddresses, currentAddress]);

  const addressList = savedAddresses.length > 0 ? savedAddresses : currentAddress ? [currentAddress] : [];

  const fetchPreview = async (address: any) => {
    try {
      setIsPreviewLoading(true);
      const baseOrderData = {
        restaurantId,
        items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        deliveryAddress: `${address.label || address.type || 'Address'}: ${address.line1 || address.flat}, ${address.city || address.area}`,
        location: {
          type: 'Point',
          coordinates: address.coordinates
            ? [address.coordinates.longitude, address.coordinates.latitude]
            : [77.1025, 28.7041],
        },
        paymentMethod: 'ONLINE',
      };
      const res = await api.post('/orders/payment/checkout-preview', baseOrderData);
      if (res.data?.success) {
        setBreakdown(res.data.data);
      }
    } catch (err) {
      console.log('Failed to fetch preview', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2 && selectedAddress) {
      fetchPreview(selectedAddress);
    }
  }, [step, selectedAddress]);

  const grandTotal = Math.max(0, breakdown.totalAmount - discount);

  // Fetch available coupons
  const fetchAvailableCoupons = useCallback(async () => {
    setIsFetchingCoupons(true);
    try {
      const res = await api.get('/coupons/active');
      if (res.data?.success) {
        setAvailableCoupons(res.data.data || []);
      }
    } catch (err) {
      console.log('Failed to fetch coupons', err);
    } finally {
      setIsFetchingCoupons(false);
    }
  }, []);

  const handleOpenCouponModal = () => {
    fetchAvailableCoupons();
    setShowCouponModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRazorpayPayment = async (razorpayData: any) => {
    // Check if RazorpayCheckout is available
    if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
      throw new Error('Razorpay module is not available. Please ensure the app is properly built with native modules.');
    }

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

  const handleApplyPromo = async (code?: string) => {
    const codeToApply = (code || promoCode).trim();
    if (!codeToApply) return;
    setIsApplyingPromo(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const res = await api.post('/coupons/apply', {
        code: codeToApply,
        orderAmount: breakdown.totalAmount || totalAmount,
      });

      if (res.data?.success) {
        const { discount: appliedDiscount, message } = res.data.data;
        setDiscount(appliedDiscount);
        setAppliedCouponCode(codeToApply.toUpperCase());
        setPromoCode(codeToApply.toUpperCase());
        setShowCouponModal(false);
        Alert.alert('🎉 Coupon Applied', message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Invalid coupon code';
      setDiscount(0);
      setAppliedCouponCode('');
      Alert.alert('Coupon Failed', errMsg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscount(0);
    setAppliedCouponCode('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectCoupon = (coupon: CouponItem) => {
    setPromoCode(coupon.code);
    handleApplyPromo(coupon.code);
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
        ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
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

  const getCouponDescription = (coupon: CouponItem) => {
    if (coupon.discountType === 'PERCENTAGE') {
      const maxPart = coupon.maxDiscountAmount ? ` up to ₹${coupon.maxDiscountAmount}` : '';
      return `${coupon.discountValue}% OFF${maxPart}`;
    }
    return `₹${coupon.discountValue} OFF`;
  };

  const getCouponMinOrder = (coupon: CouponItem) => {
    if (coupon.minOrderAmount > 0) {
      return `Min. order ₹${coupon.minOrderAmount}`;
    }
    return 'No minimum order';
  };

  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Expiring today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    return `Valid till ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  };

  const isEligible = (coupon: CouponItem) => {
    const orderAmt = breakdown.totalAmount || totalAmount;
    return orderAmt >= coupon.minOrderAmount;
  };

  const renderCouponItem = ({ item, index }: { item: CouponItem; index: number }) => {
    const eligible = isEligible(item);
    const isApplied = appliedCouponCode === item.code;

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
        <View style={[styles.couponCard, !eligible && styles.couponCardDisabled, isApplied && styles.couponCardApplied]}>
          {/* Dashed border ticket effect */}
          <View style={styles.couponLeftStrip}>
            <Ionicons name="pricetag" size={18} color={eligible ? '#FFF' : '#BBB'} />
          </View>
          <View style={styles.couponContent}>
            <View style={styles.couponHeader}>
              <Text style={[styles.couponCode, !eligible && styles.couponTextDisabled]}>{item.code}</Text>
              {isApplied && (
                <View style={styles.appliedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Text style={styles.appliedBadgeText}>Applied</Text>
                </View>
              )}
            </View>
            <Text style={[styles.couponDiscount, !eligible && styles.couponTextDisabled]}>
              {getCouponDescription(item)}
            </Text>
            <View style={styles.couponMeta}>
              <Text style={[styles.couponMinOrder, !eligible && styles.couponTextDisabled]}>
                {getCouponMinOrder(item)}
              </Text>
              <Text style={styles.couponExpiry}>{formatExpiryDate(item.expiryDate)}</Text>
            </View>
            {!eligible && (
              <Text style={styles.couponIneligibleText}>
                Add ₹{Math.ceil((item.minOrderAmount || 0) - (breakdown.totalAmount || totalAmount))} more to use
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.couponSelectBtn,
              !eligible && styles.couponSelectBtnDisabled,
              isApplied && styles.couponSelectBtnApplied,
            ]}
            onPress={() => (isApplied ? handleRemovePromo() : handleSelectCoupon(item))}
            disabled={!eligible && !isApplied}
          >
            <Text
              style={[
                styles.couponSelectBtnText,
                !eligible && styles.couponSelectBtnTextDisabled,
                isApplied && styles.couponSelectBtnTextApplied,
              ]}
            >
              {isApplied ? 'Remove' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
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

            {/* Coupon Section */}
            <View style={styles.couponSection}>
              <View style={styles.couponSectionHeader}>
                <View style={styles.couponSectionHeaderLeft}>
                  <Ionicons name="pricetag-outline" size={18} color="#374151" />
                  <Text style={styles.couponSectionTitle}>Coupons & Offers</Text>
                </View>
              </View>

              {discount > 0 && appliedCouponCode ? (
                <Animated.View entering={FadeInUp.duration(300)} style={styles.promoApplied}>
                  <View style={styles.promoAppliedLeft}>
                    <View style={styles.promoAppliedIconWrap}>
                      <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.promoAppliedCode}>{appliedCouponCode}</Text>
                      <Text style={styles.promoAppliedSavings}>You save ₹{discount} on this order</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={handleRemovePromo} style={styles.promoRemoveBtn}>
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <View>
                  <View style={styles.promoInputRow}>
                    <View style={styles.promoInputWrap}>
                      <Ionicons name="ticket-outline" size={16} color="#999" style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.promoInput}
                        placeholder="Enter coupon code"
                        placeholderTextColor="#999"
                        value={promoCode}
                        onChangeText={setPromoCode}
                        autoCapitalize="characters"
                        editable={!isApplyingPromo}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.promoApplyBtn, (!promoCode.trim() || isApplyingPromo) && styles.promoApplyBtnDisabled]}
                      onPress={() => handleApplyPromo()}
                      disabled={!promoCode.trim() || isApplyingPromo}
                    >
                      {isApplyingPromo ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.promoApplyBtnText}>Apply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.browseCouponsBtn} onPress={handleOpenCouponModal}>
                    <Ionicons name="gift-outline" size={16} color={Colors.light.primary} />
                    <Text style={styles.browseCouponsBtnText}>Browse available coupons</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Bill Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Detailed Bill</Text>

              {isPreviewLoading ? (
                <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginVertical: 20 }} />
              ) : (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Item Total</Text>
                    <Text style={styles.summaryValue}>₹{breakdown.foodAmount}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>₹{breakdown.deliveryFee}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Platform Fee</Text>
                    <Text style={styles.summaryValue}>₹{breakdown.platformFee}</Text>
                  </View>
                  {discount > 0 && (
                    <Animated.View entering={FadeInDown.duration(300)} style={styles.summaryRow}>
                      <View style={styles.discountLabelRow}>
                        <Ionicons name="pricetag" size={14} color="#22C55E" />
                        <Text style={[styles.summaryLabel, { color: '#22C55E', marginLeft: 4 }]}>Coupon Discount</Text>
                      </View>
                      <Text style={[styles.summaryValue, { color: '#22C55E' }]}>- ₹{discount}</Text>
                    </Animated.View>
                  )}
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.grandTotalLabel}>To Pay</Text>
                    <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
                  </View>
                </>
              )}
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

      {/* Coupon Browser Modal */}
      <Modal visible={showCouponModal} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCouponModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Coupons</Text>
              <TouchableOpacity onPress={() => setShowCouponModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Manual Input in Modal */}
            <View style={styles.modalInputRow}>
              <View style={styles.modalInputWrap}>
                <Ionicons name="ticket-outline" size={16} color="#999" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Type coupon code"
                  placeholderTextColor="#999"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                  editable={!isApplyingPromo}
                />
              </View>
              <TouchableOpacity
                style={[styles.modalApplyBtn, (!promoCode.trim() || isApplyingPromo) && styles.promoApplyBtnDisabled]}
                onPress={() => handleApplyPromo()}
                disabled={!promoCode.trim() || isApplyingPromo}
              >
                {isApplyingPromo ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalApplyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider}>
              <View style={styles.modalDividerLine} />
              <Text style={styles.modalDividerText}>OR CHOOSE A COUPON</Text>
              <View style={styles.modalDividerLine} />
            </View>

            {isFetchingCoupons ? (
              <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
            ) : availableCoupons.length === 0 ? (
              <View style={styles.noCouponsWrap}>
                <Ionicons name="ticket-outline" size={48} color="#DDD" />
                <Text style={styles.noCouponsText}>No coupons available right now</Text>
                <Text style={styles.noCouponsSubtext}>Check back later for exciting offers!</Text>
              </View>
            ) : (
              <FlatList
                data={availableCoupons}
                keyExtractor={(item) => item._id}
                renderItem={renderCouponItem}
                contentContainerStyle={styles.couponList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  // Coupon Section
  couponSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  couponSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  couponSectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
  },
  promoInputRow: { flexDirection: 'row', gap: 8 },
  promoInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    height: 48,
  },
  promoApplyBtn: {
    backgroundColor: '#22C55E',
    height: 48,
    width: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnDisabled: { opacity: 0.4 },
  promoApplyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  browseCouponsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
  },
  browseCouponsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  promoAppliedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  promoAppliedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoAppliedCode: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 1 },
  promoAppliedSavings: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  promoRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },

  // Summary
  summaryCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginTop: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '900', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { color: '#666' },
  summaryValue: { fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  grandTotalLabel: { fontSize: 16, fontWeight: '900' },
  grandTotalValue: { fontSize: 20, fontWeight: '900', color: Colors.light.primary },
  discountLabelRow: { flexDirection: 'row', alignItems: 'center' },

  // Empty / Address
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  addAddressBtn: { backgroundColor: Colors.light.primary, paddingVertical: 15, borderRadius: 20, paddingHorizontal: 25, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  addAddressBtnText: { color: Colors.light.black, fontSize: 15, fontWeight: '900' },

  // Footer
  footer: { padding: 20, backgroundColor: '#FFF' },
  nextBtn: { backgroundColor: Colors.light.primary, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: Colors.light.black, fontSize: 16, fontWeight: '900' },
  placeOrderBtn: { backgroundColor: '#22C55E', height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  placeOrderText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInputRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    height: 48,
  },
  modalApplyBtn: {
    backgroundColor: '#22C55E',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  modalDividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  couponList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noCouponsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  noCouponsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 12,
  },
  noCouponsSubtext: {
    fontSize: 13,
    color: '#D1D5DB',
    marginTop: 4,
  },

  // Coupon Cards
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  couponCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#FAFAFA',
  },
  couponCardApplied: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  couponLeftStrip: {
    width: 44,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  couponContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  couponCode: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 1,
  },
  couponTextDisabled: {
    color: '#9CA3AF',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  appliedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
  },
  couponDiscount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  couponMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponMinOrder: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  couponExpiry: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  couponIneligibleText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
  couponSelectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  couponSelectBtnDisabled: {
    borderColor: '#D1D5DB',
  },
  couponSelectBtnApplied: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  couponSelectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  couponSelectBtnTextDisabled: {
    color: '#9CA3AF',
  },
  couponSelectBtnTextApplied: {
    color: '#EF4444',
  },

  // Safety card styles (preserved from original)
  safetyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  shieldIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    flex: 1,
  },
  safetyToggle: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  safetyToggleOff: {
    backgroundColor: '#F3F4F6',
  },
  safetyToggleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  safetyBenefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  safetyCheck: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  safetyText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    flex: 1,
  },
});
