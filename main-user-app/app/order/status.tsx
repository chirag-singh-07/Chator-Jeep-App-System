import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function OrderStatusScreen() {
  const router = useRouter();
  const { status, orderId, reason } = useLocalSearchParams();
  const isSuccess = status === 'success';
  const failureReason = Array.isArray(reason) ? reason[0] : reason;

  useEffect(() => {
    if (isSuccess) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isSuccess]);

  const handleAction = () => {
    if (isSuccess) {
      router.replace(`/order-tracking/${orderId}`);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(600)} style={[styles.iconCircle, { backgroundColor: isSuccess ? '#ECFDF5' : '#FEF2F2' }]}>
          <Ionicons 
            name={isSuccess ? 'checkmark-circle' : 'close-circle'} 
            size={80} 
            color={isSuccess ? '#10B981' : '#EF4444'} 
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.textContainer}>
          <Text style={styles.title}>{isSuccess ? 'Order Placed Successfully!' : 'Order Placement Failed'}</Text>
          <Text style={styles.subTitle}>
            {isSuccess 
              ? 'Your delicious food is being prepared and will be with you shortly.' 
              : failureReason || 'Payment failed or was cancelled. No order was created.'}
          </Text>
        </Animated.View>

        {isSuccess && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.orderInfo}>
             <Text style={styles.orderIdLabel}>ORDER ID</Text>
             <Text style={styles.orderIdValue}>#{orderId || 'ORD-123456'}</Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(700)} style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.btn, { backgroundColor: isSuccess ? Colors.light.primary : '#1A1A1A' }]} 
            onPress={handleAction}
          >
            <Text style={[styles.btnText, { color: isSuccess ? '#1A1A1A' : '#FFF' }]}>
              {isSuccess ? 'Track My Order' : 'Try Again'}
            </Text>
            <Ionicons name={isSuccess ? 'arrow-forward' : 'refresh'} size={18} color={isSuccess ? '#1A1A1A' : '#FFF'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  textContainer: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', textAlign: 'center' },
  subTitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 15, lineHeight: 22, fontWeight: '500' },
  orderInfo: { marginTop: 40, alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  orderIdLabel: { fontSize: 11, fontWeight: '900', color: '#999', letterSpacing: 1 },
  orderIdValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginTop: 5 },
  footer: { position: 'absolute', bottom: 50, left: 40, right: 40 },
  btn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  btnText: { fontSize: 17, fontWeight: '900' },
  homeBtn: { marginTop: 20, alignItems: 'center' },
  homeBtnText: { fontSize: 14, fontWeight: '800', color: '#999' },
});
