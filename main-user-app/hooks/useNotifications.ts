import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import api from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { Alert, Vibration } from "react-native";
import { router } from "expo-router";

import { Platform } from "react-native";

const openOrderFromNotification = (data?: { [key: string]: any }) => {
  const orderId = data?.orderId;
  if (orderId) {
    router.push(`/order-tracking/${orderId}` as any);
  }
};

if (Platform.OS !== "web") {
  try {
    messaging().setBackgroundMessageHandler(async () => undefined);
  } catch (e) {
    console.warn("Error setting background message handler:", e);
  }
}

export const useNotifications = () => {
  const { user } = useAuthStore();

  const requestUserPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Failed to request notification permission:", e);
      return false;
    }
  };

  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log("FCM Token:", token);
        await api.patch("/notifications/fcm-token", { fcmToken: token }, {
          headers: { 'x-silent': 'true' }
        });
      }
    } catch (error) {
      console.log("Error getting FCM token:", error);
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") return;
    
    if (user?.id) {
      requestUserPermission()
        .then((granted) => {
          if (granted) {
            getFcmToken().catch((e) => console.warn("FCM Token fetch error:", e));
          }
        })
        .catch((e) => console.warn("Permission error:", e));

      // Handle foreground messages
      let unsubscribe: (() => void) | undefined;
      try {
        unsubscribe = messaging().onMessage(async (remoteMessage) => {
          Vibration.vibrate([0, 300, 120, 300]);
          Alert.alert(
            remoteMessage.notification?.title || "Chatori Jeeb Update",
            remoteMessage.notification?.body || "",
            [
              { text: "Later", style: "cancel" },
              { text: "Open", onPress: () => openOrderFromNotification(remoteMessage.data) },
            ],
          );
        });
      } catch (e) {
        console.warn("Failed to attach foreground message listener:", e);
      }

      // Handle background notification clicks
      try {
        messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log("Notification caused app to open from background state:", remoteMessage.data);
          openOrderFromNotification(remoteMessage.data);
        });
      } catch (e) {
        console.warn("Failed to attach notification opened listener:", e);
      }

      // Handle terminated state notification clicks
      try {
        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            if (remoteMessage) {
              console.log("Notification caused app to open from quit state:", remoteMessage.data);
              openOrderFromNotification(remoteMessage.data);
            }
          })
          .catch((e) => console.warn("Error checking initial notification:", e));
      } catch (e) {
        console.warn("Failed to get initial notification:", e);
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user?.id]);
};
