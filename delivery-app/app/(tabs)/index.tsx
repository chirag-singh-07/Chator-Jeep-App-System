import { useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DeliveryMapCard } from "@/components/DeliveryMapCard";
import { OrderCard } from "@/components/OrderCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatTile } from "@/components/StatTile";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { DeliveryOrder } from "@/types";
import VerificationPending from "../(onboarding)/verification-pending";
import { OrderRequestModal } from "@/components/OrderRequestModal";
import { Colors, Spacing, Radius, Shadows } from "@/constants/Colors";

export default function DashboardScreen() {
  const user = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.user,
  );
  const {
    dashboard,
    partnerProfile,
    activeRequest,
    isLoading,
    fetchDashboard,
    fetchProfile,
    setActiveRequest,
    acceptOrder,
    toggleAvailability,
  } = useDeliveryStore();
  const activeOrder = dashboard?.activeOrder ?? null;

  useEffect(() => {
    void fetchProfile();
    void fetchDashboard();
  }, [fetchProfile, fetchDashboard]);

  useEffect(() => {
    if (!isLoading && !partnerProfile) {
      router.replace("/(auth)/register");
    }
  }, [isLoading, partnerProfile]);

  if (isLoading && !partnerProfile) {
    return (
      <ScreenContainer withSafeArea>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (partnerProfile && partnerProfile.status !== "approved") {
    return <VerificationPending />;
  }

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
    <ScreenContainer withSafeArea>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void fetchDashboard()}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <DashboardHeader
          title={`Hey ${user?.name?.split(" ")[0] ?? "Rider"}`}
          subtitle="Live dispatch board for your active deliveries."
        />

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityInfo}>
            <Text style={styles.infoTitle}>Shift Status</Text>
            <Text style={styles.infoSubtitle}>
              {dashboard?.availability.isOnline
                ? dashboard?.availability.isAvailable
                  ? "Online and ready for new assignments"
                  : "Active delivery in progress"
                : "Offline until you go live"}
            </Text>
            {dashboard?.availability.lastLocationUpdatedAt && (
              <Text style={styles.metaText}>
                Synced{" "}
                {formatRelativeTime(
                  dashboard.availability.lastLocationUpdatedAt,
                )}
              </Text>
            )}
          </View>
          <Switch
            value={Boolean(dashboard?.availability.isOnline)}
            onValueChange={handleAvailabilityChange}
            trackColor={{
              false: Colors.light.border,
              true: Colors.light.primary,
            }}
            thumbColor={Colors.light.white}
          />
        </View>

        <View style={styles.grid}>
          <StatTile
            label="Assigned"
            value={String(dashboard?.assignedOrders.length ?? 0)}
            tone="amber"
          />
          <StatTile
            label="Wallet"
            value={formatCurrency(dashboard?.wallet.balance ?? 0)}
            tone="green"
          />
          <StatTile
            label="Total"
            value={formatCurrency(dashboard?.wallet.totalEarnings ?? 0)}
            tone="blue"
          />
        </View>

        <SectionHeader
          title="Active Delivery"
          actionLabel={activeOrder ? "Details" : undefined}
          onPress={
            activeOrder
              ? () => router.push(`/order/${activeOrder.orderId}`)
              : undefined
          }
        />

        {activeOrder ? (
          <View style={styles.activeOrderContainer}>
            <OrderCard order={activeOrder} compact={false} />
            <DeliveryMapCard order={activeOrder} />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Quiet right now</Text>
            <Text style={styles.emptySubtitle}>
              Go online to receive assignments. New dispatches appear here
              instantly.
            </Text>
          </View>
        )}

        <SectionHeader
          title="Upcoming Queue"
          actionLabel="View all"
          onPress={() => router.push("/(tabs)/orders")}
        />

        <View style={styles.stack}>
          {dashboard?.assignedOrders.length ? (
            dashboard.assignedOrders
              .slice(0, 3)
              .map((order: DeliveryOrder) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/order/${order.orderId}`)}
                />
              ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Queue is empty</Text>
            </View>
          )}
        </View>

        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Text style={styles.infoTitle}>Payout Readiness</Text>
            <Text style={styles.payoutAmount}>
              {formatCurrency(dashboard?.wallet.balance ?? 0)}
            </Text>
          </View>
          <Text style={styles.infoSubtitle}>
            Pending settlements:{" "}
            {formatCurrency(dashboard?.wallet.heldBalance ?? 0)}
          </Text>
          <PrimaryButton
            label="Manage Wallet"
            onPress={() => router.push("/(tabs)/wallet")}
            style={styles.walletButton}
          />
        </View>
      </ScrollView>

      <OrderRequestModal
        request={activeRequest}
        onAccept={acceptOrder}
        onReject={() => setActiveRequest(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  availabilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.soft,
  },
  availabilityInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoTitle: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "800",
  },
  infoSubtitle: {
    color: Colors.light.textDim,
    fontSize: 14,
    lineHeight: 20,
  },
  metaText: {
    color: Colors.light.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  stack: {
    gap: Spacing.md,
  },
  activeOrderContainer: {
    gap: Spacing.md,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  emptyTitle: {
    color: Colors.light.textDim,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.light.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  payoutCard: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutAmount: {
    color: Colors.light.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  walletButton: {
    marginTop: Spacing.md,
  },
});
