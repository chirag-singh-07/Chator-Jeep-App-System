import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import {
  startBackgroundLocation,
  stopBackgroundLocation,
} from "@/lib/backgroundLocation";

export function useLiveLocationSync() {
  const isAuthenticated = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.isAuthenticated
  );
  const dashboard = useDeliveryStore(
    (state: ReturnType<typeof useDeliveryStore.getState>) => state.dashboard
  );

  useEffect(() => {
    if (!isAuthenticated || !dashboard?.availability.isOnline) {
      void stopBackgroundLocation();
      return;
    }

    if (dashboard.activeOrder) {
      void startBackgroundLocation();
    } else {
      void stopBackgroundLocation();
    }
  }, [dashboard?.activeOrder, dashboard?.availability.isOnline, isAuthenticated]);
}
