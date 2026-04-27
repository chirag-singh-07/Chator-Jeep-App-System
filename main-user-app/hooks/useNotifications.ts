import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import api from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { Alert, Platform } from "react-native";

export const useNotifications = () => {
  const { user } = useAuthStore();

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
      return true;
    }
    return false;
  };

  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log("FCM Token:", token);
        await api.patch("/notifications/fcm-token", { fcmToken: token });
      }
    } catch (error) {
      console.log("Error getting FCM token:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      requestUserPermission().then((granted) => {
        if (granted) {
          getFcmToken();
        }
      });

      // Handle foreground messages
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        Alert.alert(
          remoteMessage.notification?.title || "New Update",
          remoteMessage.notification?.body || ""
        );
      });

      // Handle background notification clicks
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log("Notification caused app to open from background state:", remoteMessage.data);
        if (remoteMessage.data?.orderId) {
          import("expo-router").then(({ router }) => {
            router.push(`/order-tracking/${remoteMessage.data?.orderId}`);
          });
        }
      });

      // Handle terminated state notification clicks
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log("Notification caused app to open from quit state:", remoteMessage.data);
            if (remoteMessage.data?.orderId) {
              import("expo-router").then(({ router }) => {
                router.push(`/order-tracking/${remoteMessage.data?.orderId}`);
              });
            }
          }
        });

      return unsubscribe;
    }
  }, [user?.id]);
};
