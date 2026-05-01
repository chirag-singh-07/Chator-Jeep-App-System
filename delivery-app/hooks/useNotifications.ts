import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import { apiClient } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log("FCM Token acquired:", fcmToken.substring(0, 10) + "...");
        const authToken = await AsyncStorage.getItem("delivery-token");
        if (!authToken) {
          console.log("Waiting for auth token before registering FCM...");
          return;
        }
        await apiClient.patch("/notifications/fcm-token", { fcmToken });
        console.log("FCM Token registered successfully");
      }
    } catch (error: any) {
      console.log(
        "Error registering FCM token:",
        error?.response?.data?.message || error.message,
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      requestUserPermission().then((granted) => {
        if (granted) {
          getFcmToken();
        }
      });

      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        Alert.alert(
          remoteMessage.notification?.title || "Delivery Update",
          remoteMessage.notification?.body || "",
        );
      });

      return unsubscribe;
    }
  }, [isAuthenticated, user?.id]);
};
