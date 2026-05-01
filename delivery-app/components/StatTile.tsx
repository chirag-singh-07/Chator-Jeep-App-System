import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Radius } from "@/constants/Colors";

export function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "green" | "blue" | "slate";
}) {
  return (
    <View style={[styles.card, tones[tone]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: tone === 'amber' ? Colors.light.primary : Colors.light.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  label: {
    color: Colors.light.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: "900",
  },
});

const tones = StyleSheet.create({
  amber: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.primary,
  },
  green: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.success,
  },
  blue: {
    backgroundColor: Colors.light.surface,
    borderColor: '#3B82F6',
  },
  slate: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
  },
});
