import { useEffect } from "react";
import { Platform, Alert, Vibration } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { apiClient } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

let messaging: any = null;
if (Platform.OS !== 'web') {
  messaging = require("@react-native-firebase/messaging").default;
  messaging().setBackgroundMessageHandler(async () => undefined);
}

const openOrderFromNotification = (data?: { [key: string]: any }) => {
  const orderId = data?.orderId;
  if (orderId) {
    router.push(`/order/${orderId}` as any);
  }
};

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();

  const requestUserPermission = async () => {
    if (!messaging) return false;
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  };

  const getFcmToken = async () => {
    if (!messaging) return;
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
    if (isAuthenticated && user?.id && messaging) {
      requestUserPermission().then((granted) => {
        if (granted) {
          getFcmToken();
        }
      });

      const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
        Vibration.vibrate([0, 300, 120, 300]);
        Alert.alert(
          remoteMessage.notification?.title || "Chatori Jeeb Delivery",
          remoteMessage.notification?.body || "",
          [
            { text: "Later", style: "cancel" },
            { text: "Open Order", onPress: () => openOrderFromNotification(remoteMessage.data) },
          ],
        );
      });

      messaging().onNotificationOpenedApp((remoteMessage: any) => {
        openOrderFromNotification(remoteMessage.data);
      });

      messaging().getInitialNotification().then((remoteMessage: any) => {
        if (remoteMessage) openOrderFromNotification(remoteMessage.data);
      });

      return unsubscribe;
    }
  }, [isAuthenticated, user?.id]);
};
