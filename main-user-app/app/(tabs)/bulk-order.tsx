import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Alert, SafeAreaView, Platform, KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import api from '@/lib/api';
import RazorpayCheckout from 'react-native-razorpay';
import { useLocationStore } from '@/store/useLocationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const C = {
  yellow: '#ffd400',
  yellow2: '#ffe76b',
  yellowSoft: '#fff7cc',
  ink: '#151515',
  muted: '#8e8e93',
  line: '#ececec',
  bg: '#f7f7f7',
  white: '#fff',
  danger: '#ff453a',
  success: '#25b45b',
};

interface Restaurant {
  _id: string;
  name: string;
  coverImage?: string;
  cuisines?: string[];
  location?: { coordinates: [number, number] };
  rating?: number;
  distance?: number;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  isVeg: boolean;
  description?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function BulkOrderScreen() {
  const router = useRouter();
  const { currentAddress } = useLocationStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<number>(1);
  const [searchMode, setSearchMode] = useState<'restaurant' | 'food'>('restaurant');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('13:00');

  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState((user as any)?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentAddress?.address || '');
  const [note, setNote] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'success' | 'failure'>('none');
  const [completedOrderId, setCompletedOrderId] = useState('');

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  }, []);

  // Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchMode]);

  const fetchSearchResults = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const lat = currentAddress?.coordinates?.latitude || 28.7041;
      const lng = currentAddress?.coordinates?.longitude || 77.1025;
      const res = await api.get(`/restaurants/bulk/search`, {
        params: { query, lat, lng }
      });
      // Mock distances and ratings for UI demo if missing
      const results = (res.data?.data || []).map((r: any) => ({
        ...r,
        distance: r.distance || (Math.random() * 5).toFixed(1),
        rating: r.rating || (4 + Math.random()).toFixed(1)
      }));
      setSearchResults(results);
    } catch (err) {
      console.log('Search Error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRestaurant = async (rest: Restaurant) => {
    setSelectedRest(rest);
    Haptics.selectionAsync();
    
    setIsMenuLoading(true);
    try {
      const res = await api.get(`/restaurants/${rest._id}/menu`);
      setMenuItems(res.data?.data || []);
    } catch (err) {
      console.log('Menu Fetch Error', err);
      Alert.alert('Error', 'Failed to fetch menu items.');
    } finally {
      setIsMenuLoading(false);
    }
  };

  const handleUpdateQty = (item: MenuItem, delta: number) => {
    Haptics.selectionAsync();
    setCart(prev => {
      const currentQty = prev[item._id]?.quantity || 0;
      let newQty = currentQty + delta;
      
      // When adding for the first time, jump to 10 as per bulk order logic (or 1 if you prefer)
      if (currentQty === 0 && delta > 0) newQty = 10;
      
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[item._id];
        return newCart;
      }
      return { ...prev, [item._id]: { ...item, quantity: newQty } };
    });
  };

  const formatMoney = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

  const foodTotal = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  
  const tax = foodTotal * 0.05;
  const finalTotal = foodTotal + tax;

  const validateStep1 = () => {
    if (Object.keys(cart).length === 0) return Alert.alert('Empty Cart', 'Please add some items to your bulk order.');
    if (!selectedDate || !selectedTimeSlot) return Alert.alert('Schedule', 'Please select a valid delivery date and time.');
    setStep(2);
  };

  const validateStep2 = () => {
    if (!contactName.trim() || !contactPhone.trim() || !deliveryAddress.trim()) {
      return Alert.alert('Required Fields', 'Please complete your contact details and delivery address.');
    }
    setStep(3);
  };

  const handleRazorpayPayment = async (razorpayData: any) => {
    if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
      throw new Error('Razorpay module is not available.');
    }
    const options = {
      description: 'Bulk Food Order',
      image: 'https://chatorijeeb.com/logo.png',
      currency: razorpayData.currency || 'INR',
      key: razorpayData.key,
      amount: razorpayData.amount,
      name: 'Chatori Jeeb',
      order_id: razorpayData.razorpayOrderId,
      prefill: { email: user?.email || 'user@example.com', contact: contactPhone, name: contactName },
      theme: { color: C.yellow }
    };
    try {
      const data = await RazorpayCheckout.open(options);
      return {
        razorpayOrderId: razorpayData.razorpayOrderId,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature,
      };
    } catch (error: any) {
      throw new Error(error.description || error.reason || 'Payment failed or cancelled');
    }
  };

  const handlePlaceOrder = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);
    try {
      const scheduledTime = new Date(selectedDate);
      let [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      scheduledTime.setHours(hours, minutes, 0, 0);

      const baseOrderData = {
        restaurantId: selectedRest!._id,
        items: Object.values(cart).map((item) => ({ menuItemId: item._id, quantity: item.quantity })),
        deliveryAddress: deliveryAddress,
        location: {
          type: 'Point',
          coordinates: selectedRest?.location?.coordinates || [77.1025, 28.7041],
        },
        paymentMethod: 'ONLINE',
        isBulkOrder: true,
        scheduledDeliveryTime: scheduledTime.toISOString(),
        orderNotes: note,
        customerDetails: { name: contactName, phone: contactPhone }
      };

      const payRes = await api.post('/orders/payment/checkout', baseOrderData);
      const razorpayData = payRes.data.data;
      const paymentResult = await handleRazorpayPayment(razorpayData);

      const createRes = await api.post('/orders/payment/verify-create', {
        ...baseOrderData,
        ...paymentResult,
      });
      const order = createRes.data.data;
      setCompletedOrderId(order._id || order.id || 'ORD-UNKNOWN');
      setPaymentStatus('success');
    } catch (err: any) {
      console.log('Payment Error', err);
      setCompletedOrderId('FAILED');
      setPaymentStatus('failure');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTopBar = () => (
    <View style={styles.topbar}>
      <TouchableOpacity style={styles.iconButton} onPress={() => {
        if (paymentStatus !== 'none') router.back();
        else if (step > 1) setStep(step - 1);
        else router.back();
      }}>
        <Ionicons name="chevron-back" size={20} color={C.ink} />
      </TouchableOpacity>
      <View style={styles.topbarCopy}>
        <Text style={styles.topbarSubtitle}>Bulk Order</Text>
        <Text style={styles.topbarTitle}>
          {paymentStatus !== 'none' ? 'Result' : step === 1 ? 'Build your order' : step === 2 ? 'Review' : 'Payment'}
        </Text>
      </View>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="help-circle-outline" size={20} color={C.ink} />
      </TouchableOpacity>
    </View>
  );

  const renderProgressCard = () => (
    <View style={styles.progressCard}>
      <View style={styles.progressStep}>
        <View style={[styles.progressCircle, step >= 1 && styles.progressCircleActive]}>
          <Text style={[styles.progressNumber, step >= 1 && styles.progressNumberActive]}>1</Text>
        </View>
        <Text style={[styles.progressLabel, step >= 1 && styles.progressLabelActive]}>Details</Text>
      </View>
      <View style={styles.progressLine}><View style={[styles.progressLineInner, step >= 2 && { width: '100%' }]} /></View>
      <View style={styles.progressStep}>
        <View style={[styles.progressCircle, step >= 2 && styles.progressCircleActive]}>
          <Text style={[styles.progressNumber, step >= 2 && styles.progressNumberActive]}>2</Text>
        </View>
        <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>Review</Text>
      </View>
      <View style={styles.progressLine}><View style={[styles.progressLineInner, step >= 3 && { width: '100%' }]} /></View>
      <View style={styles.progressStep}>
        <View style={[styles.progressCircle, step >= 3 && styles.progressCircleActive]}>
          <Text style={[styles.progressNumber, step >= 3 && styles.progressNumberActive]}>3</Text>
        </View>
        <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>Payment</Text>
      </View>
    </View>
  );

  if (paymentStatus !== 'none') {
    const isSuccess = paymentStatus === 'success';
    return (
      <SafeAreaView style={styles.appShell}>
        {renderTopBar()}
        <ScrollView contentContainerStyle={styles.main}>
          <View style={[styles.resultScreenCard, !isSuccess && styles.failureCard]}>
            <View style={[styles.resultIcon, !isSuccess && styles.failureIcon]}>
              <Ionicons name={isSuccess ? "checkmark" : "close"} size={36} color={isSuccess ? C.success : C.danger} />
            </View>
            <Text style={[styles.resultBadgeText, !isSuccess && styles.failureBadgeText]}>
              {isSuccess ? 'PAYMENT SUCCESSFUL' : 'PAYMENT FAILED'}
            </Text>
            <Text style={styles.resultTitle}>{isSuccess ? 'Order confirmed!' : 'Something went wrong.'}</Text>
            <Text style={styles.resultDesc}>
              {isSuccess 
                ? 'Your bulk order has been securely placed. The restaurant will start preparing your items on schedule.'
                : 'Your transaction could not be completed. No charges were made to your account.'}
            </Text>
            
            <View style={styles.orderIdBox}>
              <Text style={styles.orderIdLabel}>Order / Transaction ID</Text>
              <Text style={styles.orderIdValue}>{completedOrderId}</Text>
            </View>
            
            <TouchableOpacity style={styles.primaryCta} onPress={() => router.back()}>
              <Text style={styles.primaryCtaText}>{isSuccess ? 'Track your order' : 'Return home'}</Text>
            </TouchableOpacity>
            {!isSuccess && (
              <TouchableOpacity style={[styles.outlineCta, { marginTop: 10 }]} onPress={() => setPaymentStatus('none')}>
                <Text style={styles.outlineCtaText}>Try again</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appShell}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {renderTopBar()}
      <ScrollView contentContainerStyle={styles.main} keyboardShouldPersistTaps="handled">
        {renderProgressCard()}

        {/* STEP 1 */}
        {step === 1 && (
          <Animated.View entering={FadeInDown.duration(250)} style={styles.screen}>
            <LinearGradient colors={[C.yellow2, C.yellow]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={styles.pill}><Text style={styles.pillText}>BULK ORDER</Text></View>
                <Text style={styles.heroTitle}>Find food nearby.{'\n'}Order for later.</Text>
                <Text style={styles.heroDesc}>Search a restaurant or a food item. We'll prioritize the nearest available options.</Text>
              </View>
              <View style={styles.heroIconBox}>
                <Ionicons name="basket-outline" size={38} color={C.yellow} />
              </View>
            </LinearGradient>

            <View style={styles.card}>
              <View style={styles.sectionTitleRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.sectionBadge}>STEP 1</Text>
                  <Text style={styles.sectionTitle}>Search restaurant or food</Text>
                </View>
                <View style={styles.sectionIcon}><Ionicons name="search" size={20} color={C.ink} /></View>
              </View>

              <View style={[styles.searchWrap, isSearching && styles.searchWrapFocused]}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search restaurant or food..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity style={styles.clearBtn} onPress={() => setSearchQuery('')}>
                    <Ionicons name="close" size={16} color="#777" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.segmented}>
                <TouchableOpacity style={[styles.segment, searchMode === 'restaurant' && styles.segmentActive]} onPress={() => setSearchMode('restaurant')}>
                  <Text style={[styles.segmentText, searchMode === 'restaurant' && styles.segmentTextActive]}>Restaurant</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.segment, searchMode === 'food' && styles.segmentActive]} onPress={() => setSearchMode('food')}>
                  <Text style={[styles.segmentText, searchMode === 'food' && styles.segmentTextActive]}>Food Item</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  {searchMode === 'restaurant' ? 'Search restaurant names to see their menu. Results are sorted by nearest first.' : 'Search a food item to find the nearest restaurant that has it on the menu.'}
                </Text>
              </View>

              <View style={styles.resultList}>
                {isSearching ? <ActivityIndicator color={C.yellow} /> : searchResults.map(r => (
                  <TouchableOpacity key={r._id} style={styles.resultCard} onPress={() => handleSelectRestaurant(r)}>
                    <View style={styles.restaurantThumb}><Text style={styles.thumbText}>{r.name.charAt(0)}</Text></View>
                    <View style={styles.resultCopy}>
                      <Text style={styles.resultTitleText}>{r.name}</Text>
                      <Text style={styles.resultDescText}>{r.rating} ★ • {r.distance} km</Text>
                    </View>
                    <View style={styles.distanceBadge}><Text style={styles.distanceText}>Select</Text></View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selectedRest && (
              <Animated.View entering={FadeInDown.duration(250)} style={styles.card}>
                <View style={styles.sectionTitleRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.sectionBadge}>MENU</Text>
                    <Text style={styles.sectionTitle}>{selectedRest.name}</Text>
                    <Text style={styles.sectionSubtitle}>{selectedRest.distance} km away • {selectedRest.rating} ★</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedRest(null)}><Text style={styles.textBtn}>Change</Text></TouchableOpacity>
                </View>
                
                {isMenuLoading ? <ActivityIndicator color={C.yellow} /> : (
                  <View style={styles.menuList}>
                    {menuItems.map(item => (
                      <View key={item._id} style={styles.menuItem}>
                        <View style={{flex:1}}>
                          <Text style={styles.menuItemTitle}>{item.name}</Text>
                          <Text style={styles.menuItemDesc}>Available for bulk ordering</Text>
                          <Text style={styles.menuPrice}>{formatMoney(item.price)}</Text>
                        </View>
                        <TouchableOpacity style={styles.addBtn} onPress={() => handleUpdateQty(item, 1)}>
                          <Ionicons name="add" size={20} color={C.ink} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </Animated.View>
            )}

            <View style={styles.card}>
              <View style={styles.sectionTitleRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.sectionBadge}>SELECTED ITEMS</Text>
                  <Text style={styles.sectionTitle}>Your bulk order</Text>
                </View>
                <View style={styles.countBadge}><Text style={styles.countBadgeText}>{Object.keys(cart).length}</Text></View>
              </View>

              {Object.keys(cart).length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No items selected yet.</Text>
                </View>
              ) : (
                <View style={styles.selectedList}>
                  {Object.values(cart).map(item => (
                    <View key={item._id} style={styles.selectedItem}>
                      <View style={{flex:1}}>
                        <Text style={styles.selectedItemTitle}>{item.name}</Text>
                        <Text style={styles.selectedItemDesc}>{selectedRest?.name} • {formatMoney(item.price)} each</Text>
                        <TouchableOpacity onPress={() => handleUpdateQty(item, -item.quantity)}>
                          <Text style={styles.removeBtn}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.qtyBox}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item, -1)}><Text style={styles.qtyBtnText}>−</Text></TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item, 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.sectionTitleRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.sectionBadge}>SCHEDULE</Text>
                  <Text style={styles.sectionTitle}>Choose delivery date & time</Text>
                </View>
                <View style={styles.sectionIcon}><Ionicons name="calendar" size={20} color={C.ink} /></View>
              </View>
              <Text style={styles.helperText}>Bulk orders must be placed at least 1 day before delivery.</Text>

              <View style={[styles.dateGrid, { marginBottom: 30 }]}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Delivery date</Text>
                  <TextInput 
                    style={styles.input} 
                    value={selectedDate} 
                    onChangeText={setSelectedDate} 
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <TextInput 
                    style={styles.input} 
                    value={selectedTimeSlot} 
                    onChangeText={setSelectedTimeSlot} 
                    placeholder="HH:MM"
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Animated.View entering={FadeInDown.duration(250)} style={styles.screen}>
            <LinearGradient colors={['#2a2a2a', '#181818']} style={[styles.heroCard, {minHeight: 'auto'}]}>
              <View style={{width: '100%'}}>
                <Text style={[styles.sectionBadge, {color: C.yellow}]}>CUSTOMER DETAILS</Text>
                <Text style={[styles.heroTitle, {color: C.white, fontSize: 26}]}>Review your order</Text>
                <Text style={[styles.heroDesc, {color: '#bdbdbd'}]}>Ensure your contact information and delivery address are accurate.</Text>
              </View>
            </LinearGradient>

            <View style={styles.card}>
              <View style={styles.sectionTitleRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.sectionBadge}>CONTACT</Text>
                  <Text style={styles.sectionTitle}>Who is receiving this?</Text>
                </View>
              </View>
              
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput style={styles.input} value={contactName} onChangeText={setContactName} placeholder="E.g. John Doe" />
              </View>
              
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <View style={styles.phoneInput}>
                  <Text style={styles.phonePrefix}>+91</Text>
                  <TextInput style={styles.phoneInputField} value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" placeholder="99999 99999" />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionTitleRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.sectionBadge}>DELIVERY</Text>
                  <Text style={styles.sectionTitle}>Where to deliver?</Text>
                </View>
              </View>

              <View style={styles.addressBox}>
                <View style={styles.addressIcon}><Ionicons name="location" size={20} color={C.ink} /></View>
                <View style={{flex:1}}>
                  <Text style={styles.addressLabelText}>Delivery address</Text>
                  <Text style={styles.addressValueText}>{deliveryAddress || 'Not set'}</Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full Address</Text>
                <TextInput style={styles.input} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Enter your full address..." />
              </View>
              
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Delivery Notes (Optional)</Text>
                <TextInput style={styles.textarea} multiline value={note} onChangeText={setNote} placeholder="Any specific instructions for delivery..." />
              </View>
            </View>
          </Animated.View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Animated.View entering={FadeInDown.duration(250)} style={styles.screen}>
            <LinearGradient colors={['#2a2a2a', '#181818']} style={[styles.heroCard, {flexDirection:'row', minHeight: 'auto', alignItems:'center', justifyContent:'space-between'}]}>
              <View style={{flex:1, paddingRight:15}}>
                <Text style={[styles.sectionBadge, {color: C.yellow}]}>FINAL STEP</Text>
                <Text style={[styles.heroTitle, {color: C.white, fontSize: 26}]}>Payment details</Text>
                <Text style={[styles.heroDesc, {color: '#bdbdbd'}]}>Review everything before paying.</Text>
              </View>
              <View style={styles.shieldIcon}><Ionicons name="shield-checkmark" size={29} color={C.ink} /></View>
            </LinearGradient>

            <View style={styles.card}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact</Text>
                <Text style={styles.detailValue}>{contactName} • {contactPhone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{deliveryAddress}</Text>
              </View>
              <View style={[styles.detailRow, {borderBottomWidth:0}]}>
                <Text style={styles.detailLabel}>Schedule</Text>
                <Text style={styles.detailValue}>{selectedDate} at {selectedTimeSlot}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.sectionBadge, {marginBottom: 10}]}>ORDER SUMMARY</Text>
              <View style={styles.reviewList}>
                {Object.values(cart).map(item => (
                  <View key={item._id} style={styles.reviewItem}>
                    <View style={{flex:1}}>
                      <Text style={styles.reviewItemTitle}>{item.name}</Text>
                      <Text style={styles.reviewItemDesc}>{formatMoney(item.price)} each</Text>
                    </View>
                    <Text style={styles.reviewItemQty}>x{item.quantity}</Text>
                  </View>
                ))}
              </View>

              <View style={{marginTop: 15}}>
                <View style={styles.billLine}>
                  <Text style={styles.billLineLabel}>Subtotal</Text>
                  <Text style={styles.billLineValue}>{formatMoney(foodTotal)}</Text>
                </View>
                <View style={styles.billLine}>
                  <Text style={styles.billLineLabel}>Taxes & Fees (5%)</Text>
                  <Text style={styles.billLineValue}>{formatMoney(tax)}</Text>
                </View>
                <View style={styles.billTotal}>
                  <Text style={styles.billTotalLabel}>Total Amount</Text>
                  <Text style={styles.billTotalValue}>{formatMoney(finalTotal)}</Text>
                </View>
              </View>
              
              <View style={styles.razorpayCard}>
                <View style={styles.razorpayLogo}><Ionicons name="card" size={20} color={C.white} /></View>
                <View style={{flex:1}}>
                  <Text style={styles.razorpayTitle}>Razorpay Secure</Text>
                  <Text style={styles.razorpayDesc}>Cards, UPI, NetBanking</Text>
                </View>
                <Ionicons name="lock-closed" size={18} color="#999" />
              </View>
            </View>
          </Animated.View>
        )}
        {/* Inline Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={{minWidth: 104}}>
            <Text style={styles.bottomBarLabel}>{step === 1 ? 'Total items' : 'Amount to pay'}</Text>
            <Text style={styles.bottomBarValue}>
              {step === 1 ? `${Object.keys(cart).length} item${Object.keys(cart).length !== 1 ? 's' : ''}` : formatMoney(finalTotal)}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.primaryCta}
            disabled={isProcessing}
            onPress={() => {
              if (step === 1) validateStep1();
              else if (step === 2) validateStep2();
              else if (step === 3) handlePlaceOrder();
            }}
          >
            {isProcessing ? <ActivityIndicator color={C.ink} /> : (
              <>
                <Text style={styles.primaryCtaText}>{step === 3 ? 'Pay Now' : 'Continue'}</Text>
                <Ionicons name="arrow-forward" size={18} color={C.ink} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appShell: { flex: 1, backgroundColor: C.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 44 : 12, backgroundColor: 'rgba(255,255,255,0.94)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
    zIndex: 50,
  },
  iconButton: {
    width: 42, height: 42, borderWidth: 1, borderColor: C.line, backgroundColor: C.white,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center'
  },
  topbarCopy: { alignItems: 'center' },
  topbarSubtitle: { color: '#a88b00', fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  topbarTitle: { marginTop: 2, fontSize: 18, fontWeight: '600', letterSpacing: -0.35, color: C.ink },
  main: { paddingHorizontal: 14, paddingTop: 24, paddingBottom: 120 },
  
  progressCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.white,
    borderWidth: 1, borderColor: '#efefef', borderRadius: 20, padding: 14, paddingHorizontal: 16,
    marginBottom: 14, shadowColor: '#000', shadowOffset: {width:0, height:8}, shadowOpacity: 0.04, shadowRadius: 28, elevation: 2
  },
  progressStep: { alignItems: 'center', minWidth: 50 },
  progressCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  progressCircleActive: { backgroundColor: C.yellow },
  progressNumber: { fontSize: 12, fontWeight: '800', color: '#a0a0a0' },
  progressNumberActive: { color: '#111' },
  progressLabel: { marginTop: 5, fontSize: 9.5, fontWeight: '700', color: '#a0a0a0' },
  progressLabelActive: { color: '#111' },
  progressLine: { height: 2, flex: 1, backgroundColor: '#e7e7e7', marginTop: 14, overflow: 'hidden' },
  progressLineInner: { height: '100%', width: '0%', backgroundColor: C.yellow },
  
  screen: { flex: 1 },
  heroCard: {
    borderRadius: 28, padding: 23, flexDirection: 'row', justifyContent: 'space-between',
    minHeight: 194, overflow: 'hidden', shadowColor: '#ffcc00', shadowOffset: {width:0, height:18}, shadowOpacity: 0.20, shadowRadius: 38, elevation: 4
  },
  heroContent: { width: '72%' },
  pill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.63)', borderRadius: 99, paddingVertical: 7, paddingHorizontal: 10 },
  pillText: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1, color: C.ink },
  heroTitle: { marginTop: 16, fontSize: 29, fontWeight: '700', lineHeight: 32, letterSpacing: -1, color: C.ink },
  heroDesc: { marginTop: 10, fontSize: 12.5, lineHeight: 18, color: '#51480f', maxWidth: 285 },
  heroIconBox: { alignSelf: 'flex-end', width: 82, height: 82, borderRadius: 24, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', transform: [{rotate: '-7deg'}] },
  
  card: { backgroundColor: C.white, borderWidth: 1, borderColor: '#efefef', borderRadius: 24, padding: 18, marginTop: 14, shadowColor: '#000', shadowOffset: {width:0, height:9}, shadowOpacity: 0.04, shadowRadius: 26, elevation: 2 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionBadge: { fontSize: 9.5, color: '#aa8d00', fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { marginTop: 3, fontSize: 17, fontWeight: '600', letterSpacing: -0.35, color: C.ink },
  sectionSubtitle: { marginTop: 4, fontSize: 11, color: C.muted },
  sectionIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: C.yellowSoft, alignItems: 'center', justifyContent: 'center' },
  textBtn: { color: '#9b8000', fontWeight: '800', fontSize: 12 },
  
  searchWrap: { height: 54, borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 17, backgroundColor: '#fafafa', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  searchWrapFocused: { borderColor: C.yellow },
  searchInput: { flex: 1, height: '100%', fontSize: 14, marginLeft: 10, color: C.ink },
  clearBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e9e9e9', alignItems: 'center', justifyContent: 'center' },
  segmented: { marginTop: 12, backgroundColor: '#f0f0f0', borderRadius: 15, padding: 4, flexDirection: 'row' },
  segment: { flex: 1, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: C.white, shadowColor: '#000', shadowOffset: {width:0, height:3}, shadowOpacity: 0.06, shadowRadius: 10, elevation: 1 },
  segmentText: { fontSize: 12, fontWeight: '700', color: '#888' },
  segmentTextActive: { color: '#111' },
  hintBox: { marginTop: 11, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fff9dd', borderRadius: 13 },
  hintText: { fontSize: 10.5, lineHeight: 15, color: '#6d5b00' },
  
  resultList: { marginTop: 14, gap: 10 },
  resultCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ededed', borderRadius: 17, backgroundColor: '#fafafa', padding: 13, gap: 11 },
  restaurantThumb: { width: 48, height: 48, borderRadius: 15, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  thumbText: { fontWeight: '900', fontSize: 18, color: C.ink },
  resultCopy: { flex: 1 },
  resultTitleText: { fontSize: 13, fontWeight: '600', color: C.ink },
  resultDescText: { marginTop: 3, fontSize: 10.5, color: C.muted },
  distanceBadge: { backgroundColor: '#fff5b7', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 99 },
  distanceText: { fontSize: 10, fontWeight: '800', color: '#817000' },
  
  menuList: { marginTop: 14, gap: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ededed', borderRadius: 17, backgroundColor: '#fafafa', padding: 13, gap: 10 },
  menuItemTitle: { fontSize: 13, fontWeight: '600', color: C.ink },
  menuItemDesc: { marginTop: 4, fontSize: 10.5, color: C.muted },
  menuPrice: { fontSize: 12, fontWeight: '800', marginTop: 5, color: C.ink },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  
  countBadge: { minWidth: 28, height: 28, borderRadius: 99, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: C.ink },
  emptyState: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 16, alignItems: 'center' },
  emptyStateText: { fontSize: 11, color: '#999' },
  
  selectedList: { gap: 10 },
  selectedItem: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ededed', borderRadius: 17, backgroundColor: '#fafafa', padding: 13, gap: 10 },
  selectedItemTitle: { fontSize: 13, fontWeight: '600', color: C.ink },
  selectedItemDesc: { marginTop: 4, fontSize: 10.5, color: C.muted },
  removeBtn: { marginTop: 8, color: C.danger, fontSize: 10.5, fontWeight: '700' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.white, borderWidth: 1, borderColor: '#e7e7e7', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 14, fontWeight: '600', color: C.ink },
  qtyText: { minWidth: 20, textAlign: 'center', fontSize: 12, fontWeight: '600', color: C.ink },
  
  helperText: { fontSize: 10.5, color: C.muted, lineHeight: 15, marginBottom: 13 },
  dateGrid: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, marginTop: 13 },
  fieldLabel: { marginBottom: 7, fontSize: 11, fontWeight: '700', color: '#666' },
  input: { height: 50, borderWidth: 1, borderColor: '#e8e8e8', backgroundColor: '#fafafa', borderRadius: 15, paddingHorizontal: 13, fontSize: 13, color: C.ink },
  textarea: { minHeight: 94, borderWidth: 1, borderColor: '#e8e8e8', backgroundColor: '#fafafa', borderRadius: 15, padding: 13, fontSize: 13, color: C.ink, textAlignVertical: 'top' },
  
  phoneInput: { height: 50, borderWidth: 1, borderColor: '#e8e8e8', backgroundColor: '#fafafa', borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  phonePrefix: { fontSize: 12, fontWeight: '600', paddingRight: 10, borderRightWidth: 1, borderRightColor: '#ddd', color: C.ink },
  phoneInputField: { flex: 1, marginLeft: 10, fontSize: 13, color: C.ink },
  
  addressBox: { marginTop: 11, borderWidth: 1, borderColor: '#ececec', backgroundColor: '#fafafa', borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  addressIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  addressLabelText: { fontSize: 12.5, fontWeight: '600', color: C.ink },
  addressValueText: { fontSize: 10, color: C.muted, marginTop: 3 },
  
  shieldIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center' },
  detailRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  detailLabel: { fontSize: 9.5, color: '#999', fontWeight: '500' },
  detailValue: { marginTop: 4, fontSize: 12, fontWeight: '600', color: C.ink },
  
  reviewList: { gap: 10 },
  reviewItem: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ededed', borderRadius: 17, backgroundColor: '#fafafa', padding: 13, gap: 10 },
  reviewItemTitle: { fontSize: 13, fontWeight: '600', color: C.ink },
  reviewItemDesc: { marginTop: 4, fontSize: 10.5, color: C.muted },
  reviewItemQty: { fontSize: 12, fontWeight: '700', color: C.ink },
  
  billLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  billLineLabel: { fontSize: 12, color: '#777' },
  billLineValue: { fontSize: 12, color: C.ink },
  billTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  billTotalLabel: { fontSize: 16, fontWeight: '800', color: C.ink },
  billTotalValue: { fontSize: 16, fontWeight: '800', color: C.ink },
  
  razorpayCard: { marginTop: 14, padding: 15, borderRadius: 20, backgroundColor: C.white, borderWidth: 1, borderColor: '#ececec', flexDirection: 'row', alignItems: 'center', gap: 11 },
  razorpayLogo: { width: 43, height: 43, borderRadius: 13, backgroundColor: '#3158d4', alignItems: 'center', justifyContent: 'center' },
  razorpayTitle: { fontSize: 12, fontWeight: '600', color: C.ink },
  razorpayDesc: { fontSize: 10, color: '#999', marginTop: 3 },
  
  bottomBar: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  bottomBarLabel: { fontSize: 9, color: '#999' },
  bottomBarValue: { fontSize: 13, fontWeight: '600', marginTop: 3, color: C.ink },
  primaryCta: { flex: 1, height: 55, backgroundColor: C.yellow, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, shadowColor: '#ffcc00', shadowOffset: {width:0, height:9}, shadowOpacity: 0.28, shadowRadius: 22, elevation: 4 },
  primaryCtaText: { fontSize: 13, fontWeight: '800', color: C.ink },
  
  resultScreenCard: { marginTop: 46, backgroundColor: C.white, borderWidth: 1, borderColor: '#eee', borderRadius: 28, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:16}, shadowOpacity: 0.06, shadowRadius: 40, elevation: 5 },
  resultIcon: { width: 74, height: 74, marginBottom: 18, borderRadius: 24, backgroundColor: '#dcf8e6', alignItems: 'center', justifyContent: 'center' },
  resultBadgeText: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1, color: '#288c50' },
  resultTitle: { fontSize: 25, fontWeight: '700', letterSpacing: -0.7, marginTop: 8, color: C.ink },
  resultDesc: { fontSize: 12, lineHeight: 18, color: '#888', marginTop: 8, textAlign: 'center' },
  orderIdBox: { marginVertical: 20, padding: 14, backgroundColor: '#fafafa', borderRadius: 16, width: '100%', alignItems: 'center' },
  orderIdLabel: { fontSize: 9, color: '#999' },
  orderIdValue: { marginTop: 4, fontSize: 14, fontWeight: '700', color: C.ink },
  outlineCta: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', backgroundColor: C.white, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  outlineCtaText: { fontWeight: '800', color: C.ink },
  
  failureCard: { borderColor: '#ffe4e2' },
  failureIcon: { backgroundColor: '#ffe4e2' },
  failureBadgeText: { color: C.danger },
});
