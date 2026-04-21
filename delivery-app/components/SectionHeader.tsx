import { Pressable, StyleSheet, Text, View } from "react-native";

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
    gap: 12,
  },
  title: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },
  action: {
    color: "#D97706",
    fontSize: 13,
    fontWeight: "800",
  },
});
