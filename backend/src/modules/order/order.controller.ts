import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./order.service";
import { getUserWalletBalance, getUserWalletTransactions } from "../wallet/user-wallet.service";

// ─── Order CRUD ───────────────────────────────────────────────────────────────

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await service.createOrder(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: order });
});

export const listMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await service.listMyOrders(req.user!.userId);
  res.status(200).json({ success: true, data: orders });
});

export const getOrderDetail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await service.getOrderDetail(req.user!.userId, req.params.orderId as string);
  res.status(200).json({ success: true, data: order });
});

export const listRestaurantOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await service.listRestaurantOrders(req.user!.userId);
  res.status(200).json({ success: true, data: orders });
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await service.updateOrderStatus(req.user!, req.params.orderId as string, req.body.status);
  res.status(200).json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.cancelOrder(req.user!.userId, req.params.orderId as string, req.body.reason);
  res.status(200).json({ success: true, data: result });
});

// ─── Payment ──────────────────────────────────────────────────────────────────

export const initiatePayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.initiateRazorpayPayment(req.user!.userId, req.params.orderId as string);
  res.status(200).json({ success: true, data: result });
});

export const verifyPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.verifyAndConfirmPayment(req.user!.userId, {
    orderId: req.params.orderId,
    ...req.body,
  });
  res.status(200).json({ success: true, data: result });
});

// ─── User Wallet ──────────────────────────────────────────────────────────────

export const getWalletBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await getUserWalletBalance(req.user!.userId);
  res.status(200).json({ success: true, data });
});

export const getWalletTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await getUserWalletTransactions(req.user!.userId);
  res.status(200).json({ success: true, data });
});
