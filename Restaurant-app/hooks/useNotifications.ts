import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { apiClient } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { Alert } from "react-native";

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
        Alert.alert(
          remoteMessage.notification?.title || "Restaurant Update",
          remoteMessage.notification?.body || ""
        );
      });

      return unsubscribe;
    }
  }, [isAuthenticated, user?.restaurantId]);
};
