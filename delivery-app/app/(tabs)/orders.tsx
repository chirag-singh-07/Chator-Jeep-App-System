import { useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DashboardHeader } from "@/components/DashboardHeader";
import { OrderCard } from "@/components/OrderCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { DeliveryOrder } from "@/types";
import { Colors, Spacing, Radius } from "../../constants/Colors";

export default function OrdersScreen() {
  const { orders, isLoading, fetchAssignedOrders } = useDeliveryStore();

  useEffect(() => {
    void fetchAssignedOrders();
  }, [fetchAssignedOrders]);

  return (
    <ScreenContainer withSafeArea>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={() => void fetchAssignedOrders()} 
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          title="Assigned Queue"
          subtitle="Manage all your active pickups and delivery assignments."
        />

        {orders.length ? (
          <View style={styles.stack}>
            {orders.map((order: DeliveryOrder) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/order/${order.orderId}`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="bicycle-outline" size={32} color={Colors.light.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Queue is Clear</Text>
            <Text style={styles.emptySubtitle}>
              New assignments will show up here as soon as they are dispatched to you.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  stack: {
    gap: Spacing.md,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    marginTop: Spacing.md,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.light.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});
