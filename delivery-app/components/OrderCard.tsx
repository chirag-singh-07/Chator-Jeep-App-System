import { Pressable, StyleSheet, Text, View } from "react-native";
import { DeliveryOrder } from "@/types";
import { formatCurrency } from "@/lib/format";
import { StatusPill } from "./StatusPill";

export function OrderCard({
  order,
  onPress,
  compact = true,
}: {
  order: DeliveryOrder;
  onPress?: () => void;
  compact?: boolean;
}) {
  const content = (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={styles.title}>{order.restaurant?.name ?? "Restaurant"}</Text>
          <Text style={styles.subtitle}>{order.customer?.name ?? "Customer"}</Text>
        </View>
        <StatusPill label={order.status} status={order.status} />
      </View>

      <Text style={styles.addressLabel}>Pickup</Text>
      <Text style={styles.addressText}>{order.route.pickupAddress}</Text>

      <Text style={[styles.addressLabel, { marginTop: 10 }]}>Drop</Text>
      <Text style={styles.addressText}>{order.route.dropAddress}</Text>

      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.metricLabel}>Order value</Text>
          <Text style={styles.metricValue}>{formatCurrency(order.paymentSummary?.totalAmount ?? 0)}</Text>
        </View>
        <View>
          <Text style={styles.metricLabel}>Your earning</Text>
          <Text style={styles.metricValue}>{formatCurrency(order.earnings?.finalAmount ?? 0)}</Text>
        </View>
      </View>

      {!compact && order.order?.items?.length ? (
        <View style={styles.items}>
          {order.order.items.map((item) => (
            <Text key={`${item.name}-${item.menuItemId}`} style={styles.itemText}>
              {item.quantity} x {item.name}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 6,
  },
  pressed: {
    opacity: 0.86,
  },
  topRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  title: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },
  subtitle: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },
  addressLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  addressText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  metricLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  items: {
    marginTop: 10,
    gap: 4,
  },
  itemText: {
    color: "#475569",
    fontSize: 13,
  },
});
