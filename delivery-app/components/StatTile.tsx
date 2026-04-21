import { StyleSheet, Text, View } from "react-native";

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
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    minWidth: "47%",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  label: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
  value: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },
});

const tones = StyleSheet.create({
  amber: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  green: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  blue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  slate: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
});
