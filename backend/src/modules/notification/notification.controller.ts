import { Response } from "express";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import { User } from "../user/user.model";
import { Restaurant } from "../restaurant/restaurant.model";
import { DeliveryPartner } from "../delivery/delivery.model";
import { Notification } from "./notification.model";
import { NotificationService } from "./notification.service";
import { ROLES } from "../../common/constants";

export const updateFcmToken = async (req: AuthenticatedRequest, res: Response) => {
  const { fcmToken } = req.body;
  const { userId, role } = req.user!;

  if (!fcmToken) {
    return res.status(400).json({ success: false, message: "fcmToken is required" });
  }

  console.log(`[Notification] Updating FCM token for user ${userId} with role ${role}`);

  try {
    let Model: any;
    let query: any = { _id: userId };

    if (role === ROLES.USER || role === ROLES.ADMIN) {
      Model = User;
    } else if (role === ROLES.KITCHEN) {
      Model = Restaurant;
      query = { ownerId: userId };
    } else if (role === ROLES.DELIVERY) {
      Model = DeliveryPartner;
      query = { userId: userId };
    }

    if (!Model) {
      console.warn(`[Notification] No model found for role ${role}`);
      return res.status(400).json({ success: false, message: `Invalid role for FCM update: ${role}` });
    }

    const updated = await Model.findOneAndUpdate(query, {
      $addToSet: { fcmTokens: fcmToken }
    }, { new: true });

    if (!updated) {
      console.warn(`[Notification] Document not found for query:`, query);
      // If delivery partner doesn't exist, it might be the cause
      return res.status(404).json({ success: false, message: "Associated profile not found" });
    }

    console.log(`[Notification] FCM token updated successfully for ${userId}`);
    res.json({ success: true, message: "FCM token updated successfully" });
  } catch (error: any) {
    console.error(`[Notification] Error updating FCM token:`, error.message);
    res.status(500).json({ success: false, message: "Failed to update FCM token", error: error.message });
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.user!;
  const { page = 1, limit = 20 } = req.query;

  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Notification.countDocuments({ userId });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user!;

  try {
    await Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true });
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

export const broadcastNotification = async (req: AuthenticatedRequest, res: Response) => {
  const { title, body, targetUserType, image } = req.body;

  try {
    const audienceMap: Record<string, any> = {
      "ALL": "ALL",
      "USER": "CUSTOMERS",
      "KITCHEN": "RESTAURANTS",
      "DELIVERY": "PARTNERS"
    };

    const audience = audienceMap[targetUserType] || "ALL";

    // ⚡ Trigger Broadcast
    await NotificationService.broadcast(audience, { title, body, image });

    // ⚡ Log the broadcast (as a system-level notification history item)
    await Notification.create({
      userId: req.user!.userId, // Logged by admin
      userType: "CUSTOMER", // Simplified for log
      title: `[BROADCAST to ${audience}] ${title}`,
      body,
      type: "PROMOTIONAL",
      data: { audience, targetUserType }
    });

    res.json({ success: true, message: "Broadcast signal dispatched successfully" });
  } catch (error) {
    console.error("Broadcast failed:", error);
    res.status(500).json({ success: false, message: "Failed to dispatch broadcast" });
  }
};

export const getBroadcastHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await Notification.find({ type: "PROMOTIONAL" })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};
