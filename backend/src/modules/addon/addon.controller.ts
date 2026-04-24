import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./addon.service";

export const createAddon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await service.createAddonGroup(req.user!.userId, req.body);
  res.status(201).json({ success: true, data });
});

export const getMyAddons = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await service.listRestaurantAddons(req.user!.userId);
  res.status(200).json({ success: true, data });
});

export const updateAddon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await service.updateAddonGroup(req.user!.userId, req.params.id as string, req.body);
  res.status(200).json({ success: true, data });
});

export const deleteAddon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await service.removeAddonGroup(req.user!.userId, req.params.id as string);
  res.status(200).json({ success: true, message: "Addon group removed" });
});

export const adminGetAllAddons = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await service.listAllAddonGroups();
  res.status(200).json({ success: true, data });
});
