import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DeliveryOrder } from "@/types";
import { Colors, Radius, Spacing } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export function DeliveryMapCard({ order }: { order: DeliveryOrder }) {
  const pickup = order.route.pickupCoordinates;
  const drop = order.route.dropCoordinates;

  const openNavigation = async (coordinates?: [number, number], fallbackAddress?: string) => {
    const destination = coordinates
      ? `${coordinates[1]},${coordinates[0]}`
      : encodeURIComponent(fallbackAddress ?? "");
    await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  if (!pickup || !drop) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.title}>Routing unavailable</Text>
        <Text style={styles.text}>
          Coordinate data is incomplete right now. Pickup and drop addresses are still available below.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.title}>Active Route</Text>
        <Text style={styles.text}>Use your native maps app for turn-by-turn navigation.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => void openNavigation(pickup, order.route.pickupAddress)}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="restaurant" size={20} color="#D97706" />
          </View>
          <View style={styles.btnContent}>
            <Text style={styles.btnTitle}>Navigate to Pickup</Text>
            <Text style={styles.btnSub} numberOfLines={1}>{order.route.pickupAddress}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => void openNavigation(drop, order.route.dropAddress)}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="person" size={20} color="#4338CA" />
          </View>
          <View style={styles.btnContent}>
            <Text style={styles.btnTitle}>Navigate to Drop-off</Text>
            <Text style={styles.btnSub} numberOfLines={1}>{order.route.dropAddress}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  infoBox: {
    padding: Spacing.md,
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  text: {
    color: Colors.light.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
  fallback: {
    padding: 18,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    gap: 6,
  },
  buttonContainer: {
    paddingVertical: Spacing.xs,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flex: 1,
    gap: 2,
  },
  btnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  btnSub: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 72,
  }
});