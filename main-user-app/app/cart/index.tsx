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
  Alert,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';
import Animated, { FadeInDown, SlideInBottom, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const { items, restaurantName, totalAmount, totalItems, updateQuantity, clearCart } = useCartStore();
  const { currentAddress } = useLocationStore();
  const [instructions, setInstructions] = React.useState('');

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
          <Text style={styles.sectionTitle}>Items Added</Text>
          {items.map((item, index) => (
            <Animated.View entering={FadeInDown.delay(index * 100)} key={item.id} style={styles.itemCard}>
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
          
          <TouchableOpacity style={styles.addMoreBtn} onPress={() => router.back()}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.addMoreText}>Add more items</Text>
          </TouchableOpacity>
        </View>

        {/* Cooking Instructions */}
        <View style={styles.instructionCard}>
           <View style={styles.cardHeader}>
             <Ionicons name="document-text-outline" size={20} color={Colors.light.primary} />
             <Text style={styles.cardTitle}>Cooking Instructions</Text>
           </View>
           <TextInput
             style={styles.instructionInput}
             placeholder="E.g. Don't ring the bell, make it spicy..."
             placeholderTextColor="#999"
             multiline
             value={instructions}
             onChangeText={setInstructions}
           />
        </View>

        {/* Coupon Section */}
        <TouchableOpacity style={styles.couponCard} activeOpacity={0.7}>
           <View style={styles.couponLeft}>
             <Ionicons name="pricetag" size={20} color={Colors.light.primary} />
             <Text style={styles.couponTitle}>Apply Coupon</Text>
           </View>
           <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        {/* Bill Details */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.billRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Ionicons name="bicycle" size={14} color="#48bb78" style={{marginLeft: 5}} />
            </View>
            <Text style={[styles.billValue, {color: '#48bb78'}]}>FREE</Text>
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

        {/* Safety Badge */}
        <View style={styles.safetyCard}>
           <Ionicons name="shield-checkmark" size={24} color="#48bb78" />
           <View style={{marginLeft: 12, flex: 1}}>
             <Text style={styles.safetyTitle}>Safety Assured</Text>
             <Text style={styles.safetySub}>Your food is prepared and delivered with maximum hygiene standards.</Text>
           </View>
        </View>
      </ScrollView>

      {/* Footer Checkout */}
      <Animated.View entering={SlideInBottom} style={styles.footer}>
         <View style={styles.addressFooter}>
            <View style={styles.addrCircle}>
              <Ionicons name="location" size={18} color={Colors.light.primary} />
            </View>
            <View style={{marginLeft: 12, flex: 1}}>
               <Text style={styles.deliveringTo}>Delivering to <Text style={{fontWeight: '900'}}>{currentAddress?.type || 'Home'}</Text></Text>
               <Text style={styles.deliveringAddr} numberOfLines={1}>{currentAddress ? `${currentAddress.flat}, ${currentAddress.area}` : 'Select an address'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/address-picker')}>
               <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
         </View>

         <View style={styles.payActionRow}>
           <View style={styles.footerLeft}>
              <Text style={styles.footerPrice}>₹{grandTotal}</Text>
              <Text style={styles.viewDetailedBill}>VIEW DETAILED BILL</Text>
           </View>
           <TouchableOpacity 
             activeOpacity={0.9} 
             style={styles.checkoutBtn}
             onPress={() => router.push('/checkout')}
           >
              <Text style={styles.checkoutBtnText}>Proceed to Pay</Text>
              <Ionicons name="arrow-forward" size={18} color="#1A1A1A" />
           </TouchableOpacity>
         </View>
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
  scrollContent: { padding: 20, paddingBottom: 200 },
  section: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: Colors.light.text, marginBottom: 20 },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  itemImgContainer: { width: 65, height: 65, borderRadius: 18, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  itemImg: { width: '100%', height: '100%', borderRadius: 18 },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, borderRadius: 12, padding: 4 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { marginHorizontal: 10, fontWeight: '900', color: '#1A1A1A', fontSize: 14 },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F9FAFB', marginTop: 10 },
  addMoreText: { fontSize: 14, fontWeight: '800', color: Colors.light.primary },
  instructionCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: Colors.light.text },
  instructionInput: { backgroundColor: '#F9FAFB', borderRadius: 15, padding: 15, fontSize: 14, color: Colors.light.text, height: 80, textAlignVertical: 'top' },
  couponCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  couponLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  couponTitle: { fontSize: 15, fontWeight: '800', color: Colors.light.text },
  billCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, marginBottom: 20 },
  billTitle: { fontSize: 16, fontWeight: '900', color: Colors.light.text, marginBottom: 15 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  billValue: { fontSize: 14, color: Colors.light.text, fontWeight: '800' },
  billDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '900', color: Colors.light.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: Colors.light.text },
  safetyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBFDF5', borderRadius: 20, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#D1FAE5' },
  safetyTitle: { fontSize: 14, fontWeight: '800', color: '#065F46' },
  safetySub: { fontSize: 11, color: '#047857', marginTop: 2, lineHeight: 15 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
  addressFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  addrCircle: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFFDF5', alignItems: 'center', justifyContent: 'center' },
  deliveringTo: { fontSize: 11, color: Colors.light.textMuted, fontWeight: '600' },
  deliveringAddr: { fontSize: 13, color: Colors.light.text, fontWeight: '700', marginTop: 1 },
  changeText: { fontSize: 12, fontWeight: '900', color: Colors.light.primary },
  payActionRow: { flexDirection: 'row', alignItems: 'center', padding: 25, paddingBottom: 40 },
  footerLeft: { flex: 1 },
  footerPrice: { fontSize: 22, fontWeight: '900', color: Colors.light.text },
  viewDetailedBill: { fontSize: 10, fontWeight: '800', color: Colors.light.primary, marginTop: 2 },
  checkoutBtn: { backgroundColor: Colors.light.primary, flex: 1.5, height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  checkoutBtnText: { color: '#1A1A1A', fontSize: 17, fontWeight: '900' },
  emptyContainer: { flex: 1, backgroundColor: '#FFF' },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyImg: { width: 200, height: 200, marginBottom: 30 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: Colors.light.text },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  shopBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, marginTop: 30 },
  shopBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
