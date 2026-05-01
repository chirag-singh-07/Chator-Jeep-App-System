import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Spacing } from "@/constants/Colors";

export function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: -Spacing.xs,
  },
  title: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "900",
  },
  action: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "800",
  },
});
