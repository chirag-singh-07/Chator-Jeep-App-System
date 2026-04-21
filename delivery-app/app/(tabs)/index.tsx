import { useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DeliveryMapCard } from "@/components/DeliveryMapCard";
import { InfoCard } from "@/components/InfoCard";
import { OrderCard } from "@/components/OrderCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatTile } from "@/components/StatTile";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { DeliveryOrder } from "@/types";

export default function DashboardScreen() {
  const user = useAuthStore((state: ReturnType<typeof useAuthStore.getState>) => state.user);
  const {
    dashboard,
    isLoading,
    fetchDashboard,
    toggleAvailability,
  } = useDeliveryStore();
  const activeOrder = dashboard?.activeOrder ?? null;

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleAvailabilityChange = async (nextValue: boolean) => {
    let coords: [number, number] | undefined;

    if (nextValue) {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === "granted") {
        const position = await Location.getCurrentPositionAsync({});
        coords = [position.coords.longitude, position.coords.latitude];
      }
    }

    await toggleAvailability(nextValue, coords);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
        <ScrollView
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void fetchDashboard()} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <DashboardHeader
            title={`Hey ${user?.name?.split(" ")[0] ?? "Rider"}`}
            subtitle="Your live dispatch board for active deliveries and payout health."
          />

          <InfoCard accent="amber">
            <View style={styles.availabilityRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.infoTitle}>Availability</Text>
                <Text style={styles.infoSubtitle}>
                  {dashboard?.availability.isOnline
                    ? dashboard?.availability.isAvailable
                      ? "Online and ready for new assignments"
                      : "Online with an active delivery in progress"
                    : "Offline until you go live"}
                </Text>
                {dashboard?.availability.lastLocationUpdatedAt ? (
                  <Text style={styles.metaText}>
                    Last synced {formatRelativeTime(dashboard.availability.lastLocationUpdatedAt)}
                  </Text>
                ) : null}
              </View>
              <Switch
                value={Boolean(dashboard?.availability.isOnline)}
                onValueChange={handleAvailabilityChange}
                trackColor={{ false: "#CBD5E1", true: "#FBBF24" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </InfoCard>

          <View style={styles.grid}>
            <StatTile label="Assigned orders" value={String(dashboard?.assignedOrders.length ?? 0)} tone="amber" />
            <StatTile
              label="Wallet balance"
              value={formatCurrency(dashboard?.wallet.balance ?? 0)}
              tone="green"
            />
            <StatTile
              label="Total earnings"
              value={formatCurrency(dashboard?.wallet.totalEarnings ?? 0)}
              tone="blue"
            />
          </View>

          <SectionHeader
            title="Active delivery"
            actionLabel={activeOrder ? "Open details" : undefined}
            onPress={activeOrder ? () => router.push(`/order/${activeOrder.orderId}`) : undefined}
          />

          {activeOrder ? (
            <>
              <OrderCard order={activeOrder} compact={false} />
              <DeliveryMapCard order={activeOrder} />
            </>
          ) : (
            <InfoCard accent="slate">
              <Text style={styles.infoTitle}>No active delivery right now</Text>
              <Text style={styles.infoSubtitle}>
                Go online to receive assignments. As soon as a dispatch lands, it will appear here in real time.
              </Text>
            </InfoCard>
          )}

          <SectionHeader
            title="Assigned queue"
            actionLabel="View all"
            onPress={() => router.push("/(tabs)/orders")}
          />

          <View style={styles.stack}>
            {dashboard?.assignedOrders.length ? (
              dashboard.assignedOrders.slice(0, 3).map((order: DeliveryOrder) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/order/${order.orderId}`)}
                />
              ))
            ) : (
              <InfoCard accent="slate">
                <Text style={styles.infoTitle}>Your queue is clear</Text>
                <Text style={styles.infoSubtitle}>
                  New assignments will show up here when nearby orders are dispatched to you.
                </Text>
              </InfoCard>
            )}
          </View>

          <InfoCard accent="green">
            <Text style={styles.infoTitle}>Payout readiness</Text>
            <Text style={styles.infoSubtitle}>
              Available now: {formatCurrency(dashboard?.wallet.balance ?? 0)}. Held in pending requests:{" "}
              {formatCurrency(dashboard?.wallet.heldBalance ?? 0)}.
            </Text>
            <PrimaryButton
              label="Open wallet"
              onPress={() => router.push("/(tabs)/wallet")}
              style={{ marginTop: 14 }}
            />
          </InfoCard>
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
    paddingBottom: 36,
    gap: 18,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  infoTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },
  infoSubtitle: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
  },
  metaText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stack: {
    gap: 12,
  },
});
