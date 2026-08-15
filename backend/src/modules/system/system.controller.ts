import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import { getLogs } from "../../common/utils/logger";
import * as service from "./system.service";

export const getSettings = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const config = await service.getPlatformConfig();
    res.status(200).json({ success: true, data: config });
  }
);

export const getOverviewStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const range = (req.query.range as string) || "1m";
    const stats = await service.getOverviewStats(range);
    res.status(200).json({ success: true, data: stats });
  }
);

export const updateSetting = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { key, value, description } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: "Key and Value are required" });
    }
    const setting = await service.updateSetting(key, value, description);
    res.status(200).json({ success: true, data: setting });
  }
);


export const getSystemLogs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const type = (req.query.type as "system" | "cron") || "system";
    const lines = parseInt((req.query.lines as string) || "100");

    const logs = getLogs(type, lines);

    // Parse logs for frontend to consume easily
    // Expected format: [TIMESTAMP] [LEVEL] Message
    const parsedLogs = logs.reverse().map((line, index) => {
      const match = line.match(/^\[(.*?)\]\s\[(.*?)\]\s(.*)$/);
      if (match) {
        return {
          id: `${Date.now()}-${index}`,
          timestamp: match[1],
          level: match[2],
          message: match[3],
        };
      }
      return {
        id: `${Date.now()}-${index}`,
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: line,
      };
    });

    res.status(200).json({ success: true, data: parsedLogs });
  }
);

export const getPaymentStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await service.getPaymentStats();
    res.status(200).json({ success: true, data: stats });
  }
);

export const getSalesAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await service.getSalesAnalytics(req.query as any);
    res.status(200).json({ success: true, data: stats });
  }
);

export const getRevenueAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await service.getRevenueAnalytics(req.query as any);
    res.status(200).json({ success: true, data: stats });
  }
);

export const getTopItems = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await service.getTopItems(parseInt(req.query.limit as string) || 10);
    res.status(200).json({ success: true, data: stats });
  }
);

export const triggerUserPush = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { sendPeriodicUserPushNotifications } = await import("../../jobs/user-push-cron.js");
    await sendPeriodicUserPushNotifications();
    res.status(200).json({ success: true, message: "Periodic user push notification triggered successfully" });
  }
);

