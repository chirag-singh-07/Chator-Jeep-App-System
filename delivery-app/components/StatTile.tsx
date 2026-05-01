import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Radius } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

interface StatTileProps {
  label: string;
  value: string;
  tone: "amber" | "green" | "blue" | "slate";
  icon?: keyof typeof Ionicons.glyphMap;
}

export function StatTile({ label, value, tone, icon }: StatTileProps) {
  const accentColor = toneColors[tone];
  
  return (
    <View style={[styles.card, { borderColor: accentColor }]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon && (
          <Ionicons name={icon} size={16} color={accentColor} />
        )}
      </View>
      <Text style={[styles.value, { color: tone === 'amber' ? Colors.light.primary : Colors.light.text }]}>
        {value}
      </Text>
    </View>
  );
}

const toneColors = {
  amber: Colors.light.primary,
  green: Colors.light.success,
  blue: '#3B82F6',
  slate: Colors.light.border,
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    backgroundColor: Colors.light.surface,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: Colors.light.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
});
