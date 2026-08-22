import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./user.service";
import { ROLES } from "../../common/constants";

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await service.getMyProfile(req.user!.userId);
  res.status(200).json({ success: true, data: user });
});

export const addAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const address = await service.addAddress(req.user!.userId, req.body);
  res.status(201).json({ success: true, message: "Address added", data: address });
});

export const getAddresses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const addresses = await service.getAddresses(req.user!.userId);
  res.status(200).json({ success: true, data: addresses });
});

export const deleteAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const addresses = await service.deleteAddress(req.user!.userId, req.params.addressId as string);
  res.status(200).json({ success: true, message: "Address deleted", data: addresses });
});

// ─── Admin Controllers ───────────────────────────────────────────────────────

export const adminListUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.adminListUsers(req.query as any);
  res.status(200).json({ success: true, ...result });
});

export const adminGetUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await service.adminGetUser(String(req.params.id));
  res.status(200).json({ success: true, data: user });
});

export const adminDeleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.adminDeleteUser(String(req.params.id));
  res.status(200).json({ success: true, ...result });
});

export const adminApproveUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.adminApproveUser(req.params.id as string);
  res.status(200).json({ success: true, ...result });
});

export const adminCreateAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await service.adminCreateUser(req.body, ROLES.ADMIN);
  res.status(201).json({ success: true, message: "Admin user created successfully", data: user });
});

export const adminCreateDelivery = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await service.adminCreateUser(req.body, ROLES.DELIVERY);
  res.status(201).json({ success: true, message: "Delivery user created successfully", data: user });
});
