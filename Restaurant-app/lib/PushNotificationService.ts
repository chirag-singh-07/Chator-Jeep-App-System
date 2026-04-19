import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import Constants from "expo-constants";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// ✅ Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const setupNotificationChannels = async () => {
  if (isExpoGo) return; // ✅ Skip in Expo Go

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("new-orders", {
      name: "Incoming Orders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 1000, 1000],
      lightColor: "#FF231F7C",
      enableVibrate: true,
      sound: "order_incoming_sound.wav",
      bypassDnd: true,
    });
  }
};

export const registerForPushNotificationsAsync = async () => {
  if (isExpoGo) {
    console.log(
      "⚠️ Push notifications not supported in Expo Go. Use a dev build.",
    );
    return null; // ✅ Bail early
  }

  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
        allowCriticalAlerts: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token!");
    return null;
  }

  try {
    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("FCM/Device Push Token:", token);
  } catch (e) {
    console.warn("Could not fetch push token:", e);
  }

  return token;
};

// ✅ Only define background task if NOT in Expo Go
if (!isExpoGo) {
  TaskManager.defineTask(
    BACKGROUND_NOTIFICATION_TASK,
    async ({ data, error }) => {
      if (error) {
        console.error("Background task error", error);
        return;
      }

      if (data) {
        const { notification } = data as any;

        if (notification?.request?.content?.data?.orderId) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🚨 NEW ORDER ALERT 🚨",
              body: `Order #${notification.request.content.data.orderId.slice(-6).toUpperCase()} received!`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.MAX,
              data: notification.request.content.data,
            },
            trigger: null,
          });
        }
      }
    },
  );
}

export const registerBackgroundTasks = () => {
  if (isExpoGo) return; // ✅ Skip in Expo Go

  try {
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  } catch (e) {
    console.warn("Background notification registration failed", e);
  }
};
