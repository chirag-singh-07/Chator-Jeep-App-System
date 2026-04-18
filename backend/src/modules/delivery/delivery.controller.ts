import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./delivery.service";

export const assignOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.assignNearestRiderToOrder(req.params.orderId);
  res.status(200).json(delivery);
});

export const myAssignedOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deliveries = await service.listAssignedOrders(req.user!.userId);
  res.status(200).json(deliveries);
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.updateDeliveryStatus(req.user!.userId, req.params.orderId, req.body.status);
  res.status(200).json(delivery);
});

export const updateLocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.updateMyLocation(req.user!.userId, req.body.coordinates);
  res.status(200).json(delivery);
});
