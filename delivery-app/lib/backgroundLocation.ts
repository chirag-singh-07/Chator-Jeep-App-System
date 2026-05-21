import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { API_URL } from "@/lib/api";

export const DELIVERY_BACKGROUND_LOCATION_TASK = "delivery-background-location";

const sendBackgroundLocation = async (coordinates: [number, number]) => {
  const token = await AsyncStorage.getItem("delivery-token");
  if (!token) return;

  await fetch(`${API_URL}/delivery/location`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coordinates }),
  });
};

if (!TaskManager.isTaskDefined(DELIVERY_BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask(DELIVERY_BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      console.warn("Background location task failed", error);
      return;
    }

    const locations = (data as { locations?: Location.LocationObject[] } | undefined)?.locations;
    const latestLocation = locations?.[locations.length - 1];
    if (!latestLocation) return;

    await sendBackgroundLocation([
      latestLocation.coords.longitude,
      latestLocation.coords.latitude,
    ]);
  });
}

export const isBackgroundLocationRunning = () =>
  Location.hasStartedLocationUpdatesAsync(DELIVERY_BACKGROUND_LOCATION_TASK);

export const startBackgroundLocation = async () => {
  const foregroundPermission = await Location.requestForegroundPermissionsAsync();
  if (foregroundPermission.status !== "granted") {
    return false;
  }

  const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
  if (backgroundPermission.status !== "granted") {
    return false;
  }

  const alreadyRunning = await isBackgroundLocationRunning();
  if (alreadyRunning) {
    return true;
  }

  await Location.startLocationUpdatesAsync(DELIVERY_BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000,
    distanceInterval: 20,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Chatori Jeeb delivery tracking",
      notificationBody: "Sharing your live location during an active delivery.",
      notificationColor: "#D4AF37",
    },
  });

  return true;
};

export const stopBackgroundLocation = async () => {
  const alreadyRunning = await isBackgroundLocationRunning();
  if (alreadyRunning) {
    await Location.stopLocationUpdatesAsync(DELIVERY_BACKGROUND_LOCATION_TASK);
  }
};
