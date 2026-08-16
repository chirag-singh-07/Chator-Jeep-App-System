import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Order Delivered! 🛵',
    body: 'Your delicious meal from Burger King has been delivered. Enjoy your food!',
    time: '15 mins ago',
    type: 'ORDER',
    read: false,
    actionText: 'View Order',
  },
  {
    id: '2',
    title: '50% OFF Super Deal! 🎉',
    body: 'Exclusive weekend offer! Get 50% off up to ₹100 on your favorite meals with code CHATORI50.',
    time: '2 hours ago',
    type: 'PROMO',
    read: false,
    actionText: 'Use Offer',
  },
  {
    id: '3',
    title: 'Wallet Cashback Credited 💰',
    body: '₹100 referral reward has been successfully added to your Chatori Wallet.',
    time: '1 day ago',
    type: 'WALLET',
    read: true,
    actionText: 'View Balance',
  },
  {
    id: '4',
    title: 'Chef Special Recommendation 👨‍🍳',
    body: 'Fresh authentic Italian Pizzas are trending near your location. Check out the top-rated kitchens!',
    time: '2 days ago',
    type: 'PROMO',
    read: true,
    actionText: 'Explore Menu',
  }
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('All');

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Orders') return notifications.filter(n => n.type === 'ORDER');
    if (activeTab === 'Offers') return notifications.filter(n => n.type === 'PROMO');
    if (activeTab === 'Wallet') return notifications.filter(n => n.type === 'WALLET');
    return notifications;
  }, [notifications, activeTab]);

  const markAllRead = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications([]);
  };

  const handleNotificationPress = (item: any) => {
    Haptics.selectionAsync();
    setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
    if (item.type === 'ORDER') {
      router.push('/(tabs)/orders');
    } else if (item.type === 'WALLET') {
      router.push('/wallet');
    } else {
      router.push('/(tabs)');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return { name: 'fast-food', bg: '#E6F4EA', color: '#137333', badgeText: 'ORDER' };
      case 'PROMO':
        return { name: 'pricetag', bg: '#FEF7E0', color: '#B06000', badgeText: 'OFFER' };
      case 'WALLET':
        return { name: 'wallet', bg: '#E8F0FE', color: '#1A73E8', badgeText: 'WALLET' };
      default:
        return { name: 'notifications', bg: '#F1F3F4', color: '#5F6368', badgeText: 'INFO' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.headerUnreadBadge}>
                <Text style={styles.headerUnreadText}>{unreadCount} NEW</Text>
              </View>
            )}
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Read All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        {notifications.length > 0 && (
          <View style={styles.tabsRow}>
            {['All', 'Orders', 'Offers', 'Wallet'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
                onPress={() => {
                  setActiveTab(tab);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Main List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item, i) => {
              const iconCfg = getIcon(item.type);
              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(i * 70)}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.notifCard, !item.read && styles.unreadCard]}
                    onPress={() => handleNotificationPress(item)}
                  >
                    <View style={[styles.iconBox, { backgroundColor: iconCfg.bg }]}>
                      <Ionicons name={iconCfg.name as any} size={22} color={iconCfg.color} />
                    </View>
                    
                    <View style={styles.notifInfo}>
                      <View style={styles.notifHeader}>
                        <View style={styles.titleRow}>
                          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                        </View>
                        <Text style={styles.notifTime}>{item.time}</Text>
                      </View>
                      
                      <Text style={styles.notifBody}>{item.body}</Text>
                      
                      <View style={styles.cardFooter}>
                        <View style={[styles.typeBadge, { backgroundColor: iconCfg.bg }]}>
                          <Text style={[styles.typeBadgeText, { color: iconCfg.color }]}>{iconCfg.badgeText}</Text>
                        </View>
                        <View style={styles.actionBtn}>
                          <Text style={styles.actionBtnText}>{item.actionText}</Text>
                          <Ionicons name="chevron-forward" size={14} color={Colors.light.primary} />
                        </View>
                      </View>
                    </View>

                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          ) : (
            <Animated.View entering={FadeInUp} style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off" size={42} color={Colors.light.primary} />
              </View>
              <Text style={styles.emptyText}>No notifications here!</Text>
              <Text style={styles.emptySub}>
                {activeTab !== 'All' 
                  ? `No ${activeTab.toLowerCase()} notifications found.` 
                  : "You're all caught up. We'll alert you when there are order updates or special offers."}
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.exploreBtnText}>EXPLORE FOOD</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerUnreadBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  headerUnreadText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tabChipActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFF',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#FFFDF5',
    borderColor: Colors.light.primary + '30',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: {
    flex: 1,
    marginLeft: 14,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flex: 1,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  notifTime: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: '#FFFDF5',
    borderWidth: 1.5,
    borderColor: Colors.light.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  emptySub: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 25,
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  exploreBtnText: {
    color: '#1A1A1A',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
