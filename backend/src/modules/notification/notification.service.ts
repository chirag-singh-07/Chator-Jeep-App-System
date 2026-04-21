import { Notification, INotification } from "./notification.model";

export const broadcastNotification = async (data: { title: string; body: string; targetUserType: string }) => {
  // 1. Save to DB
  const notification = await Notification.create({
    title: data.title,
    body: data.body,
    type: "BROADCAST",
    targetUserType: data.targetUserType,
  });

  // 2. Here we would normally trigger FCM push notifications
  // SendPushToTopic(data.targetUserType, data.title, data.body)
  console.log(`[PUSH MOCK] Sending to ${data.targetUserType}: ${data.title}`);

  return notification;
};

export const getAdminNotifications = async () => {
  return await Notification.find({ type: "BROADCAST" }).sort({ createdAt: -1 });
};
