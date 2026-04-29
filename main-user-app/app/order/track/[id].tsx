import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const STEPS = [
    { title: 'Order Placed', time: '10:30 PM', status: 'completed' },
    { title: 'Preparing your meal', time: '10:35 PM', status: 'active' },
    { title: 'Out for delivery', time: '--:--', status: 'pending' },
    { title: 'Delivered', time: '--:--', status: 'pending' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/orders')}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Track Order</Text>
        <TouchableOpacity style={styles.helpBtn}>
           <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Map Placeholder */}
        <Animated.View entering={FadeIn.duration(1000)} style={styles.mapContainer}>
           <Image 
             source={{ uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800' }} 
             style={styles.mapImg} 
           />
           <View style={styles.mapOverlay}>
              <View style={styles.locationPin}>
                 <Ionicons name="location" size={24} color={Colors.light.primary} />
                 <View style={styles.pulseRing} />
              </View>
           </View>
        </Animated.View>

        {/* Status Sheet */}
        <Animated.View 
          entering={FadeInDown.springify()} 
          style={styles.statusSheet}
        >
           <View style={styles.dragHandle} />
           
           <View style={styles.deliveryInfo}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=delivery' }} 
                style={styles.driverAvatar} 
              />
              <View style={{flex: 1, marginLeft: 15}}>
                 <Text style={styles.driverLabel}>Delivery Partner</Text>
                 <Text style={styles.driverName}>Rahul Sharma</Text>
              </View>
              <View style={styles.actionRow}>
                 <TouchableOpacity style={styles.circleBtn}>
                    <Ionicons name="chatbubble-ellipses" size={20} color={Colors.light.primary} />
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.circleBtn, {backgroundColor: Colors.light.primary}]}>
                    <Ionicons name="call" size={20} color="#FFF" />
                 </TouchableOpacity>
              </View>
           </View>

           <View style={styles.timeline}>
              {STEPS.map((step, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelinePointContainer}>
                    <View style={[
                       styles.timelinePoint, 
                       step.status === 'completed' && styles.pointCompleted,
                       step.status === 'active' && styles.pointActive
                    ]}>
                      {step.status === 'completed' && <Ionicons name="checkmark" size={12} color="#FFF" />}
                    </View>
                    {index !== STEPS.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        step.status === 'completed' && { backgroundColor: '#48bb78' }
                      ]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      step.status === 'pending' && { color: '#999' }
                    ]}>{step.title}</Text>
                    <Text style={styles.timelineTime}>{step.time}</Text>
                  </View>
                </View>
              ))}
           </View>
           
           <TouchableOpacity 
             style={styles.detailsBtn}
             onPress={() => router.push(`/(tabs)/orders`)}
           >
              <Text style={styles.detailsBtnText}>VIEW ORDER DETAILS</Text>
           </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  helpBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
  },
  helpText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.45,
    width: '100%',
    backgroundColor: '#E0E0E0',
  },
  mapImg: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary + '20',
    borderWidth: 1,
    borderColor: Colors.light.primary + '40',
  },
  statusSheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#EEE',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 25,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  driverAvatar: {
    width: 55,
    height: 55,
    borderRadius: 20,
  },
  driverLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  circleBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  timeline: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    height: 70,
  },
  timelinePointContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelinePoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointCompleted: {
    backgroundColor: '#48bb78',
  },
  pointActive: {
    backgroundColor: Colors.light.primary,
    borderWidth: 4,
    borderColor: Colors.light.primary + '30',
  },
  timelineLine: {
    position: 'absolute',
    top: 20,
    width: 2,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 15,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  timelineTime: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  detailsBtn: {
    backgroundColor: '#F9FAFB',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  detailsBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: 1,
  },
});
