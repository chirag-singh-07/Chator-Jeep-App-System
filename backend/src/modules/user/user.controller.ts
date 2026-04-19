import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./user.service";
import { Role } from "../../common/constants";

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await service.getMyProfile(req.user!.userId);
  res.status(200).json({ success: true, data: user });
});

// ─── Admin Controllers ───────────────────────────────────────────────────────

export const adminListUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.adminListUsers(req.query as any);
  res.status(200).json({ success: true, ...result });
});

export const adminGetUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await service.adminGetUser(req.params.id);
  res.status(200).json({ success: true, data: user });
});
