import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Margherita Pepperoni',
      price: 349,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200',
    },
    {
      id: '2',
      name: 'Garlic Breadsticks',
      price: 149,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=200',
    }
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 45;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Review Order</Text>
          <Text style={styles.subtitle}>The Pizza Hub</Text>
        </View>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Delivery Info */}
        <View style={styles.section}>
          <View style={styles.deliveryRow}>
             <View style={styles.deliveryIcon}>
                <Ionicons name="time" size={20} color={Colors.light.primary} />
             </View>
             <View style={{flex: 1, marginLeft: 15}}>
                <Text style={styles.deliveryTitle}>Standard Delivery</Text>
                <Text style={styles.deliverySub}>Arriving in 25-30 mins</Text>
             </View>
             <Text style={styles.editBtn}>Change</Text>
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <Animated.View 
              key={item.id} 
              entering={FadeInRight.delay(index * 100)}
              style={styles.itemRow}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Ionicons name="remove" size={16} color={Colors.light.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Ionicons name="add" size={16} color={Colors.light.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Offers Section */}
        <TouchableOpacity style={styles.offerSection}>
           <Ionicons name="color-wand-outline" size={24} color={Colors.light.primary} />
           <Text style={styles.offerText}>Apply Coupon / Promo Code</Text>
           <Ionicons name="chevron-forward" size={18} color={Colors.light.textMuted} />
        </TouchableOpacity>

        {/* Bill Summary */}
        <View style={styles.billContainer}>
           <Text style={styles.billTitle}>Bill Summary</Text>
           <View style={styles.billRow}>
             <Text style={styles.billLabel}>Item Total</Text>
             <Text style={styles.billValue}>₹{subtotal}</Text>
           </View>
           <View style={styles.billRow}>
             <Text style={styles.billLabel}>Delivery Fee</Text>
             <Text style={[styles.billValue, {color: '#48bb78'}]}>₹{deliveryFee}</Text>
           </View>
           <View style={styles.billRow}>
             <Text style={styles.billLabel}>Taxes & Charges</Text>
             <Text style={styles.billValue}>₹{taxes}</Text>
           </View>
           <View style={[styles.billRow, {marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6'}]}>
             <Text style={styles.totalLabel}>Grand Total</Text>
             <Text style={styles.totalValue}>₹{total}</Text>
           </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.policyBox}>
           <Ionicons name="information-circle-outline" size={20} color="#666" />
           <Text style={styles.policyText}>Orders cannot be cancelled once packed. Please check your address and items before ordering.</Text>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.footer}>
         <View>
            <Text style={styles.footerPrice}>₹{total}</Text>
            <Text style={styles.footerSub}>Final amount inc. all taxes</Text>
         </View>
         <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.checkoutBtnText}>PAY NOW</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
         </TouchableOpacity>
      </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  scroll: {
    paddingBottom: 120,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 10,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  deliverySub: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  editBtn: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  itemsContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignSelf: 'start',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '900',
    color: Colors.light.text,
  },
  offerSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 1.5,
    borderColor: Colors.light.primary + '15',
  },
  offerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  billContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 15,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
    marginBottom: 15,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  policyBox: {
    padding: 20,
    flexDirection: 'row',
    gap: 10,
  },
  policyText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    paddingHorizontal: 25,
    paddingVertical: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.text,
  },
  footerSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 25,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
