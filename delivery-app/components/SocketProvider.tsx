import { PropsWithChildren, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { io, Socket } from "socket.io-client";
import { getSocketUrl } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { useWalletStore } from "@/store/useWalletStore";

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state: ReturnType<typeof useAuthStore.getState>) => state.token);
  const user = useAuthStore((state: ReturnType<typeof useAuthStore.getState>) => state.user);
  const isAuthenticated = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.isAuthenticated
  );
  const mergeRealtimeDelivery = useDeliveryStore(
    (state: ReturnType<typeof useDeliveryStore.getState>) => state.mergeRealtimeDelivery
  );
  const fetchWalletOverview = useWalletStore(
    (state: ReturnType<typeof useWalletStore.getState>) => state.fetchWalletOverview
  );

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(getSocketUrl(), {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", `rider_${user.id}`);
    });

    socket.on("delivery:assigned", (payload: any) => {
      mergeRealtimeDelivery(payload);
      Alert.alert("New delivery assigned", `${payload.restaurant?.name ?? "A restaurant"} has a new order for you.`);
    });
    socket.on("delivery:accepted", mergeRealtimeDelivery);
    socket.on("delivery:status_update", mergeRealtimeDelivery);
    socket.on("delivery:location_update", () => undefined);
    socket.on("delivery:payout_updated", () => {
      void fetchWalletOverview();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchWalletOverview, isAuthenticated, mergeRealtimeDelivery, token, user?.id]);

  return children;
}
