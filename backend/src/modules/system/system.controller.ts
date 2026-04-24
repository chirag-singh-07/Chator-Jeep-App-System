import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import { getLogs } from "../../common/utils/logger";

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
