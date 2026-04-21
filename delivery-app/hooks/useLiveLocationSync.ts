import { useEffect } from "react";
import * as Location from "expo-location";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";

export function useLiveLocationSync() {
  const isAuthenticated = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.isAuthenticated
  );
  const dashboard = useDeliveryStore(
    (state: ReturnType<typeof useDeliveryStore.getState>) => state.dashboard
  );
  const pushLocationUpdate = useDeliveryStore(
    (state: ReturnType<typeof useDeliveryStore.getState>) => state.pushLocationUpdate
  );

  useEffect(() => {
    if (!isAuthenticated || !dashboard?.availability.isOnline) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const sync = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted" || cancelled) {
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await pushLocationUpdate([position.coords.longitude, position.coords.latitude]);
    };

    void sync();

    if (dashboard.activeOrder) {
      intervalId = setInterval(() => {
        void sync();
      }, 15000);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dashboard?.activeOrder, dashboard?.availability.isOnline, isAuthenticated, pushLocationUpdate]);
}
