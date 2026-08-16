import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useMenuStore } from '@/store/useMenuStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useOrderStore } from '@/store/useOrderStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface SelectedItemMap {
  [itemId: string]: {
    name: string;
    price: number;
    quantity: number;
  };
}

export default function BulkOrderScreen() {
  const router = useRouter();
  const { restaurants, menu, fetchHomeData, fetchRestaurantDetail, isLoading: isMenuLoading } = useMenuStore();
  const { currentAddress, savedAddresses } = useLocationStore();
  const { placeOrder, isLoading: isOrderLoading } = useOrderStore();

  const [selectedRestId, setSelectedRestId] = useState<string>('');
  const [cartItems, setCartItems] = useState<SelectedItemMap>({});
  const [address, setAddress] = useState<string>('');
  const [showRestPicker, setShowRestPicker] = useState<boolean>(true);
  
  // Date-Time Slots selection (ensures >= 24h advance booking)
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(-1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Available dates (starting tomorrow, i.e., 24h in advance)
  const availableDates = useMemo(() => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        label: `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`,
        isoString: d.toISOString().split('T')[0],
        rawDate: d,
      });
    }
    return dates;
  }, []);

  const timeSlots = [
    '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', 
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'
  ];

  useEffect(() => {
    // Load home data (which populates restaurants list) if empty
    if (restaurants.length === 0) {
      const lat = currentAddress?.coordinates?.latitude;
      const lng = currentAddress?.coordinates?.longitude;
      const city = currentAddress?.city;
      fetchHomeData(lat, lng, city);
    }
    
    // Set default address
    const defAddr = savedAddresses[0] || currentAddress;
    if (defAddr) {
      const formatted = defAddr.address || 
        `${defAddr.flat || ''} ${defAddr.area || ''} ${defAddr.city || ''}`.trim();
      setAddress(formatted);
    }
  }, [restaurants, currentAddress, savedAddresses]);

  // Whenever a restaurant is selected, fetch its menu details
  const handleSelectRestaurant = (restId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRestId(restId);
    setCartItems({});
    setShowRestPicker(false);
    fetchRestaurantDetail(restId);
  };

  const selectedRestaurant = useMemo(() => {
    return restaurants.find(r => r._id === selectedRestId) || null;
  }, [restaurants, selectedRestId]);

  const updateItemQty = (item: any, delta: number) => {
    Haptics.selectionAsync();
    setCartItems(prev => {
      const next = { ...prev };
      const current = next[item._id];
      if (current) {
        const newQty = current.quantity + delta;
        if (newQty <= 0) {
          delete next[item._id];
        } else {
          next[item._id] = { ...current, quantity: newQty };
        }
      } else if (delta > 0) {
        next[item._id] = {
          name: item.name,
          price: item.price,
          quantity: 1
        };
      }
      return next;
    });
  };

  const foodTotal = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const isMinOrderSatisfied = foodTotal >= 5000;

  const handlePlaceBulkOrder = async () => {
    if (!selectedRestId) {
      Alert.alert('Selection Required', 'Please select a restaurant first.');
      return;
    }
    if (totalItemsCount === 0) {
      Alert.alert('Empty Cart', 'Please add some food items to your bulk order.');
      return;
    }
    if (!isMinOrderSatisfied) {
      Alert.alert('Minimum Order Required', 'Bulk orders must have a minimum value of ₹5,000.');
      return;
    }
    if (selectedDateIndex === -1 || !selectedTimeSlot) {
      Alert.alert('Scheduling Required', 'Please select a delivery date and time slot.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter a delivery address.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsProcessing(true);

    try {
      // Parse scheduled delivery time
      const dateObj = availableDates[selectedDateIndex].rawDate;
      const [timeStr, ampm] = selectedTimeSlot.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const scheduledTime = new Date(dateObj);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Get current location coordinates
      let longitude = 77.1025;
      let latitude = 28.7041;
      
      if (selectedRestaurant?.location?.coordinates) {
        longitude = selectedRestaurant.location.coordinates[0];
        latitude = selectedRestaurant.location.coordinates[1];
      } else if (currentAddress?.coordinates) {
        longitude = currentAddress.coordinates.longitude;
        latitude = currentAddress.coordinates.latitude;
      }

      const orderPayload = {
        restaurantId: selectedRestId,
        items: Object.entries(cartItems).map(([id, item]) => ({
          menuItemId: id,
          quantity: item.quantity,
        })),
        deliveryAddress: address,
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        paymentMethod: 'COD', // COD is standard for bulk checkout or online
        isBulkOrder: true,
        scheduledDeliveryTime: scheduledTime.toISOString(),
      };

      const order = await placeOrder(orderPayload);
      router.replace(`/order/status?status=success&orderId=${order._id || order.id}`);
    } catch (err: any) {
      Alert.alert('Failed to place order', err.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Bulk & Party Booking</Text>
          <Text style={styles.subtitle}>Enforcing 24h Advance Reservation</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Restaurant */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>1. Select Restaurant</Text>
            {selectedRestId && (
              <TouchableOpacity onPress={() => setShowRestPicker(!showRestPicker)}>
                <Text style={styles.changeLink}>{showRestPicker ? 'Close' : 'Change'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {showRestPicker ? (
            <View style={styles.pickerContainer}>
              {restaurants.length === 0 ? (
                <ActivityIndicator size="small" color={Colors.light.primary} style={{ margin: 20 }} />
              ) : (
                restaurants.map((r) => (
                  <TouchableOpacity
                    key={r._id}
                    style={[styles.restOption, selectedRestId === r._id && styles.restOptionSelected]}
                    onPress={() => handleSelectRestaurant(r._id)}
                  >
                    <Image
                      source={{ uri: r.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200' }}
                      style={styles.restImage}
                    />
                    <View style={styles.restMeta}>
                      <Text style={styles.restName}>{r.name}</Text>
                      <Text style={styles.restCuisines} numberOfLines={1}>{r.cuisines?.join(' • ') || 'Multicuisine'}</Text>
                    </View>
                    {selectedRestId === r._id && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            selectedRestaurant && (
              <View style={styles.selectedRestBlock}>
                <Image
                  source={{ uri: selectedRestaurant.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200' }}
                  style={styles.selectedRestImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedRestName}>{selectedRestaurant.name}</Text>
                  <Text style={styles.selectedRestCuisines}>{selectedRestaurant.cuisines?.join(' • ') || 'Multicuisine'}</Text>
                </View>
              </View>
            )
          )}
        </Animated.View>

        {/* Step 2: Build Order Menu */}
        {selectedRestId && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>2. Choose Food items</Text>
            {isMenuLoading ? (
              <ActivityIndicator size="small" color={Colors.light.primary} style={{ margin: 30 }} />
            ) : menu.length === 0 ? (
              <Text style={styles.emptyText}>No menu items found. Select another restaurant.</Text>
            ) : (
              <View style={styles.menuContainer}>
                {menu.map((item) => {
                  const qty = cartItems[item._id]?.quantity || 0;
                  return (
                    <View key={item._id} style={styles.menuRow}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons
                            name="stop-circle"
                            size={16}
                            color={item.isVeg ? "#48bb78" : "#e53e3e"}
                          />
                          <Text style={styles.menuItemName}>{item.name}</Text>
                        </View>
                        <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                      </View>
                      
                      <View style={styles.qtyControl}>
                        {qty > 0 ? (
                          <>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQty(item, -1)}>
                              <Ionicons name="remove" size={16} color="#1A1A1A" />
                            </TouchableOpacity>
                            <Text style={styles.qtyVal}>{qty}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQty(item, 1)}>
                              <Ionicons name="add" size={16} color="#1A1A1A" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity style={styles.addBtn} onPress={() => updateItemQty(item, 1)}>
                            <Text style={styles.addBtnText}>ADD</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Animated.View>
        )}

        {/* Step 3: Date & Time Scheduling (>= 24h) */}
        {selectedRestId && totalItemsCount > 0 && (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>3. Schedule Delivery (24 Hours Advance Required)</Text>
            
            <Text style={styles.subHeading}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
              {availableDates.map((date, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateCard, selectedDateIndex === idx && styles.dateCardSelected]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDateIndex(idx);
                  }}
                >
                  <Text style={[styles.dateCardLabel, selectedDateIndex === idx && styles.dateCardLabelSelected]}>
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.subHeading}>Select Time Slot</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeSlotBtn, selectedTimeSlot === slot && styles.timeSlotBtnSelected]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTimeSlot(slot);
                  }}
                >
                  <Text style={[styles.timeSlotText, selectedTimeSlot === slot && styles.timeSlotTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Step 4: Delivery Location */}
        {selectedRestId && totalItemsCount > 0 && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>4. Delivery Location</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter exact party venue or delivery address..."
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Checkout Drawer */}
      {totalItemsCount > 0 && (
        <Animated.View entering={FadeInUp} style={styles.checkoutDrawer}>
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.cartCount}>{totalItemsCount} items selected</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.cartTotal}>₹{foodTotal}</Text>
                {!isMinOrderSatisfied && (
                  <Text style={styles.warningSub}>Min ₹5,000 required</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!isMinOrderSatisfied || isProcessing || isOrderLoading) && styles.submitBtnDisabled]}
              onPress={handlePlaceBulkOrder}
              disabled={!isMinOrderSatisfied || isProcessing || isOrderLoading}
            >
              {isProcessing || isOrderLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Place Bulk Order</Text>
                  <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {!isMinOrderSatisfied && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={16} color="#B45309" />
              <Text style={styles.warningText}>
                Add ₹{5000 - foodTotal} more of food items to fulfill bulk order requirements.
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  changeLink: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  pickerContainer: {
    marginTop: 8,
  },
  restOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  restOptionSelected: {
    backgroundColor: '#FFFDF5',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  restImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EEF0F4',
  },
  restMeta: {
    flex: 1,
    marginLeft: 14,
  },
  restName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  restCuisines: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  selectedRestBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  selectedRestImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  selectedRestName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  selectedRestCuisines: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 4,
    marginLeft: 22,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    paddingHorizontal: 8,
  },
  addBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 10,
  },
  dateList: {
    paddingBottom: 8,
  },
  dateCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    backgroundColor: '#FFFDF5',
    borderColor: Colors.light.primary,
  },
  dateCardLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  dateCardLabelSelected: {
    color: Colors.light.primary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotBtn: {
    width: (width - 80) / 3,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  timeSlotBtnSelected: {
    backgroundColor: '#FFFDF5',
    borderColor: Colors.light.primary,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4B5563',
  },
  timeSlotTextSelected: {
    color: Colors.light.primary,
  },
  addressInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#1A1A1A',
    textAlignVertical: 'top',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyText: {
    color: '#757575',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '500',
  },
  checkoutDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartCount: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '700',
  },
  cartTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 2,
  },
  warningSub: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '800',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: Colors.light.primary,
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#E5E7EB',
    borderColor: 'transparent',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 14,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
    lineHeight: 16,
  },
});
