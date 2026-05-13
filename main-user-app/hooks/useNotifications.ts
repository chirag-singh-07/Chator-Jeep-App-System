import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import api from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { Alert, Vibration } from "react-native";
import { router } from "expo-router";

const openOrderFromNotification = (data?: { [key: string]: any }) => {
  const orderId = data?.orderId;
  if (orderId) {
    router.push(`/order-tracking/${orderId}` as any);
  }
};

messaging().setBackgroundMessageHandler(async () => undefined);

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
        await api.patch("/notifications/fcm-token", { fcmToken: token }, {
          headers: { 'x-silent': 'true' }
        });
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

      // Handle background notification clicks
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log("Notification caused app to open from background state:", remoteMessage.data);
        openOrderFromNotification(remoteMessage.data);
      });

      // Handle terminated state notification clicks
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log("Notification caused app to open from quit state:", remoteMessage.data);
            openOrderFromNotification(remoteMessage.data);
          }
        });

      return unsubscribe;
    }
  }, [user?.id]);
};
