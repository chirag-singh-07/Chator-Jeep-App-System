import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./order.service";

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await service.createOrder(req.user!.userId, req.body);
  res.status(201).json(order);
});

export const listMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await service.listMyOrders(req.user!.userId);
  res.status(200).json(orders);
});

export const listKitchenOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await service.listKitchenOrders(req.user!.userId);
  res.status(200).json(orders);
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await service.updateOrderStatus(req.user!, req.params.orderId as string, req.body.status);

  res.status(200).json(order);
});
