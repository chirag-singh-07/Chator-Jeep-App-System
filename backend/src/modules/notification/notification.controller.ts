import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { getNotificationStatus } from "./notification.service";

export const info = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json(getNotificationStatus());
});
