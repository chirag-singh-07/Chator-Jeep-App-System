import { NextFunction, Request, Response } from "express";
import * as service from "./notification.service";
import { asyncHandler } from "../../common/utils/async-handler";

export const broadcast = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const notification = await service.broadcastNotification(req.body);
  res.status(201).json({
    success: true,
    data: notification,
  });
});

export const getBroadcastHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const history = await service.getAdminNotifications();
  res.status(200).json({
    success: true,
    data: history,
  });
});

export const info = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, message: "Notification service online" });
});
