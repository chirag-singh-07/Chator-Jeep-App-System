import { useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InfoCard } from "@/components/InfoCard";
import { OrderCard } from "@/components/OrderCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { DeliveryOrder } from "@/types";

export default function OrdersScreen() {
  const { orders, isLoading, fetchAssignedOrders } = useDeliveryStore();

  useEffect(() => {
    void fetchAssignedOrders();
  }, [fetchAssignedOrders]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
        <ScrollView
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void fetchAssignedOrders()} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <DashboardHeader
            title="Assigned orders"
            subtitle="Track every active pickup and delivery from one place."
          />

          {orders.length ? (
            orders.map((order: DeliveryOrder) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/order/${order.orderId}`)}
              />
            ))
          ) : (
            <InfoCard accent="slate">
              <Text style={styles.title}>No assigned orders</Text>
              <Text style={styles.subtitle}>
                Your current assignments will appear here as soon as dispatch sends one your way.
              </Text>
            </InfoCard>
          )}
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingBottom: 30,
    gap: 12,
  },
  title: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
  },
});
