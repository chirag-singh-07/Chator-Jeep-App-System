import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";

const toneMap: Record<string, { backgroundColor: string; color: string }> = {
  ASSIGNED: { backgroundColor: Colors.light.surfaceSecondary, color: Colors.light.textMuted },
  PICKED_UP: { backgroundColor: "#DCFCE7", color: Colors.light.success },
  DELIVERED: { backgroundColor: "#DCFCE7", color: Colors.light.success },
  PENDING: { backgroundColor: Colors.light.surfaceSecondary, color: Colors.light.textMuted },
  APPROVED: { backgroundColor: "#DCFCE7", color: Colors.light.success },
  REJECTED: { backgroundColor: "#FEE2E2", color: Colors.light.error },
  PAID: { backgroundColor: "#DCFCE7", color: Colors.light.success },
  UNPAID: { backgroundColor: Colors.light.surface, color: Colors.light.textMuted },
  UNKNOWN: { backgroundColor: Colors.light.surface, color: Colors.light.textMuted },
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