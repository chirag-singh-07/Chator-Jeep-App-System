import { StyleSheet, Text, View } from "react-native";

export function StatusTimeline({
  items,
}: {
  items: Array<{ label: string; done: boolean; date?: string | Date | null }>;
}) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={`${item.label}-${index}`} style={styles.row}>
          <View style={styles.markerColumn}>
            <View style={[styles.dot, item.done && styles.dotDone]} />
            {index < items.length - 1 ? <View style={[styles.line, item.done && styles.lineDone]} /> : null}
          </View>
          <View style={{ flex: 1, gap: 4, paddingBottom: 14 }}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.date}>{item.date ? new Date(item.date).toLocaleString() : "Pending"}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  markerColumn: {
    alignItems: "center",
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginTop: 4,
  },
  dotDone: {
    backgroundColor: "#F59E0B",
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 4,
  },
  lineDone: {
    backgroundColor: "#F59E0B",
  },
  label: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  date: {
    color: "#64748B",
    fontSize: 13,
  },
});
