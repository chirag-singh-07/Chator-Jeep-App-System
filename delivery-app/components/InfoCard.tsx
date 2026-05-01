import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { Colors, Spacing, Radius, Shadows } from "../constants/Colors";

export function InfoCard({
  children,
  accent,
}: PropsWithChildren<{ accent: "amber" | "green" | "blue" | "slate" }>) {
  return <View style={[styles.card, accentStyles[accent]]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    ...Shadows.soft,
  },
});

const accentStyles = StyleSheet.create({
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
