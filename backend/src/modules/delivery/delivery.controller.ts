import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./delivery.service";

export const assignOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Trigger rider search for an order (Admin/system action)
  await service.notifyRidersForOrder(req.params.orderId as string);
  res.status(200).json({ success: true, message: "Rider assignment initiated" });
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
  const delivery = await service.acceptOrderRequest(req.user!.userId, req.params.orderId as string);
  res.status(200).json(delivery);
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const delivery = await service.updateDeliveryStatus(req.user!.userId, req.params.orderId as string, req.body.status, req.body.otp);
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

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const partner = await service.registerDeliveryPartner(req.user!.userId, req.body);
  res.status(201).json(partner);
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await service.getDeliveryPartnerProfile(req.user!.userId);
  res.status(200).json(profile);
});

// Admin Controllers
export const adminUpdatePartnerStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const partner = await service.updatePartnerStatus(req.params.partnerId as string, req.body.status, req.body.remarks);
  res.status(200).json(partner);
});

export const adminListAllPartners = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const partners = await service.listAllPartners();
  res.status(200).json(partners);
});
