import { useEffect, useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View, TextInput, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeliveryMapCard } from "@/components/DeliveryMapCard";
import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusPill } from "@/components/StatusPill";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { formatCurrency } from "@/lib/format";
import { DeliveryOrder } from "@/types";

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    selectedOrder,
    fetchOrderDetail,
    acceptOrder,
    updateOrderStatus,
  } = useDeliveryStore();
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (params.id) {
      void fetchOrderDetail(params.id);
    }
  }, [fetchOrderDetail, params.id]);

  const order = selectedOrder;

  const canAccept = useMemo(() => order && order.status === "ACCEPTED" && !order.acceptedAt, [order]);
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
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
          <InfoCard accent="slate">
            <Text style={styles.sectionTitle}>Loading order details...</Text>
          </InfoCard>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.title}>Delivery order</Text>
              <Text style={styles.subtitle}>
                {order.restaurant?.name ?? "Restaurant"} to {order.customer?.name ?? "Customer"}
              </Text>
            </View>
            <StatusPill label={order.status} status={order.status} />
          </View>

          <DeliveryMapCard order={order} />

          <InfoCard accent="amber">
            <Text style={styles.sectionTitle}>Delivery actions</Text>
            <View style={styles.actionStack}>
              {canPickup ? (
                <PrimaryButton
                  label="Mark picked up"
                  onPress={() => void updateOrderStatus(order.orderId, "PICKED_UP")}
                />
              ) : null}
              
              <PrimaryButton
                label="Navigate to pickup"
                variant="secondary"
                onPress={() => void openNavigation(order.route.pickupCoordinates, order.route.pickupAddress)}
                style={{ marginBottom: 10 }}
              />

              {canArrive ? (
                <PrimaryButton
                  label="Mark Arrived"
                  onPress={() => void updateOrderStatus(order.orderId, "ARRIVED")}
                />
              ) : null}

              <PrimaryButton
                label="Navigate to customer"
                variant="secondary"
                onPress={() => void openNavigation(order.route.dropCoordinates, order.route.dropAddress)}
                style={{ marginBottom: 10 }}
              />

              {canComplete ? (
                <View style={styles.otpSection}>
                  <Text style={styles.otpLabel}>Enter Delivery OTP</Text>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="4-digit OTP"
                    keyboardType="numeric"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <PrimaryButton
                    label="Complete Delivery"
                    onPress={() => {
                      if (otp.length !== 4) {
                        Alert.alert("Error", "Please enter a valid 4-digit OTP");
                        return;
                      }
                      updateOrderStatus(order.orderId, "COMPLETED", otp);
                    }}
                  />
                </View>
              ) : null}
            </View>
          </InfoCard>

          <InfoCard accent="slate">
            <SectionHeader title="Pickup" />
            <Text style={styles.sectionTitle}>{order.restaurant?.name ?? "Restaurant details unavailable"}</Text>
            <Text style={styles.sectionText}>{order.route.pickupAddress}</Text>
            <Text style={styles.sectionText}>{order.restaurant?.phone || "No phone number"}</Text>
          </InfoCard>

          <InfoCard accent="slate">
            <SectionHeader title="Drop" />
            <Text style={styles.sectionTitle}>{order.customer?.name ?? "Customer"}</Text>
            <Text style={styles.sectionText}>{order.route.dropAddress}</Text>
            <Text style={styles.sectionText}>{order.customer?.phone || "No phone number"}</Text>
          </InfoCard>

          <InfoCard accent="blue">
            <SectionHeader title="Order items" />
            <View style={styles.itemsList}>
              {order.order?.items?.map((item: NonNullable<DeliveryOrder["order"]>["items"][number]) => (
                <View key={`${item.menuItemId}-${item.name}`} style={styles.rowBetween}>
                  <Text style={styles.sectionText}>
                    {item.quantity} x {item.name}
                  </Text>
                  <Text style={styles.sectionText}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
              ))}
            </View>
          </InfoCard>

          <InfoCard accent="green">
            <SectionHeader title="Payment summary" />
            <View style={styles.rowBetween}>
              <Text style={styles.sectionText}>Order total</Text>
              <Text style={styles.sectionTitle}>{formatCurrency(order.paymentSummary?.totalAmount ?? 0)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionText}>Payment status</Text>
              <StatusPill label={order.paymentSummary?.paymentStatus ?? "UNKNOWN"} status={order.paymentSummary?.paymentStatus ?? "UNKNOWN"} />
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionText}>Expected earning</Text>
              <Text style={styles.sectionTitle}>{formatCurrency(order.earnings?.finalAmount ?? 0)}</Text>
            </View>
          </InfoCard>

          <InfoCard accent="slate">
            <SectionHeader title="Status timeline" />
            <StatusTimeline items={order.statusTimeline} />
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
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  actionStack: {
    gap: 10,
    marginTop: 12,
  },
  itemsList: {
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  otpSection: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 10,
  },
  otpInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 15,
  },
});
