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
import { router } from "expo-router";

// Tab filters — must match backend UPPERCASE ORDER_STATUS constants
const STATUS_TABS = [
  { id: 'PENDING', label: 'New' },
  { id: 'PREPARING', label: 'Preparing' },
  { id: 'READY', label: 'Ready' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out' },
  { id: 'completed', label: 'Done' },
];

export default function OrdersScreen() {
  const {
    orders,
    fetchOrders,
    isLoading,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
  } = useOrderStore();
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'completed') {
      return o.status === 'DELIVERED' || o.status === 'CANCELLED';
    }
    return o.status === activeTab;
  });

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/order/${item._id}`)}
    >
      <View style={styles.cardHeader}>
        <View>
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
        <Text style={styles.priceText}>₹{item.totalAmount.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.customerRow}>
        <Ionicons name="person-circle" size={16} color="#666" />
        <Text style={styles.customerName}>{item.customerData.name}</Text>
      </View>

      <View style={styles.itemsBox}>
        <Text style={styles.itemSummary} numberOfLines={2}>
          {item.items.map((i) => `${i.quantity}x ${i.name}`).join(" • ")}
        </Text>
      </View>

      <View style={styles.statusIndicator}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>

      <View style={styles.footerActions}>
        {item.status === 'PENDING' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => rejectOrder(item._id)}
            >
              <Text style={styles.rejectText}>DECLINE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={() => acceptOrder(item._id, 15)}
            >
              <Text style={styles.acceptText}>ACCEPT & PREP</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'ACCEPTED' && (
          <TouchableOpacity
            style={styles.fullWidthBtn}
            onPress={() => updateOrderStatus(item._id, 'PREPARING')}
          >
            <Ionicons name="flame" size={18} color="black" />
            <Text style={styles.fullWidthBtnText}>START PREPARING</Text>
          </TouchableOpacity>
        )}

        {item.status === 'PREPARING' && (
          <TouchableOpacity
            style={styles.fullWidthBtn}
            onPress={() => updateOrderStatus(item._id, 'READY')}
          >
            <Ionicons name="checkmark-circle" size={18} color="black" />
            <Text style={styles.fullWidthBtnText}>READY FOR DISPATCH</Text>
          </TouchableOpacity>
        )}

        {item.status === 'READY' && (
          <TouchableOpacity
            style={[styles.fullWidthBtn, { backgroundColor: '#FF8C00' }]}
            onPress={() => updateOrderStatus(item._id, 'OUT_FOR_DELIVERY')}
          >
            <Ionicons name="bicycle" size={18} color="black" />
            <Text style={styles.fullWidthBtnText}>HANDOVER TO RIDER</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Orders</Text>
          <Text style={styles.subtitle}>Order Management</Text>
        </View>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshBtn}>
          <Ionicons name="sync" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
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
                {item.label.toUpperCase()}
              </Text>
              {activeTab === item.id && <View style={styles.activeLine} />}
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
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="receipt"
                size={40}
                color="#222"
              />
            </View>
            <Text style={styles.emptyText}>No orders right now</Text>
            <Text style={styles.emptySub}>New customer orders will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return '#FFC107';
    case 'PREPARING': return '#00E676';
    case 'READY': return '#D4AF37';
    case 'OUT_FOR_DELIVERY': return '#FF8C00';
    case 'DELIVERED': return '#4CAF50';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  refreshBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  tabsContainer: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#111",
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
  },
  tabText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#444",
    letterSpacing: 1.5,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  activeLine: {
    width: 20,
    height: 2,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
    borderRadius: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    gap: 20,
  },
  orderCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 11,
    color: "#444",
    fontWeight: "800",
    marginTop: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#EEE",
  },
  itemsBox: {
    backgroundColor: "#111",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  itemSummary: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerActions: {
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  rejectBtn: {
    borderColor: "#FF4B4B",
    backgroundColor: "transparent",
  },
  rejectText: {
    color: "#FF4B4B",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  acceptBtn: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  acceptText: {
    color: "black",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  fullWidthBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.light.primary,
    height: 60,
    borderRadius: 20,
  },
  fullWidthBtnText: {
    color: "black",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#111',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
  },
  emptySub: {
    fontSize: 12,
    color: "#444",
    fontWeight: "700",
    marginTop: 8,
  },
});
