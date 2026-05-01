import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

export function DashboardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  title: {
    color: Colors.light.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: Colors.light.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
