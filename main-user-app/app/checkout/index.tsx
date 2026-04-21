import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, SlideInBottom } from 'react-native-reanimated';

export default function CheckoutScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  const handlePlaceOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowRazorpay(true);
  };

  const simulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowRazorpay(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/order/track/ORD123');
    }, 2000);
  };

  const PaymentOption = ({ id, title, icon, subtitle }: { id: string, title: string, icon: string, subtitle: string }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => {
        setPaymentMethod(id);
        Haptics.selectionAsync();
      }}
      style={[styles.paymentCard, paymentMethod === id && styles.paymentCardActive]}
    >
      <View style={[styles.methodIcon, paymentMethod === id && { backgroundColor: Colors.light.primary }]}>
        <Ionicons name={icon as any} size={24} color={paymentMethod === id ? "#FFF" : Colors.light.text} />
      </View>
      <View style={{flex: 1, marginLeft: 15}}>
        <Text style={[styles.methodTitle, paymentMethod === id && { color: Colors.light.primary }]}>{title}</Text>
        <Text style={styles.methodSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, paymentMethod === id && styles.radioActive]}>
        {paymentMethod === id && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Method</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Address Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name="home" size={22} color={Colors.light.primary} />
            </View>
            <View style={{flex: 1, marginLeft: 15}}>
              <Text style={styles.addressName}>Home (Workplace)</Text>
              <Text style={styles.addressText} numberOfLines={2}>Sector 62, Noida, Uttar Pradesh 201301</Text>
            </View>
            <TouchableOpacity><Text style={styles.changeBtn}>Change</Text></TouchableOpacity>
          </View>
        </View>

        {/* Payment Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Payment</Text>
          <PaymentOption 
            id="upi"
            title="Google Pay / PhonePe"
            icon="logo-google"
            subtitle="Pay instantly via any UPI app"
          />
          <PaymentOption 
            id="card"
            title="Credit / Debit Card"
            icon="card-outline"
            subtitle="Securely pay with Visa or Mastercard"
          />
          <PaymentOption 
            id="cod"
            title="Cash on Delivery"
            icon="cash-outline"
            subtitle="Pay when your food arrives"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryHeader}>
             <Ionicons name="receipt-outline" size={20} color={Colors.light.textMuted} />
             <Text style={styles.summaryTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryRow}>
             <Text style={styles.summaryLabel}>Total Payable</Text>
             <Text style={styles.summaryPrice}>₹543.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Footer */}
      <View style={styles.footer}>
         <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.placeOrderBtn}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderText}>PLACE ORDER</Text>
            <View style={styles.priceTag}>
               <Text style={styles.priceTagText}>₹543</Text>
            </View>
         </TouchableOpacity>
      </View>

      {/* Simulated Razorpay Checkout */}
      <Modal visible={showRazorpay} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={SlideInBottom} style={styles.razorpaySheet}>
             <View style={styles.razorpayHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={styles.razorLogo}>
                    <Ionicons name="card" size={20} color="#FFF" />
                  </View>
                  <Text style={styles.razorBrand}>Razorpay Checkout</Text>
                </View>
                <TouchableOpacity onPress={() => setShowRazorpay(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
             </View>

             <View style={styles.razorContent}>
                <Text style={styles.razorMerchant}>SOCIETY FOOD SYSTEM</Text>
                <Text style={styles.razorAmount}>₹543.00</Text>
                
                {isProcessing ? (
                   <View style={styles.processing}>
                      <ActivityIndicator color={Colors.light.primary} size="large" />
                      <Text style={styles.processingText}>Processing secure payment...</Text>
                   </View>
                ) : (
                  <TouchableOpacity style={styles.payNowBtn} onPress={simulatePayment}>
                    <Text style={styles.payNowText}>PAY NOW</Text>
                  </TouchableOpacity>
                )}
             </View>
             
             <View style={styles.razorFooter}>
                <Ionicons name="shield-checkmark" size={14} color="#999" />
                <Text style={styles.secureText}>100% SECURE PAYMENTS POWERED BY RAZORPAY</Text>
             </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  backBtn: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  scroll: {
    paddingBottom: 120,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  addressIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  addressText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  changeBtn: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  paymentCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FFF9F9',
  },
  methodIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  methodSubtitle: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.light.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  summaryBox: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  summaryTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryPrice: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  placeOrderBtn: {
    backgroundColor: Colors.light.primary,
    height: 65,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  placeOrderText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  priceTag: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceTagText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  razorpaySheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 20,
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  razorLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#2D75F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  razorBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#333',
  },
  razorContent: {
    padding: 40,
    alignItems: 'center',
  },
  razorMerchant: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  razorAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 40,
  },
  payNowBtn: {
    backgroundColor: '#2D75F0',
    width: '100%',
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processing: {
    alignItems: 'center',
    gap: 15,
  },
  processingText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  razorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
    opacity: 0.5,
  },
  secureText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
  }
});
