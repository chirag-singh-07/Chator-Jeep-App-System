import React, { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderStore } from "../store/useOrderStore";
import { Platform } from "react-native";

const SOCKET_URL = Platform.select({
  ios: "http://localhost:5000",
  android: "http://10.0.2.2:5000",
  default: "http://localhost:5000",
});

// Update with actual network IP for testing over WiFi
const ACTIVE_SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.6:5000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, user, isAuthenticated } = useAuthStore();
  const setIncomingOrder = useOrderStore((state) => state.setIncomingOrder);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token && user?.restaurantId) {
      socketRef.current = io(ACTIVE_SOCKET_URL, {
        auth: { token },
        query: { type: "restaurant", restaurantId: user.restaurantId },
      });

      socketRef.current.on("connect", () => {
        console.log("Restaurant socket connected");
      });

      socketRef.current.on("new_order", (data) => {
        // Trigger alert
        setIncomingOrder(data.order);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isAuthenticated, token, user?.restaurantId]);

  return <>{children}</>;
};
