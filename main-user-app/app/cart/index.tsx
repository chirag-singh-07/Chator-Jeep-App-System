
import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  FlatList,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useAuthStore } from '@/store/useAuthStore';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import api from '@/lib/api';

const { height } = Dimensions.get('window');

export default function CartScreen() {
  const { isAuthenticated, hasPlacedOrder } = useAuthStore();
  const router = useRouter();
  const { items, restaurantId, restaurantName, totalAmount, totalItems, updateQuantity, clearCart } = useCartStore();
  const { currentAddress } = useLocationStore();

  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && items.length > 0 && !hasRedirected) {
      setHasRedirected(true);
      router.push('/(auth)/login');
    }
  }, [isAuthenticated, items.length, hasRedirected]);

  const scrollRef = useRef<ScrollView>(null);
  const [instructions, setInstructions] = useState('');

  // Coupon State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  // Bill State
  const [isBillExpanded, setIsBillExpanded] = useState<boolean>(true);

  // Dynamic Fees State
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [packagingCharge, setPackagingCharge] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [backendBreakdown, setBackendBreakdown] = useState<{
    foodAmount: number;
    deliveryFee: number;
    platformFee: number;
    gstAmount: number;
    packagingFee: number;
    discountAmount: number;
    couponDiscount: number;
    totalAmount: number;
  } | null>(null);
  const [isFetchingFees, setIsFetchingFees] = useState<boolean>(false);

  const isFirstOrder = !hasPlacedOrder;

  useEffect(() => {
    const fetchFeesAndPreview = async () => {
      if (!restaurantId) return;
      setIsFetchingFees(true);
      try {
        const [restaurantRes, configRes] = await Promise.allSettled([
          api.get(`/restaurants/${restaurantId}`),
          api.get('/system/config')
        ]);

        if (restaurantRes.status === 'fulfilled' && restaurantRes.value.data?.success) {
          const restData = restaurantRes.value.data.data;
          setDeliveryFee(restData.deliveryFee || 29);
          setPackagingCharge(restData.packagingCharge || 0);
        }

        if (configRes.status === 'fulfilled' && configRes.value.data?.success) {
          setPlatformFee(configRes.value.data.data?.platformFixedFee || 0);
        }

        // Try backend checkout preview if user is authenticated and items present
        if (isAuthenticated && items.length > 0) {
          try {
            const payload = {
              restaurantId,
              items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
              deliveryAddress: currentAddress ? `${currentAddress.flat || ''}, ${currentAddress.area || ''}` : 'Default Address',
              location: {
                type: 'Point',
                coordinates: currentAddress?.coordinates
                  ? [currentAddress.coordinates.longitude, currentAddress.coordinates.latitude]
                  : [77.1025, 28.7041],
              },
              ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
            };
            const previewRes = await api.post('/orders/payment/checkout-preview', payload);
            if (previewRes.data?.success && previewRes.data.data) {
              setBackendBreakdown(previewRes.data.data);
              if (previewRes.data.data.deliveryFee !== undefined) setDeliveryFee(previewRes.data.data.deliveryFee);
              if (previewRes.data.data.platformFee !== undefined) setPlatformFee(previewRes.data.data.platformFee);
              if (previewRes.data.data.packagingFee !== undefined) setPackagingCharge(previewRes.data.data.packagingFee);
            }
          } catch (previewErr) {
            // Quiet fallback for preview error
          }
        }
      } catch (error) {
        setDeliveryFee(29);
        setPlatformFee(15);
      } finally {
        setIsFetchingFees(false);
      }
    };

    fetchFeesAndPreview();
  }, [restaurantId, items, currentAddress, appliedCoupon, isAuthenticated]);

  useEffect(() => {
    if (showCouponModal) {
      setIsLoadingCoupons(true);
      api.get('/coupons/active')
        .then(res => setCoupons(res.data?.data || []))
        .catch(err => console.error("Failed to fetch coupons", err))
        .finally(() => setIsLoadingCoupons(false));
    }
  }, [showCouponModal]);

  const handleApplyCoupon = async (code: string) => {
    if (!code) return;
    setIsApplying(true);
    try {
      const res = await api.post('/coupons/apply', { code, orderAmount: totalAmount });
      if (res.data?.success) {
        setAppliedCoupon({ code, discount: res.data.data.discountAmount });
        setShowCouponModal(false);
        setCouponInput('');
        Alert.alert("Success", `'${code}' applied successfully!`);
      } else {
        Alert.alert("Error", res.data?.message || "Invalid coupon");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to apply coupon");
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    Alert.alert("Remove Coupon", "Are you sure you want to remove this coupon?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setAppliedCoupon(null) }
    ]);
  };

  // Dynamic calculations prioritizing backend breakdown data
  const itemTotal = backendBreakdown?.foodAmount ?? totalAmount;
  const activeDeliveryFee = backendBreakdown?.deliveryFee ?? deliveryFee;
  const activePlatformFee = backendBreakdown?.platformFee ?? platformFee;
  const activeGstAmount = backendBreakdown?.gstAmount ?? (itemTotal * 0.05); // 5% fallback
  const activePackagingFee = backendBreakdown?.packagingFee ?? packagingCharge;

  const discountAmount = backendBreakdown?.discountAmount ?? (itemTotal >= 500 ? 50 : 0);

  const subtotalBeforeRoundOff = itemTotal + activeDeliveryFee + activePackagingFee + activePlatformFee + activeGstAmount - discountAmount;
  const grandTotal = Math.max(0, Math.round(subtotalBeforeRoundOff));
  const roundOff = grandTotal - subtotalBeforeRoundOff;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerSimple}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnSimple}>
            <Ionicons name="arrow-back" size={24} color="#000" />
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

  if (!isAuthenticated && items.length > 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerSimple}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnSimple}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContent}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }}
            style={styles.emptyImg}
          />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySub}>Please log in to view your cart items, bill details, and complete your order.</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.shopBtnText}>Login Now</Text>
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
              <Ionicons name="arrow-back" size={22} color="#000" />
            </TouchableOpacity>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.headerTitle}>CART <Text style={styles.headerSub}>({totalItems} Item{totalItems > 1 ? 's' : ''})</Text></Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => {
            Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: clearCart }
            ]);
          }}>
            <Text style={{ color: '#666', fontSize: 13, fontWeight: '700' }}>CLEAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Cart Items (Simplistic look) */}
        <View style={styles.itemsSection}>
          {items.map((item, index) => (
            <Animated.View entering={FadeInDown.delay(index * 50)} key={item.id} style={styles.itemCard}>
              <View style={styles.itemImgContainer}>
                <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100' }} style={styles.itemImg} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item.id, -1); }}
                >
                  <Ionicons name="remove" size={16} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateQuantity(item.id, 1); }}
                >
                  <Ionicons name="add" size={16} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}

          <View style={styles.addMoreRow}>
            <Ionicons name="add" size={18} color="#444" />
            <Text style={styles.addMoreText} onPress={() => router.back()}>Add more items</Text>
          </View>
        </View>

        {/* Cooking Instructions */}
        <View style={styles.sectionCard}>
          <TextInput
            style={styles.instructionInput}
            placeholder="Any cooking requests? E.g. Don't ring the bell..."
            placeholderTextColor="#999"
            multiline
            value={instructions}
            onChangeText={setInstructions}
          />
        </View>

        {/* Coupons and Credits */}
        <Text style={styles.sectionHeaderTitle}>COUPONS AND CREDITS</Text>
        <View style={styles.couponContainer}>
          {appliedCoupon ? (
            <TouchableOpacity style={styles.couponRow} activeOpacity={0.9} onPress={removeCoupon}>
              <View style={styles.couponLeft}>
                <Ionicons name="pricetag" size={20} color="#39A545" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.couponTitle, { color: '#000' }]}>'{appliedCoupon.code}' applied</Text>
                  <Text style={{ fontSize: 12, color: '#39A545', fontWeight: '600', marginTop: 2 }}>₹{appliedCoupon.discount} saved on this order!</Text>
                </View>
              </View>
              <Ionicons name="close" size={22} color="#999" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.couponRow} activeOpacity={0.7} onPress={() => setShowCouponModal(true)}>
              <View style={styles.couponLeft}>
                <Ionicons name="pricetag-outline" size={20} color="#13B8A6" />
                <Text style={styles.couponTitle}>Apply Coupon</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>
          )}
        </View>


        {/* Bill Details */}
        <View style={styles.billContainer}>
          <TouchableOpacity style={styles.billHeaderRow} onPress={() => setIsBillExpanded(!isBillExpanded)}>
            <Text style={styles.billSectionTitle}>BILL DETAILS</Text>
            <Ionicons name={isBillExpanded ? "chevron-up" : "chevron-down"} size={20} color="#000" />
          </TouchableOpacity>

          {isBillExpanded && (
            <View style={styles.billExpandedContent}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Subtotal</Text>
                <Text style={styles.billValue}>₹{itemTotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>{activeDeliveryFee === 0 ? 'FREE' : `₹${activeDeliveryFee}`}</Text>
              </View>
              {activePackagingFee > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Packaging Charge</Text>
                  <Text style={styles.billValue}>₹{activePackagingFee}</Text>
                </View>
              )}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Platform Fee</Text>
                <Text style={styles.billValue}>₹{activePlatformFee}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>GST & Taxes</Text>
                <Text style={styles.billValue}>₹{activeGstAmount.toFixed(2)}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: '#16A34A', fontWeight: '600' }]}>Discount</Text>
                  <Text style={[styles.billValue, { color: '#16A34A', fontWeight: '700' }]}>-₹{discountAmount}</Text>
                </View>
              )}
              {roundOff !== 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Round Off</Text>
                  <Text style={styles.billValue}>{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</Text>
                </View>
              )}

              <View style={styles.billDivider} />

              <View style={styles.billRow}>
                <Text style={styles.totalLabel}>To Pay</Text>
                <Text style={styles.totalValue}>₹{grandTotal}</Text>
              </View>
            </View>
          )}

          {discountAmount > 0 && (
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsBannerText}>Congrats! You have saved ₹{discountAmount} on this order! <Ionicons name="information-circle-outline" size={14} /></Text>
            </View>
          )}
        </View>

        {/* Club Banner */}
        <TouchableOpacity style={styles.clubBanner}>
          <Text style={styles.clubBannerText}>Renew EatClub membership & save ₹63</Text>
          <Ionicons name="chevron-forward-outline" size={16} color="#FFF" />
          <Ionicons name="chevron-forward-outline" size={16} color="#FFF" style={{ marginLeft: -8 }} />
        </TouchableOpacity>

      </ScrollView>

      {/* Footer Checkout (White Bottom Bar) */}
      <Animated.View entering={SlideInDown} style={styles.footer}>
        <View style={styles.deliveryTimeRow}>
          <Text style={styles.deliverNowText}>Deliver Now</Text>
          <Text style={styles.deliveryMinsText}>in 15-25 mins</Text>
          <Ionicons name="flash" size={12} color="#13B8A6" />
        </View>

        <View style={styles.addressFooterRow}>
          <Ionicons name="location" size={14} color="#13B8A6" />
          <Text style={styles.footerAddrType} numberOfLines={1}>
            <Text style={{ fontWeight: '700', color: '#444' }}>{currentAddress?.type || 'Home'} - </Text>
            <Text style={{ color: '#888' }}>{currentAddress ? `${currentAddress.flat}, ${currentAddress.area}` : 'Select an address'}</Text>
          </Text>
        </View>

        <View style={styles.payActionRow}>
          <Text style={styles.footerPriceBtn}>₹{grandTotal}</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.checkoutBtn}
            onPress={() => {
              if (!isAuthenticated) {
                useCartStore.getState().setShowAuthPrompt(true);
              } else if (!currentAddress) {
                router.push('/address-picker');
              } else {
                router.push('/checkout');
              }
            }}
          >
            <Text style={styles.checkoutBtnText}>{currentAddress ? 'Proceed to Pay' : 'Select Address'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Coupon Modal */}
      <Modal visible={showCouponModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply Coupon</Text>
              <TouchableOpacity onPress={() => setShowCouponModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code"
                placeholderTextColor="#999"
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.applyBtn, (!couponInput || isApplying) && { opacity: 0.5 }]}
                onPress={() => handleApplyCoupon(couponInput)}
                disabled={isApplying || !couponInput}
              >
                {isApplying ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.applyBtnText}>APPLY</Text>}
              </TouchableOpacity>
            </View>

            <Text style={styles.availableCouponsTitle}>Available Coupons</Text>
            {isLoadingCoupons ? (
              <ActivityIndicator style={{ marginTop: 30 }} color={Colors.light.primary} />
            ) : (
              <FlatList
                data={coupons}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.availableCouponCard} onPress={() => handleApplyCoupon(item.code)}>
                    <View style={styles.acLeft}>
                      <View style={styles.acIconBg}>
                        <Ionicons name="pricetag" size={20} color={Colors.light.primary} />
                      </View>
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={styles.acCode}>{item.code}</Text>
                        <Text style={styles.acDesc} numberOfLines={2}>{item.description}</Text>
                      </View>
                    </View>
                    <Text style={styles.acApply}>APPLY</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyCoupons}>No active coupons available right now.</Text>}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  safeHeader: { backgroundColor: '#FFF' },
  headerSimple: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  backBtnSimple: { width: 40, height: 40, justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 0.5 },
  headerSub: { fontSize: 14, color: '#888', fontWeight: '500' },
  scrollContent: { padding: 15, paddingBottom: 200 },

  // Section Styles
  sectionHeaderTitle: { fontSize: 12, fontWeight: '800', color: '#111', marginTop: 15, marginBottom: 8, letterSpacing: 0.5, marginLeft: 5 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 15 },

  itemsSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 15 },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  itemImgContainer: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  itemImg: { width: '100%', height: '100%', borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#666', fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#ECECEC', paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtn: { padding: 4 },
  qtyText: { fontSize: 14, fontWeight: '800', marginHorizontal: 12, color: '#1A1A1A' },
  addMoreRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  addMoreText: { fontSize: 14, fontWeight: '600', color: '#444', marginLeft: 5 },

  instructionInput: { fontSize: 14, color: '#333', minHeight: 40 },

  // Coupons
  couponContainer: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 15, overflow: 'hidden' },
  couponRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16 },
  couponLeft: { flexDirection: 'row', alignItems: 'center' },
  couponTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginLeft: 10 },


  // Bill
  billSectionTitle: { fontSize: 13, fontWeight: '700', color: '#111', letterSpacing: 0.5 },
  billContainer: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 15, overflow: 'hidden' },
  billHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  billExpandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 13, color: '#666' },
  billValue: { fontSize: 13, color: '#444', fontWeight: '500' },
  billDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  totalLabel: { fontSize: 14, fontWeight: '900', color: '#111' },
  totalValue: { fontSize: 14, fontWeight: '900', color: '#111' },
  savingsBanner: { backgroundColor: '#D6F2ED', paddingVertical: 12, alignItems: 'center' },
  savingsBannerText: { fontSize: 12, fontWeight: '700', color: '#0F766E' },

  // Club Banner
  clubBanner: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  clubBannerText: { flex: 1, color: '#FFF', fontSize: 13, fontWeight: '600' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 15 },
  deliveryTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  deliverNowText: { fontSize: 12, fontWeight: '800', color: '#111', marginRight: 6 },
  deliveryMinsText: { fontSize: 12, color: '#666', marginRight: 4 },
  addressFooterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  footerAddrType: { fontSize: 11, marginLeft: 4, flex: 1 },
  payActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerPriceBtn: { fontSize: 18, fontWeight: '900', color: '#111' },
  checkoutBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 30, flex: 1, marginLeft: 20, alignItems: 'center' },
  checkoutBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Empty State
  emptyContainer: { flex: 1, backgroundColor: '#FFF' },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyImg: { width: 120, height: 120, marginBottom: 20, opacity: 0.8 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  shopBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20 },
  shopBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, minHeight: '60%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' },
  couponInputRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  couponInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 15, fontSize: 15, fontWeight: '600', color: '#1A1A1A', height: 55 },
  applyBtn: { backgroundColor: '#1A1A1A', borderRadius: 14, paddingHorizontal: 25, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  availableCouponsTitle: { fontSize: 16, fontWeight: '900', color: '#1A1A1A', marginBottom: 15 },
  availableCouponCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 15, marginBottom: 12, borderStyle: 'dashed' },
  acLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  acIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF4E5', alignItems: 'center', justifyContent: 'center' },
  acCode: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  acDesc: { fontSize: 12, color: '#666', lineHeight: 16 },
  acApply: { fontSize: 13, fontWeight: '800', color: Colors.light.primary },
  emptyCoupons: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 30 }
});
