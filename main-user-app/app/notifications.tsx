import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Order Delivered!',
    body: 'Your order from Burger King has been delivered. Enjoy your meal!',
    time: '2 hours ago',
    type: 'ORDER',
    read: true
  },
  {
    id: '2',
    title: '50% OFF Promo',
    body: 'Exclusive deal! Get 50% off on your next order with code CHATORI50.',
    time: '5 hours ago',
    type: 'PROMO',
    read: false
  },
  {
    id: '3',
    title: 'Wallet Credited',
    body: '₹100 has been added to your wallet for referring a friend.',
    time: '1 day ago',
    type: 'WALLET',
    read: true
  }
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return { name: 'bag-handle', color: '#E3F2FD', iconColor: '#1565C0' };
      case 'PROMO': return { name: 'gift', color: '#FFF3E0', iconColor: '#EF6C00' };
      case 'WALLET': return { name: 'wallet', color: '#E8F5E9', iconColor: '#2E7D32' };
      default: return { name: 'notifications', color: '#F5F5F5', iconColor: '#999' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={markAllRead}>
             <Text style={styles.markRead}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {notifications.length > 0 ? (
            notifications.map((item, i) => {
              const iconCfg = getIcon(item.type);
              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(i * 100)} style={[styles.notifCard, !item.read && styles.unreadCard]}>
                  <View style={[styles.iconBox, { backgroundColor: iconCfg.color }]}>
                    <Ionicons name={iconCfg.name as any} size={22} color={iconCfg.iconColor} />
                  </View>
                  <View style={styles.notifInfo}>
                    <View style={styles.notifHeader}>
                       <Text style={styles.notifTitle}>{item.title}</Text>
                       <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.notifBody}>{item.body}</Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </Animated.View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
               <Ionicons name="notifications-off-outline" size={80} color="#EEE" />
               <Text style={styles.emptyText}>All caught up!</Text>
               <Text style={styles.emptySub}>We'll notify you when something important happens.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  markRead: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 24,
    backgroundColor: '#FFF',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unreadCard: {
    backgroundColor: '#FFFDF0',
    borderColor: Colors.light.primary + '20',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: {
    flex: 1,
    marginLeft: 15,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  notifTime: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '500',
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
