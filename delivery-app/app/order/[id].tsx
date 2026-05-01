import { useEffect, useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { DeliveryMapCard } from "@/components/DeliveryMapCard";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusPill } from "@/components/StatusPill";
import { ThemedInput } from "@/components/ThemedInput";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { formatCurrency } from "@/lib/format";
import { DeliveryOrder } from "@/types";
import { Colors, Spacing, Radius, Shadows } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    selectedOrder,
    fetchOrderDetail,
    updateOrderStatus,
  } = useDeliveryStore();
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (params.id) {
      void fetchOrderDetail(params.id);
    }
  }, [fetchOrderDetail, params.id]);

  const order = selectedOrder;

  const canPickup = useMemo(() => order && order.status === "ACCEPTED", [order]);
  const canArrive = useMemo(() => order && order.status === "PICKED_UP", [order]);
  const canComplete = useMemo(() => order && order.status === "ARRIVED", [order]);

  const openNavigation = async (coordinates?: [number, number], fallbackAddress?: string) => {
    const destination = coordinates
      ? `${coordinates[1]},${coordinates[0]}`
      : encodeURIComponent(fallbackAddress ?? "");
    await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  if (!order) {
    return (
      <ScreenContainer withSafeArea style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading Shipment...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withSafeArea style={{ backgroundColor: Colors.light.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerLabel}>ORDER ID</Text>
          <Text style={styles.headerTitle}>#{order.orderId}</Text>
        </View>
        <StatusPill label={order.status} status={order.status} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DeliveryMapCard order={order} />

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Next Step</Text>
          <View style={styles.actionStack}>
            {canPickup && (
              <PrimaryButton
                label="Pick Up Order"
                onPress={() => void updateOrderStatus(order.orderId, "PICKED_UP")}
                icon="cube-outline"
                style={styles.mainAction}
              />
            )}
            
            {canArrive && (
              <PrimaryButton
                label="Reached Destination"
                onPress={() => void updateOrderStatus(order.orderId, "ARRIVED")}
                icon="location-outline"
                style={styles.mainAction}
              />
            )}

            {canComplete && (
              <View style={styles.otpSection}>
                <Text style={styles.otpLabel}>Enter 4-Digit OTP</Text>
                <ThemedInput
                  placeholder="----"
                  keyboardType="numeric"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                  containerStyle={styles.otpInput}
                  style={styles.otpText}
                />
                <PrimaryButton
                  label="Handover & Complete"
                  onPress={() => {
                    if (otp.length !== 4) {
                      Alert.alert("Error", "Please enter a valid 4-digit OTP");
                      return;
                    }
                    updateOrderStatus(order.orderId, "COMPLETED", otp);
                  }}
                  icon="checkmark-done"
                  style={styles.completeBtn}
                />
              </View>
            )}

            <View style={styles.navRow}>
              <TouchableOpacity 
                style={styles.navBtn}
                onPress={() => void openNavigation(order.route.pickupCoordinates, order.route.pickupAddress)}
              >
                <Ionicons name="restaurant" size={20} color={Colors.light.primary} />
                <Text style={styles.navBtnText}>Store Location</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navBtn}
                onPress={() => void openNavigation(order.route.dropCoordinates, order.route.dropAddress)}
              >
                <Ionicons name="person" size={20} color={Colors.light.primary} />
                <Text style={styles.navBtnText}>Customer Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <SectionHeader title="Shipment Details" />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="restaurant-outline" size={22} color={Colors.light.primary} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Pickup From</Text>
              <Text style={styles.detailValue}>{order.restaurant?.name ?? "Restaurant"}</Text>
              <Text style={styles.detailSubValue}>{order.route.pickupAddress}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="person-outline" size={22} color={Colors.light.primary} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Deliver To</Text>
              <Text style={styles.detailValue}>{order.customer?.name ?? "Customer"}</Text>
              <Text style={styles.detailSubValue}>{order.route.dropAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <SectionHeader title="Payment Info" />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Value</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.paymentSummary?.totalAmount ?? 0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Mode</Text>
            <Text style={styles.summaryValue}>{order.paymentSummary?.paymentStatus === 'PAID' ? 'PREPAID' : 'CASH ON DELIVERY'}</Text>
          </View>
          <View style={[styles.summaryRow, styles.earningsRow]}>
            <Text style={styles.earningsLabel}>Your Earning</Text>
            <Text style={styles.earningsValue}>{formatCurrency(order.earnings?.finalAmount ?? 0)}</Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <SectionHeader title="Status History" />
          <StatusTimeline items={order.statusTimeline} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.light.textDim,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  headerInfo: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.light.textMuted,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: Spacing.xl,
  },
  actionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.soft,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  actionStack: {
    gap: Spacing.md,
  },
  mainAction: {
    height: 64,
    ...Shadows.gold,
  },
  otpSection: {
    gap: Spacing.sm,
    backgroundColor: Colors.light.surfaceSecondary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  otpInput: {
    height: 60,
    backgroundColor: Colors.light.background,
  },
  otpText: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 12,
    color: Colors.light.primary,
  },
  completeBtn: {
    height: 56,
  },
  navRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  detailsSection: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  detailSubValue: {
    fontSize: 13,
    color: Colors.light.textDim,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textDim,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  earningsRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  earningsLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  timelineSection: {
    gap: Spacing.md,
  }
});

