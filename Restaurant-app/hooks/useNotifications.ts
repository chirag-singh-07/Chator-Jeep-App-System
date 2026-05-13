import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { apiClient } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { Alert, Vibration } from "react-native";
import { router } from "expo-router";

const openOrderFromNotification = (data?: { [key: string]: any }) => {
  const orderId = data?.orderId;
  if (orderId) {
    router.push(`/order/${orderId}` as any);
  }
};

messaging().setBackgroundMessageHandler(async () => undefined);

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  };

  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        await apiClient.patch("/notifications/fcm-token", { fcmToken: token });
      }
    } catch (error) {
      console.log("Error getting FCM token:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.restaurantId) {
      requestUserPermission().then((granted) => {
        if (granted) {
          getFcmToken();
        }
      });

      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        Vibration.vibrate([0, 400, 150, 400]);
        Alert.alert(
          remoteMessage.notification?.title || "Chatori Jeeb Restaurant",
          remoteMessage.notification?.body || "",
          [
            { text: "Later", style: "cancel" },
            { text: "Open Order", onPress: () => openOrderFromNotification(remoteMessage.data) },
          ],
        );
      });

      messaging().onNotificationOpenedApp((remoteMessage) => {
        openOrderFromNotification(remoteMessage.data);
      });

      messaging().getInitialNotification().then((remoteMessage) => {
        if (remoteMessage) openOrderFromNotification(remoteMessage.data);
      });

      return unsubscribe;
    }
  }, [isAuthenticated, user?.restaurantId]);
};
