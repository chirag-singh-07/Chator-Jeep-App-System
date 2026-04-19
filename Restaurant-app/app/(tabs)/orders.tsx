import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Tab filters
const STATUS_TABS = [
  { id: "pending", label: "New" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "out_for_delivery", label: "Out" },
  { id: "completed", label: "Done" },
];

export default function OrdersScreen() {
  const router = useRouter();
  const {
    orders,
    fetchOrders,
    isLoading,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
  } = useOrderStore();
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "completed") {
      return o.status === "delivered" || o.status === "cancelled";
    }
    return o.status === activeTab;
  });

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/order/${item._id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>
            #{item.orderNumber || item._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <Text style={styles.priceText}>₹{item.totalAmount}</Text>
      </View>

      <Text style={styles.customerName}>{item.customerData.name}</Text>
      <Text style={styles.itemSummary} numberOfLines={2}>
        {item.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
      </Text>

      {item.status === "pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={() => rejectOrder(item._id)}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.acceptBtn]}
            onPress={() => acceptOrder(item._id, 15)} // 15 mins default
          >
            <Text style={styles.acceptText}>Accept & Prep</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "preparing" && (
        <TouchableOpacity
          style={styles.fullWidthBtn}
          onPress={() => updateOrderStatus(item._id, "ready")}
        >
          <Ionicons name="checkmark-done" size={18} color="white" />
          <Text style={styles.fullWidthBtnText}>Mark as Ready</Text>
        </TouchableOpacity>
      )}

      {item.status === "ready" && (
        <TouchableOpacity
          style={[styles.fullWidthBtn, { backgroundColor: "#FF9800" }]}
          onPress={() => updateOrderStatus(item._id, "out_for_delivery")}
        >
          <Ionicons name="bicycle" size={18} color="white" />
          <Text style={styles.fullWidthBtnText}>Dispatch to Rider</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders Console</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === item.id && styles.activeTabItem,
              ]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.id && styles.activeTabText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchOrders}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={Colors.light.textMuted}
            />
            <Text style={styles.emptyText}>No orders in this phase</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.light.text,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: Colors.light.primary + "15",
    borderRadius: 12,
  },
  tabsContainer: {
    backgroundColor: "white",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#EFEFEF",
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  activeTabItem: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontWeight: "bold",
    color: "#666",
  },
  activeTabText: {
    color: "white",
  },
  listContent: {
    padding: 20,
    gap: 15,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.light.primary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "900",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemSummary: {
    color: Colors.light.textMuted,
    fontSize: 14,
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  btn: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  rejectBtn: {
    borderColor: "#FF4B4B",
    backgroundColor: "#FFF0F0",
  },
  rejectText: {
    color: "#FF4B4B",
    fontWeight: "bold",
  },
  acceptBtn: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success,
  },
  acceptText: {
    color: "white",
    fontWeight: "bold",
  },
  fullWidthBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.primary,
    height: 45,
    borderRadius: 12,
    marginTop: 10,
  },
  fullWidthBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: Colors.light.textMuted,
    fontWeight: "bold",
    fontSize: 16,
  },
});
