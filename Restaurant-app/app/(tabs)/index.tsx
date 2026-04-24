import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { router } from "expo-router";
import { apiClient } from "@/lib/api";

type DashboardCategory = {
  _id: string;
  name: string;
  image?: string;
};

type DashboardMenuItem = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category?: string;
  imageUrl?: string;
};

const CATEGORY_EMOJI: Record<string, string> = {
  burgers: "🍔",
  pizza: "🍕",
  wraps: "🌯",
  beverages: "🥤",
  desserts: "🍰",
  snacks: "🍟",
  biryani: "🍚",
  salads: "🥗",
  pasta: "🍝",
};

export default function KitchenDashboard() {
  const { user } = useAuthStore();
  const { orders, fetchOrders, isLoading } = useOrderStore();
  const [isOpen, setIsOpen] = useState(true);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [menuItems, setMenuItems] = useState<DashboardMenuItem[]>([]);

  const refreshDashboard = async () => {
    fetchOrders();
    try {
      const [walletRes, categoriesRes, menuRes] = await Promise.all([
        apiClient.get("/wallet/stats"),
        apiClient.get("/categories"),
        apiClient.get("/restaurants/me/menu"),
      ]);
      setWalletBalance(walletRes.data.data.balance);
      setCategories(categoriesRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleToggleOpen = async (value: boolean) => {
    setIsOpen(value);
    setTogglingOpen(true);
    try {
      if (user?.restaurantId) {
        await apiClient.patch(`/restaurants/me/status`, { isOpen: value });
      }
    } catch (e) {
      // Revert on error
      setIsOpen(!value);
    } finally {
      setTogglingOpen(false);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const activeOrders = orders.filter((o) =>
    ["ACCEPTED", "PREPARING", "READY"].includes(o.status),
  );

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return { bg: "#FFF3E0", text: "#E65100" };
      case "ACCEPTED":
        return { bg: "#E3F2FD", text: "#1565C0" };
      case "PREPARING":
        return { bg: "#F3E5F5", text: "#6A1B9A" };
      case "READY":
        return { bg: "#E8F5E9", text: "#2E7D32" };
      default:
        return { bg: "#F5F5F5", text: "#757575" };
    }
  };

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const categoryHighlights = useMemo(() => {
    return categories.map((category) => {
      const linkedItems = menuItems.filter(
        (item) => item.category === category._id || item.category === category.name
      );

      return {
        ...category,
        count: linkedItems.length,
        startingPrice: linkedItems.length
          ? Math.min(...linkedItems.map((item) => item.discountPrice || item.price))
          : 0,
        previewImage:
          linkedItems.find((item) => item.imageUrl)?.imageUrl ||
          category.image ||
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop",
        emoji: CATEGORY_EMOJI[category.name.toLowerCase()] || "🍽️",
      };
    });
  }, [categories, menuItems]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshDashboard}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Top Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.welcomeText}>Restaurant Home</Text>
            <Text style={styles.kitchenName}>
              {user?.name || "Your Kitchen"}
            </Text>
          </View>
          <View style={styles.switchBox}>
            <Text
              style={[
                styles.statusIndicator,
                { color: isOpen ? Colors.light.success : Colors.light.error },
              ]}
            >
              {isOpen ? "ACTIVE" : "OFFLINE"}
            </Text>
            <Switch
              trackColor={{ false: "#333", true: Colors.light.primary + "50" }}
              thumbColor={isOpen ? Colors.light.primary : "#666"}
              onValueChange={handleToggleOpen}
              value={isOpen}
              disabled={togglingOpen}
            />
          </View>
        </View>

        {/* Premium Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.mainStatCard}
            onPress={() => router.push("/(tabs)/earnings")}
          >
            <View style={styles.statIconCircle}>
              <Ionicons
                name="wallet-outline"
                size={22}
                color={Colors.light.primary}
              />
            </View>
            <Text style={styles.statLabelText}>Wallet Balance</Text>
            <Text style={styles.statValueText}>
              ₹{walletBalance.toLocaleString("en-IN")}
            </Text>
          </TouchableOpacity>

          <View style={styles.statsSecondaryColumn}>
            <View style={styles.smallStatCard}>
              <Text style={[styles.smallStatValue, { color: "#FFB300" }]}>
                {pendingOrders.length}
              </Text>
              <Text style={styles.smallStatLabel}>Pending</Text>
            </View>
            <View style={styles.smallStatCard}>
              <Text
                style={[styles.smallStatValue, { color: Colors.light.success }]}
              >
                {activeOrders.length}
              </Text>
              <Text style={styles.smallStatLabel}>In Kitchen</Text>
            </View>
          </View>
        </View>

        {/* Action Quick Access */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionGridItem}
            onPress={() => router.push("/(tabs)/menu")}
          >
            <View style={styles.actionIconPill}>
              <Ionicons name="restaurant" size={20} color="black" />
            </View>
            <Text style={styles.actionText}>Manage Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionGridItem, { backgroundColor: "#1A1A1A" }]}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <View style={[styles.actionIconPill, { backgroundColor: "#333" }]}>
              <Ionicons name="receipt" size={20} color={Colors.light.primary} />
            </View>
            <Text style={[styles.actionText, { color: "white" }]}>
              Manage Orders
            </Text>
          </TouchableOpacity>
        </View>

        {/* Critical Alerts */}
        {pendingOrders.length > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <View style={styles.pulseContainer}>
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.alertBannerText}>
              {pendingOrders.length} New Order
              {pendingOrders.length > 1 ? "s" : ""} waiting for approval!
            </Text>
            <Ionicons name="chevron-forward" size={18} color="black" />
          </TouchableOpacity>
        )}

        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Popular Categories</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/menu")}>
            <Text style={styles.feedLink}>Open Menu</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryStrip}
        >
          {categoryHighlights.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={styles.categoryCard}
              onPress={() => router.push("/(tabs)/menu")}
            >
              <Image
                source={{ uri: category.previewImage }}
                style={styles.categoryImage}
                contentFit="cover"
              />
              <View style={styles.categoryOverlay} />
              <View style={styles.categoryContent}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryMeta}>
                  {category.count}+ items • Starting ₹
                  {Math.round(category.startingPrice || 0)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Feed */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/orders")}>
            <Text style={styles.feedLink}>View All Orders</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedList}>
          {recentOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-offline-outline" size={40} color="#333" />
              <Text style={styles.emptyStateText}>
                No active orders at the moment
              </Text>
            </View>
          ) : (
            recentOrders.map((order) => {
              const { bg, text } = getStatusColor(order.status);
              return (
                <TouchableOpacity
                  key={order._id}
                  style={styles.orderTile}
                  onPress={() => router.push(`/order/${order._id}`)}
                >
                  <View style={styles.tileLeft}>
                    <Text style={styles.tileId}>
                      ID: #
                      {order.orderNumber || order._id.slice(-4).toUpperCase()}
                    </Text>
                    <Text style={styles.tileName}>
                      {order.customerData?.name || "Standard Customer"}
                    </Text>
                    <Text style={styles.tileItems} numberOfLines={1}>
                      {order.items
                        .map((i) => `${i.quantity}x ${i.name}`)
                        .join(", ")}
                    </Text>
                  </View>
                  <View style={styles.tileRight}>
                    <Text style={styles.tileTotal}>₹{order.totalAmount}</Text>
                    <View style={[styles.tileBadge, { backgroundColor: bg }]}>
                      <Text style={[styles.tileBadgeText, { color: text }]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Sleek black background
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 25,
  },
  welcomeText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  kitchenName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 4,
  },
  switchBox: {
    backgroundColor: "#1A1A1A",
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  statusIndicator: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  mainStatCard: {
    flex: 1.5,
    backgroundColor: "#111",
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  statLabelText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  statValueText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 5,
  },
  statsSecondaryColumn: {
    flex: 1,
    gap: 15,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  smallStatValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  smallStatLabel: {
    fontSize: 10,
    color: "#555",
    fontWeight: "bold",
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 10,
  },
  actionGridItem: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
  },
  actionIconPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 25,
    gap: 12,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  pulseContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "black",
  },
  alertBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  categoryStrip: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 14,
  },
  categoryCard: {
    width: 210,
    height: 138,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  categoryContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FFF",
  },
  categoryMeta: {
    fontSize: 12,
    color: "#F5E3A1",
    fontWeight: "700",
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 35,
    marginBottom: 15,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  feedLink: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 60,
    backgroundColor: "#0A0A0A",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#111",
  },
  emptyStateText: {
    marginTop: 15,
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  orderTile: {
    backgroundColor: "#0A0A0A",
    borderRadius: 25,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  tileLeft: {
    flex: 1,
  },
  tileId: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  tileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  tileItems: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
  },
  tileRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  tileTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  tileBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
  },
  tileBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
