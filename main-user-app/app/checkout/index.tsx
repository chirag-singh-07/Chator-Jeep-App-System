import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

type PaymentMethod = 'ONLINE';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, totalAmount, restaurantId, clearCart } = useCartStore();
  const { savedAddresses, currentAddress } = useLocationStore();
  const { placeOrder, isLoading } = useOrderStore();

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<any>(savedAddresses[0] || currentAddress || null);
  const [paymentMethod] = useState<PaymentMethod>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [breakdown, setBreakdown] = useState({ foodAmount: totalAmount, deliveryFee: 0, platformFee: 0, totalAmount: totalAmount });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Bulk order scheduling states
  const [isBulkOrder, setIsBulkOrder] = useState(false);
  const [scheduledDeliveryTime, setScheduledDeliveryTime] = useState<Date | null>(null);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // Helper functions for bulk orders
  const generateAvailableDates = () => {
    const dates = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = `${daysOfWeek[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;

      dates.push({
        id: d.toISOString().split('T')[0],
        label,
        dateObj: d,
      });
    }
    return dates;
  };

  const generateTimeSlots = (selectedDateId: string) => {
    const slots = [];
    const startHour = 10;
    const endHour = 22;

    const now = new Date();
    const minTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min of [0, 30]) {
        if (hour === endHour && min > 0) break;

        const timeStr = `${hour > 12 ? hour - 12 : hour}:${min === 0 ? '00' : '30'} ${hour >= 12 ? 'PM' : 'AM'}`;

        const slotTime = new Date(selectedDateId);
        slotTime.setHours(hour, min, 0, 0);

        if (selectedDateId === now.toISOString().split('T')[0]) {
          if (slotTime > minTime) {
            slots.push({ timeStr, hour, min });
          }
        } else {
          slots.push({ timeStr, hour, min });
        }
      }
    }
    return slots;
  };

  const updateScheduledTime = (dateId: string, slot: { hour: number; min: number }) => {
    const d = new Date(dateId);
    d.setHours(slot.hour, slot.min, 0, 0);
    setScheduledDeliveryTime(d);
  };

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
        isBulkOrder,
        ...(scheduledDeliveryTime ? { scheduledDeliveryTime: scheduledDeliveryTime.toISOString() } : {}),
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
  }, [step, selectedAddress, isBulkOrder, scheduledDeliveryTime]);

  const grandTotal = breakdown.totalAmount;

  const handleRazorpayPayment = async (razorpayData: any) => {
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
      theme: { color: '#FDBE15' },
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

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (isBulkOrder && !scheduledDeliveryTime) {
      Alert.alert('Scheduling Required', 'Please select a scheduled delivery date and time slot for your bulk order.');
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
        isBulkOrder,
        ...(scheduledDeliveryTime ? { scheduledDeliveryTime: scheduledDeliveryTime.toISOString() } : {}),
      };

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
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Something went wrong';
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      router.push(`/order/status?status=failed&reason=${encodeURIComponent(msg)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (step > 1 ? setStep((v) => v - 1) : router.back())} style={styles.backBtn}>
            <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{step === 1 ? 'Delivery Address' : 'Review & Pay'}</Text>
          <View style={{ width: 40 }} />
        </View>
        {/* Step Progress Bar */}
        <View style={styles.progressBarWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
          </View>
          <Text style={styles.progressLabel}>{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <Animated.View entering={FadeInRight} style={styles.stepContent}>
            {/* Header Delivery Banner */}
            <View style={styles.addressHeaderCard}>
              <View style={styles.addressHeaderLeft}>
                <Text style={styles.addressHeaderTitle}>Select Delivery Location</Text>
                <Text style={styles.addressHeaderSub}>Where should we deliver your order today?</Text>
              </View>
              <View style={styles.expressBadge}>
                <Ionicons name="flash" size={12} color="#D97706" />
                <Text style={styles.expressBadgeText}>20-30 MINS</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>
              <TouchableOpacity onPress={() => router.push('/address-picker')} style={styles.addNewInlineBtn}>
                <Ionicons name="add-circle" size={18} color={Colors.light.primary} />
                <Text style={styles.addNewInlineText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {addressList.length > 0 ? (
              <View style={styles.addressListWrap}>
                {addressList.map((addr: any, index: number) => {
                  const isSelected = selectedAddress?.id === addr.id || selectedAddress?._id === addr._id;
                  const labelType = (addr.label || addr.type || 'Home').toUpperCase();
                  const getIcon = () => {
                    if (labelType.includes('HOME')) return 'home';
                    if (labelType.includes('WORK') || labelType.includes('OFFICE')) return 'briefcase';
                    return 'location';
                  };

                  return (
                    <Animated.View key={addr.id || addr._id || index} entering={FadeInDown.delay(index * 50)}>
                      <TouchableOpacity
                        activeOpacity={0.88}
                        style={[styles.addressCardV2, isSelected && styles.addressCardV2Selected]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedAddress(addr);
                        }}
                      >
                        <View style={styles.addressCardTopRow}>
                          <View style={styles.addressTypeBadgeWrap}>
                            <View style={[styles.addressIconBox, isSelected && styles.addressIconBoxSelected]}>
                              <Ionicons name={getIcon()} size={18} color={isSelected ? '#D97706' : '#4B5563'} />
                            </View>
                            <View style={{ marginLeft: 10 }}>
                              <Text style={styles.addressTypeLabel}>{addr.label || addr.type || 'Home'}</Text>
                              {addr.isDefault && <Text style={styles.defaultTagText}>DEFAULT ADDRESS</Text>}
                            </View>
                          </View>

                          <View style={[styles.radioV2, isSelected && styles.radioV2Selected]}>
                            {isSelected && <View style={styles.radioInnerV2} />}
                          </View>
                        </View>

                        <View style={styles.addressDetailsBody}>
                          <Text style={styles.addressFlatText} numberOfLines={1}>
                            {addr.flat || addr.line1 || 'Address Line 1'}
                          </Text>
                          <Text style={styles.addressSubText} numberOfLines={2}>
                            {addr.area ? `${addr.area}` : ''}
                            {addr.city ? `, ${addr.city}` : ''}
                            {addr.pincode ? ` - ${addr.pincode}` : ''}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={styles.selectedFooterBar}>
                            <Ionicons name="checkmark-circle" size={14} color="#D97706" />
                            <Text style={styles.selectedFooterText}>Selected for Delivery</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}

                <TouchableOpacity
                  style={styles.addAddressDottedBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/address-picker');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.addAddressDottedIconBg}>
                    <Ionicons name="add" size={20} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.addAddressDottedText}>Add Another Delivery Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyAddressWrap}>
                <View style={styles.emptyAddressIconBg}>
                  <Ionicons name="location-outline" size={44} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyAddressTitle}>No Saved Addresses Found</Text>
                <Text style={styles.emptyAddressSub}>
                  Add your home or office address to ensure quick and accurate food delivery.
                </Text>
                <TouchableOpacity
                  style={styles.addFirstAddressBtn}
                  onPress={() => router.push('/address-picker')}
                  activeOpacity={0.9}
                >
                  <Ionicons name="map-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.addFirstAddressBtnText}>Select Location on Map</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInRight} style={styles.stepContent}>

            {/* Delivery Address Recap */}
            {selectedAddress && (
              <Animated.View entering={FadeInDown.delay(50)} style={styles.addressRecapCard}>
                <View style={styles.addressRecapIconWrap}>
                  <Ionicons name="location" size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.addressRecapTitle}>
                    Delivering to{' '}
                    <Text style={{ fontWeight: '900', color: '#111827' }}>
                      {selectedAddress.label || selectedAddress.type || 'Home'}
                    </Text>
                  </Text>
                  <Text style={styles.addressRecapSub} numberOfLines={2}>
                    {selectedAddress.line1 || selectedAddress.flat}
                    {selectedAddress.area ? `, ${selectedAddress.area}` : ''}
                    {selectedAddress.city ? `, ${selectedAddress.city}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.changeAddressBtn}>
                  <Text style={styles.changeAddressBtnText}>CHANGE</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Bill Breakdown Card */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.billCard}>
              <View style={styles.billCardHeader}>
                <Ionicons name="receipt-outline" size={18} color="#374151" />
                <Text style={styles.billCardTitle}>Bill Summary</Text>
                {isPreviewLoading && <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginLeft: 'auto' }} />}
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Food Total</Text>
                <Text style={styles.billValue}>₹{breakdown.foodAmount || totalAmount}</Text>
              </View>

              <View style={styles.billRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  {breakdown.deliveryFee === 0 && (
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeBadgeText}>FREE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.billValue, breakdown.deliveryFee === 0 && styles.billValueFree]}>
                  {breakdown.deliveryFee === 0 ? '₹0' : `₹${breakdown.deliveryFee}`}
                </Text>
              </View>

              {breakdown.platformFee > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Platform Fee</Text>
                  <Text style={styles.billValue}>₹{breakdown.platformFee}</Text>
                </View>
              )}

              <View style={styles.billDivider} />

              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalLabel}>To Pay</Text>
                <Text style={styles.billTotalValue}>₹{grandTotal}</Text>
              </View>
            </Animated.View>

            {/* Payment Method Card */}
            <Animated.View entering={FadeInDown.delay(150)} style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodHeader}>
                <Ionicons name="card" size={18} color="#374151" />
                <Text style={styles.paymentMethodTitle}>Payment Method</Text>
              </View>

              {/* Online Payment (Active — only option) */}
              <View style={styles.paymentOption}>
                <View style={styles.paymentOptionLeft}>
                  <View style={styles.paymentIconCircle}>
                    <Ionicons name="card-outline" size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.paymentOptionName}>Online Payment</Text>
                    <Text style={styles.paymentOptionSub}>UPI · Cards · NetBanking</Text>
                  </View>
                </View>
                <View style={styles.paymentActiveBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                </View>
              </View>

              {/* Payment Icons Row */}
              <View style={styles.paymentIconsRow}>
                {['Razorpay', 'UPI', 'Visa', 'Mastercard'].map((label) => (
                  <View key={label} style={styles.paymentBrandPill}>
                    <Text style={styles.paymentBrandText}>{label}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Trust & Security Card */}
            {/* <Animated.View entering={FadeInDown.delay(200)} style={styles.trustCard}>
              {[
                { icon: 'shield-checkmark', color: '#16A34A', text: '256-bit SSL encrypted & 100% secure payment' },
                { icon: 'refresh-circle', color: '#2563EB', text: 'Instant refund if order is cancelled' },
                { icon: 'time', color: '#D97706', text: 'Payment confirmed in real-time' },
              ].map((item, i) => (
                <View key={i} style={[styles.trustRow, i < 2 && styles.trustRowBorder]}>
                  <View style={[styles.trustIconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text style={styles.trustText}>{item.text}</Text>
                </View>
              ))}
            </Animated.View> */}

            {/* Bulk Order Section */}
            <Animated.View entering={FadeInDown.delay(250)} style={styles.bulkOrderCard}>
              <View style={styles.bulkHeaderRow}>
                <Ionicons name="gift-outline" size={24} color="#EA580C" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.bulkSectionTitle}>Bulk & Party Order</Text>
                  <Text style={styles.bulkSubtitle}>Minimum food value ₹5,000</Text>
                </View>
                {totalAmount >= 5000 && (
                  <TouchableOpacity
                    style={[styles.toggleBtn, isBulkOrder && styles.toggleBtnActive]}
                    onPress={() => {
                      const willBeBulk = !isBulkOrder;
                      setIsBulkOrder(willBeBulk);
                      if (!willBeBulk) {
                        setScheduledDeliveryTime(null);
                        setSelectedDateId(null);
                        setSelectedSlot(null);
                      } else {
                        const dates = generateAvailableDates();
                        setSelectedDateId(dates[0].id);
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <View style={[styles.toggleCircle, isBulkOrder && styles.toggleCircleActive]} />
                  </TouchableOpacity>
                )}
              </View>

              {totalAmount < 5000 ? (
                <View style={styles.bulkInfoBanner}>
                  <Ionicons name="information-circle-outline" size={18} color="#C2410C" style={{ marginRight: 6 }} />
                  <Text style={styles.bulkInfoText}>
                    Add ₹{(5000 - totalAmount).toLocaleString('en-IN')} more to unlock bulk benefits (scheduled delivery and multi-rider dispatch).
                  </Text>
                </View>
              ) : (
                isBulkOrder && (
                  <Animated.View entering={FadeInDown} style={styles.schedulerContainer}>
                    <Text style={styles.pickerLabel}>1. Select Delivery Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesList}>
                      {generateAvailableDates().map((date) => {
                        const isSelected = selectedDateId === date.id;
                        return (
                          <TouchableOpacity
                            key={date.id}
                            style={[styles.datePill, isSelected && styles.datePillActive]}
                            onPress={() => {
                              setSelectedDateId(date.id);
                              setSelectedSlot(null);
                              setScheduledDeliveryTime(null);
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <Text style={[styles.datePillText, isSelected && styles.datePillTextActive]}>
                              {date.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    <Text style={[styles.pickerLabel, { marginTop: 15 }]}>2. Select Time Slot (3+ hours advance)</Text>
                    {selectedDateId ? (
                      <View style={styles.slotsGrid}>
                        {generateTimeSlots(selectedDateId).map((slot, index) => {
                          const isSelected = selectedSlot?.timeStr === slot.timeStr;
                          return (
                            <TouchableOpacity
                              key={index}
                              style={[styles.slotPill, isSelected && styles.slotPillActive]}
                              onPress={() => {
                                setSelectedSlot(slot);
                                updateScheduledTime(selectedDateId, slot);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                            >
                              <Text style={[styles.slotPillText, isSelected && styles.slotPillTextActive]}>
                                {slot.timeStr}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                        {generateTimeSlots(selectedDateId).length === 0 && (
                          <Text style={styles.noSlotsText}>No slots available for today. Please select tomorrow.</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.noSlotsText}>Please select a date first</Text>
                    )}

                    {scheduledDeliveryTime && selectedSlot && (
                      <View style={styles.scheduleConfirmation}>
                        <Ionicons name="alarm-outline" size={16} color="#16A34A" />
                        <Text style={styles.scheduleConfirmationText}>
                          Scheduled for{' '}
                          {scheduledDeliveryTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
                          at {selectedSlot.timeStr}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                )
              )}
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step === 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !selectedAddress && styles.nextBtnDisabledStyle]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStep(2);
            }}
            disabled={!selectedAddress}
          >
            <Text style={styles.nextBtnText}>Continue to Payment</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.light.black} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : (
          <View>
            <View style={styles.footerAmountRow}>
              <Text style={styles.footerAmountLabel}>Total Amount</Text>
              <Text style={styles.footerAmountValue}>₹{grandTotal}</Text>
            </View>
            <TouchableOpacity
              style={[styles.placeOrderBtn, isProcessing && { opacity: 0.7 }]}
              onPress={handlePlaceOrder}
              disabled={isProcessing}
              activeOpacity={0.88}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#1A1A1A" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={16} color="#1A1A1A" style={{ marginRight: 8 }} />
                  <Text style={styles.placeOrderText}>Pay Securely • ₹{grandTotal}</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.footerSafeText}>🔒 Payments processed securely via Razorpay</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  safeHeader: { backgroundColor: '#FFF', paddingBottom: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#111827', letterSpacing: -0.3 },

  // Progress Bar
  progressBarWrap: {
    paddingHorizontal: 20,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },

  scroll: { padding: 20, paddingBottom: 30 },
  stepContent: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#6B7280', letterSpacing: 0.8 },

  // Step 1 Address Styles
  addressHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  addressHeaderLeft: { flex: 1, paddingRight: 10 },
  addressHeaderTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  addressHeaderSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  expressBadgeText: { fontSize: 11, fontWeight: '900', color: '#B45309' },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  addNewInlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addNewInlineText: { fontSize: 13, fontWeight: '800', color: Colors.light.primary },
  addressListWrap: { gap: 12 },
  addressCardV2: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  addressCardV2Selected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  addressCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addressTypeBadgeWrap: { flexDirection: 'row', alignItems: 'center' },
  addressIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressIconBoxSelected: { backgroundColor: '#FEF3C7' },
  addressTypeLabel: { fontSize: 15, fontWeight: '900', color: '#111827' },
  defaultTagText: { fontSize: 10, fontWeight: '800', color: '#D97706', letterSpacing: 0.5, marginTop: 1 },
  radioV2: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioV2Selected: { borderColor: '#F59E0B' },
  radioInnerV2: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B' },
  addressDetailsBody: { paddingLeft: 2 },
  addressFlatText: { fontSize: 14, fontWeight: '800', color: '#1F2937', marginBottom: 3 },
  addressSubText: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  selectedFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  selectedFooterText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  addAddressDottedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addAddressDottedIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressDottedText: { fontSize: 14, fontWeight: '800', color: '#374151' },
  emptyAddressWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyAddressIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyAddressTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 6 },
  emptyAddressSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  addFirstAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addFirstAddressBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // Step 2 - Address Recap
  addressRecapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#FDBE15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  addressRecapIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRecapTitle: { fontSize: 13, color: '#6B7280', marginBottom: 3 },
  addressRecapSub: { fontSize: 13, color: '#374151', fontWeight: '600', lineHeight: 18 },
  changeAddressBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    marginLeft: 10,
  },
  changeAddressBtnText: { fontSize: 11, fontWeight: '900', color: '#B45309' },

  // Bill Card
  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  billCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  billCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  billValue: { fontSize: 14, fontWeight: '700', color: '#374151' },
  billValueFree: { color: '#16A34A' },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeBadgeText: { fontSize: 9, fontWeight: '900', color: '#16A34A', letterSpacing: 0.5 },
  billDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  billTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billTotalLabel: { fontSize: 16, fontWeight: '900', color: '#111827' },
  billTotalValue: { fontSize: 22, fontWeight: '900', color: Colors.light.primary },

  // Payment Method Card
  paymentMethodCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  paymentOptionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  paymentIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  paymentOptionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  paymentActiveBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  paymentBrandPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentBrandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Trust Card
  trustCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  trustRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  trustIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Bulk Order
  bulkOrderCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bulkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bulkSectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  bulkSubtitle: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  toggleBtn: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: '#EA580C' },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: { alignSelf: 'flex-end' },
  bulkInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  bulkInfoText: { fontSize: 12, color: '#C2410C', fontWeight: '600', flex: 1 },
  schedulerContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  pickerLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  datesList: { flexDirection: 'row', marginBottom: 8 },
  datePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  datePillActive: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
  datePillText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  datePillTextActive: { color: '#C2410C', fontWeight: '700' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    width: '30%',
    alignItems: 'center',
  },
  slotPillActive: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FDBA74' },
  slotPillText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  slotPillTextActive: { color: '#C2410C', fontWeight: '700' },
  noSlotsText: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', paddingVertical: 8 },
  scheduleConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginTop: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  scheduleConfirmationText: { fontSize: 12, color: '#16A34A', fontWeight: '700' },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerAmountLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  footerAmountValue: { fontSize: 20, fontWeight: '900', color: '#111827' },
  nextBtnDisabledStyle: { opacity: 0.45 },
  nextBtn: {
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: { color: Colors.light.black, fontSize: 16, fontWeight: '900' },
  placeOrderBtn: {
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: { color: '#1A1A1A', fontSize: 16, fontWeight: '900' },
  footerSafeText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 10,
    fontWeight: '500',
  },
});
