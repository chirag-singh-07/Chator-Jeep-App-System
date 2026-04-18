import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./kitchen.service";

export const createKitchen = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kitchen = await service.createKitchenProfile(req.user!.userId, req.body);
  res.status(201).json(kitchen);
});

export const updateKitchen = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kitchen = await service.updateKitchenProfile(req.user!.userId, req.body);
  res.status(200).json(kitchen);
});

export const listKitchens = asyncHandler(async (req: Request, res: Response) => {
  const kitchens = await service.listKitchens(req.query as Record<string, string>);
  res.status(200).json(kitchens);
});

export const listMenu = asyncHandler(async (req: Request, res: Response) => {
  const items = await service.listKitchenMenu(req.params.kitchenId);
  res.status(200).json(items);
});

export const addMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await service.addMenuItem(req.user!.userId, req.body);
  res.status(201).json(item);
});

export const updateMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await service.updateMenuItem(req.user!.userId, req.params.menuItemId, req.body);
  res.status(200).json(item);
});
