import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { format } from "date-fns";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Waiting", color: "#B45309", bg: "#FEF3C7" },
  ACCEPTED: { label: "Accepted", color: "#1D4ED8", bg: "#DBEAFE" },
  PREPARING: { label: "Preparing", color: "#7C3AED", bg: "#EDE9FE" },
  READY: { label: "Ready", color: "#0891B2", bg: "#CFFAFE" },
  PICKED_UP: { label: "On the way", color: "#EA580C", bg: "#FFEDD5" },
  ARRIVED: { label: "Arrived", color: "#059669", bg: "#D1FAE5" },
  COMPLETED: { label: "Delivered", color: "#138253", bg: "#EAF9F1" }, // Updated to match HTML
  CANCELLED: { label: "Cancelled", color: "#C84545", bg: "#FFF0F0" }, // Updated to match HTML
};

const getRestaurantLogo = (restaurant: any) =>
  restaurant?.logoUrls?.thumbnail || restaurant?.logoUrls?.medium || restaurant?.logoUrls?.full;

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, isLoading, fetchMyOrders } = useOrderStore();
  const { hasHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      fetchMyOrders();
    }
  }, [fetchMyOrders, hasHydrated, isAuthenticated]);

  const onRefresh = useCallback(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const restaurant = item.restaurantId;
    const status = STATUS_META[item.status] || STATUS_META.PENDING;
    const dateText = item.createdAt ? format(new Date(item.createdAt), "dd MMM, hh:mm a") : "Recently";
    const itemsText = item.items?.map((entry: any) => `${entry.quantity}x ${entry.name}`).join(", ") || "Order details";
    const paymentText = item.paymentMethod === "COD" ? "Cash on delivery" : item.paymentStatus === "PAID" ? "Paid online" : "Payment pending";

    return (
      <Animated.View entering={FadeInUp.delay(index * 60)} style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {restaurant?.name || "Restaurant"}
            </Text>
            <Text style={styles.orderMeta}>
              Order #{item._id?.slice(-7).toUpperCase()} • {dateText}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderFood}>
          <View style={styles.orderEmoji}>
            {/* Fallback to emoji if real image is not provided, since HTML has an emoji */}
            <Text style={styles.emojiText}>🍕</Text> 
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemsText} numberOfLines={2}>{itemsText}</Text>
            <Text style={styles.priceText}>
              ₹{item.totalAmount} • {paymentText}
            </Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push(`/order-tracking/${item._id}`)}>
            <Text style={styles.outlineBtnText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.darkBtn}>
            <Text style={styles.darkBtnText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#161616" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>Current and previous food orders</Text>
        </View>
      </View>

      {!isAuthenticated ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={30} color="#7A6500" />
          </View>
          <Text style={styles.emptyTitle}>Sign in to see orders</Text>
          <Text style={styles.emptyHint}>You need to be logged in to view your past and upcoming orders.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
             <Text style={styles.loginBtnText}>Log In / Register</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.pageBody}
          refreshControl={<RefreshControl refreshing={isLoading && orders.length > 0} onRefresh={onRefresh} tintColor="#FFD400" />}
          ListEmptyComponent={
            isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#FFD400" />
              <Text style={styles.emptyHint}>Loading your orders...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={30} color="#7A6500" />
              </View>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyHint}>Your order history will appear here after checkout.</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/(tabs)")}>
                <Text style={styles.loginBtnText}>Browse restaurants</Text>
              </TouchableOpacity>
            </View>
          )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  pageHeader: {
    paddingHorizontal: 18,
    paddingVertical: 17,
    paddingTop: Platform.OS === 'android' ? 45 : 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    backgroundColor: '#fff',
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#838383',
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  pageBody: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 35,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 20,
    padding: 14,
    marginBottom: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.025,
    shadowRadius: 18,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  orderMeta: {
    fontSize: 12,
    color: '#818181',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Black',
  },
  orderFood: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    borderStyle: 'dashed', // Note: React Native borderStyle dashed might not work on only one edge, but keeping it for completeness. Actually, borderTopWidth with style dashed works on some versions, else solid.
  },
  orderEmoji: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FFF8D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 27,
  },
  itemsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  priceText: {
    fontSize: 12,
    color: '#818181',
    marginTop: 3,
    fontFamily: 'Inter-Regular',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
  },
  outlineBtn: {
    flex: 1,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-Black',
    color: '#161616',
  },
  darkBtn: {
    flex: 1,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-Black',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 50,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: '#FFF8D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#161616',
  },
  emptyHint: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  loginBtn: {
    marginTop: 22,
    height: 47,
    paddingHorizontal: 30,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Black',
  },
});
