import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import * as ctrl from "./notification.controller";

const router = Router();

/** PATCH /api/v1/notifications/fcm-token - Update FCM token for current user */
router.patch("/fcm-token", authMiddleware, ctrl.updateFcmToken);

/** GET /api/v1/notifications - Get notification history */
router.get("/", authMiddleware, ctrl.getNotifications);

/** PATCH /api/v1/notifications/:id/read - Mark notification as read */
router.patch("/:id/read", authMiddleware, ctrl.markAsRead);

/** POST /api/v1/notifications/broadcast - Send broadcast (Admin only) */
router.post("/broadcast", authMiddleware, ctrl.broadcastNotification);

/** GET /api/v1/notifications/broadcast/history - Get broadcast history */
router.get("/broadcast/history", authMiddleware, ctrl.getBroadcastHistory);

export default router;
