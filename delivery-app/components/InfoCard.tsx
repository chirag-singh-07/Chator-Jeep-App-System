import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

export function InfoCard({
  children,
  accent,
}: PropsWithChildren<{ accent: "amber" | "green" | "blue" | "slate" }>) {
  return <View style={[styles.card, accentStyles[accent]]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
});

const accentStyles = StyleSheet.create({
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
