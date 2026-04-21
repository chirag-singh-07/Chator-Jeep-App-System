import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { DeliveryOrder } from "@/types";

export function DeliveryMapCard({ order }: { order: DeliveryOrder }) {
  const riderLocation = order.currentLocation?.coordinates;
  const pickup = order.route.pickupCoordinates;
  const drop = order.route.dropCoordinates;

  if (!pickup || !drop) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.title}>Map preview unavailable</Text>
        <Text style={styles.text}>
          Coordinate data is incomplete right now. Pickup and drop addresses are still available below.
        </Text>
      </View>
    );
  }

  const center = riderLocation || pickup;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: center[1],
          longitude: center[0],
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {riderLocation ? (
          <Marker
            coordinate={{ latitude: riderLocation[1], longitude: riderLocation[0] }}
            title="Your live location"
            pinColor="#F59E0B"
          />
        ) : null}
        <Marker
          coordinate={{ latitude: pickup[1], longitude: pickup[0] }}
          title="Pickup"
          description={order.route.pickupAddress}
          pinColor="#2563EB"
        />
        <Marker
          coordinate={{ latitude: drop[1], longitude: drop[0] }}
          title="Drop"
          description={order.route.dropAddress}
          pinColor="#16A34A"
        />
        <Polyline
          coordinates={[
            ...(riderLocation
              ? [{ latitude: riderLocation[1], longitude: riderLocation[0] }]
              : []),
            { latitude: pickup[1], longitude: pickup[0] },
            { latitude: drop[1], longitude: drop[0] },
          ]}
          strokeColor="#F59E0B"
          strokeWidth={4}
        />
      </MapView>
      <View style={styles.legend}>
        <Text style={styles.title}>Live route overview</Text>
        <Text style={styles.text}>Amber = rider, blue = pickup, green = customer destination.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  map: {
    width: "100%",
    height: 220,
  },
  legend: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  fallback: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    gap: 6,
  },
  title: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  text: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
  },
});
