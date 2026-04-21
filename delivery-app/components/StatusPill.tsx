import { StyleSheet, Text, View } from "react-native";

const toneMap: Record<string, { backgroundColor: string; color: string }> = {
  ASSIGNED: { backgroundColor: "#FEF3C7", color: "#B45309" },
  PICKED_UP: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
  DELIVERED: { backgroundColor: "#DCFCE7", color: "#15803D" },
  PENDING: { backgroundColor: "#FEF3C7", color: "#B45309" },
  APPROVED: { backgroundColor: "#DCFCE7", color: "#15803D" },
  REJECTED: { backgroundColor: "#FEE2E2", color: "#B91C1C" },
  PAID: { backgroundColor: "#DCFCE7", color: "#15803D" },
  UNPAID: { backgroundColor: "#E2E8F0", color: "#334155" },
  UNKNOWN: { backgroundColor: "#E2E8F0", color: "#334155" },
};

export function StatusPill({ label, status }: { label: string; status: string }) {
  const tone = toneMap[status] ?? toneMap.UNKNOWN;

  return (
    <View style={[styles.pill, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.text, { color: tone.color }]}>{label.replace(/_/g, " ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
