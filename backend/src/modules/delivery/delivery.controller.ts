import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./delivery.service";

export const assignOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.assignNearestRiderToOrder(req.params.orderId as string);
  res.status(200).json(delivery);
});

export const myAssignedOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deliveries = await service.listAssignedOrders(req.user!.userId);
  res.status(200).json(deliveries);
});

export const getAssignedOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.getAssignedOrderDetail(req.user!.userId, req.params.orderId as string);
  res.status(200).json(delivery);
});

export const acceptOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.acceptAssignedOrder(req.user!.userId, req.params.orderId as string);
  res.status(200).json(delivery);
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.updateDeliveryStatus(req.user!.userId, req.params.orderId as string, req.body.status);
  res.status(200).json(delivery);
});

export const dashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await service.getRiderDashboard(req.user!.userId);
  res.status(200).json(data);
});

export const updateAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await service.updateAvailability(req.user!.userId, req.body);
  res.status(200).json(data);
});

export const updateLocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.updateMyLocation(req.user!.userId, req.body.coordinates);
  res.status(200).json(delivery);
});
