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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { format } from "date-fns";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  PENDING: { label: "Waiting", color: "#B45309", bg: "#FEF3C7", icon: "time-outline" },
  ACCEPTED: { label: "Accepted", color: "#1D4ED8", bg: "#DBEAFE", icon: "checkmark-circle-outline" },
  PREPARING: { label: "Preparing", color: "#7C3AED", bg: "#EDE9FE", icon: "restaurant-outline" },
  READY: { label: "Ready", color: "#0891B2", bg: "#CFFAFE", icon: "bag-check-outline" },
  PICKED_UP: { label: "On the way", color: "#EA580C", bg: "#FFEDD5", icon: "bicycle-outline" },
  ARRIVED: { label: "Arrived", color: "#059669", bg: "#D1FAE5", icon: "navigate-outline" },
  COMPLETED: { label: "Delivered", color: "#16A34A", bg: "#DCFCE7", icon: "checkmark-done-outline" },
  CANCELLED: { label: "Cancelled", color: "#DC2626", bg: "#FEE2E2", icon: "close-circle-outline" },
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
    const logo = getRestaurantLogo(restaurant);
    const dateText = item.createdAt ? format(new Date(item.createdAt), "dd MMM, hh:mm a") : "Recently";
    const itemsText = item.items?.map((entry: any) => `${entry.quantity}x ${entry.name}`).join(", ") || "Order details";
    const partner = item.deliveryId;

    return (
      <Animated.View entering={FadeInUp.delay(index * 60)} style={styles.card}>
        <TouchableOpacity activeOpacity={0.86} onPress={() => router.push(`/order-tracking/${item._id}`)}>
          <View style={styles.cardTop}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.restaurantImage} />
            ) : (
              <View style={styles.restaurantFallback}>
                <Ionicons name="restaurant" size={24} color={Colors.light.primary} />
              </View>
            )}

            <View style={styles.cardTitleBlock}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {restaurant?.name || "Restaurant"}
              </Text>
              <Text style={styles.orderMeta}>
                #{item._id?.slice(-7).toUpperCase()} / {dateText}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon} size={13} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.itemsText} numberOfLines={2}>{itemsText}</Text>

          {partner ? (
            <View style={styles.partnerStrip}>
              {partner.profilePhoto ? (
                <Image source={{ uri: partner.profilePhoto }} style={styles.partnerImage} />
              ) : (
                <View style={styles.partnerFallback}>
                  <Ionicons name="person" size={14} color="#64748B" />
                </View>
              )}
              <View style={styles.partnerTextBlock}>
                <Text style={styles.partnerName} numberOfLines={1}>{partner.fullName || "Delivery Partner"}</Text>
                <Text style={styles.partnerCaption}>{partner.vehicleType || "Partner"} assigned</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </View>
          ) : null}

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>Total</Text>
              <Text style={styles.totalText}>Rs.{item.totalAmount}</Text>
            </View>
            <View style={styles.paymentPill}>
              <Ionicons name={item.paymentStatus === "PAID" ? "shield-checkmark-outline" : "wallet-outline"} size={15} color="#111827" />
              <Text style={styles.paymentText}>
                {item.paymentMethod === "COD" ? "COD" : item.paymentStatus === "PAID" ? "Paid" : "Payment pending"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Your food trail</Text>
          <Text style={styles.title}>Orders</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading && orders.length > 0} onRefresh={onRefresh} tintColor={Colors.light.primary} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.emptyHint}>Loading your orders...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={46} color={Colors.light.primary} />
              </View>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyHint}>Your order history will appear here after checkout.</Text>
              <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/(tabs)")}>
                <Text style={styles.browseButtonText}>Browse restaurants</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18, backgroundColor: "#FFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kicker: { color: Colors.light.primary, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: Colors.light.text, fontSize: 32, fontWeight: "900", marginTop: 2 },
  refreshButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  list: { padding: 18, paddingBottom: 110 },
  card: { backgroundColor: "#FFF", borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#EEF0F4", shadowColor: "#0F172A", shadowOpacity: 0.07, shadowRadius: 16, elevation: 3 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  restaurantImage: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#F3F4F6" },
  restaurantFallback: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#FFF5F2", alignItems: "center", justifyContent: "center" },
  cardTitleBlock: { flex: 1 },
  restaurantName: { color: Colors.light.text, fontSize: 17, fontWeight: "900" },
  orderMeta: { color: "#94A3B8", fontSize: 12, fontWeight: "700", marginTop: 3 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "900" },
  itemsText: { color: "#64748B", fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 14 },
  partnerStrip: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F8FAFC", borderRadius: 18, padding: 10, marginTop: 14 },
  partnerImage: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#E5E7EB" },
  partnerFallback: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  partnerTextBlock: { flex: 1 },
  partnerName: { color: "#111827", fontSize: 13, fontWeight: "900" },
  partnerCaption: { color: "#64748B", fontSize: 11, fontWeight: "700", marginTop: 1 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  footerLabel: { color: "#94A3B8", fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  totalText: { color: Colors.light.text, fontSize: 20, fontWeight: "900", marginTop: 1 },
  paymentPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F3F4F6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  paymentText: { color: "#111827", fontSize: 12, fontWeight: "900" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 110, paddingHorizontal: 34 },
  emptyIcon: { width: 88, height: 88, borderRadius: 32, backgroundColor: "#FFF5F2", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  emptyTitle: { color: Colors.light.text, fontSize: 20, fontWeight: "900" },
  emptyHint: { color: "#94A3B8", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8, fontWeight: "600" },
  browseButton: { marginTop: 22, height: 50, paddingHorizontal: 22, borderRadius: 18, backgroundColor: Colors.light.primary, alignItems: "center", justifyContent: "center" },
  browseButtonText: { color: Colors.light.black, fontSize: 14, fontWeight: "900" },
});
