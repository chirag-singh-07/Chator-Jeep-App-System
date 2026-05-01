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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import { Colors, Spacing, Radius, Shadows } from "../../constants/Colors";

export default function DashboardScreen() {
  const user = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.user,
  );
  const {
    dashboard,
    partnerProfile,
    activeRequest,
    isLoading,
    initialProfileFetched,
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
    if (initialProfileFetched && !partnerProfile) {
      router.replace("/(auth)/register");
    }
  }, [initialProfileFetched, partnerProfile]);

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
          subtitle="Ready for today's deliveries?"
        />

        <View style={styles.availabilityCard}>
          <View style={styles.glowOverlay} />
          <View style={styles.availabilityInfo}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, dashboard?.availability.isOnline && styles.statusDotActive]} />
              <Text style={styles.statusLabel}>
                {dashboard?.availability.isOnline ? "OPERATIONAL" : "OFFLINE"}
              </Text>
            </View>
            <Text style={styles.infoTitle}>Shift Status</Text>
            <Text style={styles.infoSubtitle}>
              {dashboard?.availability.isOnline
                ? dashboard?.availability.isAvailable
                  ? "Waiting for assignments..."
                  : "Active delivery in progress"
                : "Go online to start earning"}
            </Text>
          </View>
          <Switch
            value={Boolean(dashboard?.availability.isOnline)}
            onValueChange={handleAvailabilityChange}
            trackColor={{
              false: "#333333",
              true: Colors.light.primary,
            }}
            thumbColor={Colors.light.white}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatTile
            label="EARNINGS"
            value={formatCurrency(dashboard?.wallet.totalEarnings ?? 0)}
            tone="amber"
            icon="wallet"
          />
          <StatTile
            label="ASSIGNED"
            value={String(dashboard?.assignedOrders.length ?? 0)}
            tone="blue"
            icon="bicycle"
          />
          <StatTile
            label="WALLET"
            value={formatCurrency(dashboard?.wallet.balance ?? 0)}
            tone="green"
            icon="cash"
          />
        </View>

        <SectionHeader
          title="Active Shipment"
          actionLabel={activeOrder ? "Map View" : undefined}
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
            <View style={styles.emptyIconBg}>
              <Ionicons name="notifications-off-outline" size={32} color={Colors.light.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No active tasks</Text>
            <Text style={styles.emptySubtitle}>
              New orders will appear here automatically as they are assigned.
            </Text>
          </View>
        )}

        <SectionHeader
          title="Recent Queue"
          actionLabel="History"
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
            <View style={styles.emptyRow}>
              <Text style={styles.emptyRowText}>Queue is empty</Text>
            </View>
          )}
        </View>

        <View style={styles.quickPayoutCard}>
          <LinearGradient
            colors={[Colors.light.surfaceSecondary, Colors.light.surface]}
            style={styles.payoutGradient}
          >
            <View style={styles.payoutContent}>
              <View>
                <Text style={styles.payoutLabel}>Available Balance</Text>
                <Text style={styles.payoutValue}>
                  {formatCurrency(dashboard?.wallet.balance ?? 0)}
                </Text>
              </View>
              <PrimaryButton
                label="Withdraw"
                onPress={() => router.push("/wallet/request")}
                style={styles.payoutBtn}
                textStyle={styles.payoutBtnText}
              />
            </View>
          </LinearGradient>
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
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  glowOverlay: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.light.primary,
    opacity: 0.05,
  },
  availabilityInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.xs,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.textMuted,
  },
  statusDotActive: {
    backgroundColor: Colors.light.success,
    ...Shadows.gold,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.light.textDim,
    letterSpacing: 1,
  },
  infoTitle: {
    color: Colors.light.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  infoSubtitle: {
    color: Colors.light.textDim,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  activeOrderContainer: {
    gap: Spacing.md,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: Colors.light.border,
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
    fontWeight: "800",
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.light.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  stack: {
    gap: Spacing.md,
  },
  emptyRow: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  emptyRowText: {
    color: Colors.light.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  quickPayoutCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.soft,
  },
  payoutGradient: {
    padding: Spacing.lg,
  },
  payoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutLabel: {
    color: Colors.light.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  payoutValue: {
    color: Colors.light.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  payoutBtn: {
    height: 44,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  payoutBtnText: {
    fontSize: 14,
  }
});
