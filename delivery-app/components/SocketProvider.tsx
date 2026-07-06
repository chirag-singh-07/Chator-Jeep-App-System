import { PropsWithChildren, useEffect, useRef } from "react";
import { Alert, Vibration } from "react-native";
import { io, Socket } from "socket.io-client";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
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
  const notificationPlayer = useAudioPlayer(require("../assets/audios/order-incoming-sound.wav"));

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

    const setActiveRequest = useDeliveryStore.getState().setActiveRequest;

    const playNotificationSound = () => {
      try {
        notificationPlayer.play();
      } catch (error) {
        console.log("Error playing sound:", error);
      }
    };

    const triggerAlert = () => {
      void playNotificationSound();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate([0, 500, 200, 500]); // Pattern: wait 0, vibrate 500, wait 200, vibrate 500
    };

    socket.on("delivery:request", (payload: any) => {
      triggerAlert();
      setActiveRequest(payload);
    });

    socket.on("delivery:assigned", (payload: any) => {
      mergeRealtimeDelivery(payload);
      Alert.alert("Order assigned", "You have been assigned to an order.");
    });
    
    socket.on("delivery:accepted", (payload: any) => {
      mergeRealtimeDelivery(payload);
      setActiveRequest(null); // Clear the request modal if open
    });
    socket.on("delivery:status_update", mergeRealtimeDelivery);
    socket.on("delivery:location_update", () => undefined);
    socket.on("delivery:payout_updated", () => {
      void fetchWalletOverview();
    });

    socket.on("notification", (data: any) => {
      console.log("Real-time notification:", data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchWalletOverview, isAuthenticated, mergeRealtimeDelivery, notificationPlayer, token, user?.id]);

  return children;
}
