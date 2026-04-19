import { AppError } from "../../common/errors/app-error";
import { hashPassword, comparePassword } from "../../common/utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken, AuthPayload } from "../../common/utils/jwt";
import { createUser, findUserByEmail, findUserById, updateRefreshToken } from "../auth/auth.repository";
import { ROLES } from "../../common/constants";
import {
  createKitchen,
  findKitchenByOwner,
  findKitchenById,
  listKitchensByStatus,
  getKitchenStatusCounts,
  approveKitchen,
  rejectKitchen,
  markKitchenForReview,
  updateKitchenById,
} from "./kitchen.repository";
import { KITCHEN_STATUS, KitchenStatus } from "./kitchen.model";

// ─── Register Kitchen (multi-step onboarding) ─────────────────────────────────
export const registerKitchen = async (input: {
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  kitchenName: string;
  fssaiLicense?: string;
  address?: { line1: string; city: string; state: string; pinCode: string };
  cuisines?: string[];
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  logoUrls?: Record<string, string>;
  bannerUrls?: Record<string, string>;
  documents?: Array<{ label: string; key: string; url: string }>;
}) => {
  const email = input.email.trim().toLowerCase();

  const existing = await findUserByEmail(email);
  if (existing) throw new AppError("Email already registered", 409);

  // 1. Create auth user with KITCHEN role
  const hashed = await hashPassword(input.password);
  const user = await createUser({
    name: input.ownerName,
    email,
    password: hashed,
    phone: input.phone,
    role: ROLES.KITCHEN,
  });

  // 2. Create kitchen profile — starts as PENDING_VERIFICATION
  const kitchen = await createKitchen({
    ownerId: user._id as any,
    ownerName: input.ownerName,
    name: input.kitchenName,
    email,
    phone: input.phone,
    fssaiLicense: input.fssaiLicense,
    address: input.address,
    cuisines: input.cuisines ?? [],
    bankDetails: input.bankDetails,
    logoUrls: input.logoUrls,
    bannerUrls: input.bannerUrls,
    documents: input.documents ?? [],
    status: KITCHEN_STATUS.PENDING_VERIFICATION,
  });

  // 3. Issue tokens
  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await updateRefreshToken(user._id.toString(), refreshToken);

  return {
    accessToken,
    refreshToken,
    kitchenId: kitchen._id.toString(),
    status: kitchen.status,
  };
};

// ─── Kitchen Login ─────────────────────────────────────────────────────────────
export const loginKitchen = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.role !== ROLES.KITCHEN) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new AppError("Invalid credentials", 401);

  // Fetch kitchen to return status for gating UI
  const kitchen = await findKitchenByOwner(user._id.toString());

  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await updateRefreshToken(user._id.toString(), refreshToken);

  return {
    accessToken,
    refreshToken,
    kitchenStatus: kitchen?.status ?? KITCHEN_STATUS.PENDING_VERIFICATION,
    kitchenId: kitchen?._id?.toString() ?? null,
  };
};

// ─── Kitchen Status (for app gating) ─────────────────────────────────────────
export const getMyKitchenStatus = async (userId: string) => {
  const kitchen = await findKitchenByOwner(userId);
  if (!kitchen) throw new AppError("Kitchen profile not found", 404);
  return {
    status: kitchen.status,
    rejectionReason: kitchen.rejectionReason,
    name: kitchen.name,
    kitchenId: kitchen._id.toString(),
  };
};

// ─── Admin: List All Kitchens ─────────────────────────────────────────────────
export const adminListKitchens = async (query: {
  status?: string;
  page?: string;
  limit?: string;
  search?: string;
}) => {
  const status = query.status as KitchenStatus | undefined;
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  const { kitchens, total } = await listKitchensByStatus(status, page, limit, query.search);
  const counts = await getKitchenStatusCounts();

  return {
    kitchens,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    counts,
  };
};

// ─── Admin: Get Single Kitchen ─────────────────────────────────────────────────
export const adminGetKitchen = async (id: string) => {
  const kitchen = await findKitchenById(id);
  if (!kitchen) throw new AppError("Kitchen not found", 404);
  return kitchen;
};

// ─── Admin: Approve ───────────────────────────────────────────────────────────
export const adminApproveKitchen = async (kitchenId: string, adminUserId: string) => {
  const kitchen = await approveKitchen(kitchenId, adminUserId);
  if (!kitchen) throw new AppError("Kitchen not found", 404);
  return kitchen;
};

// ─── Admin: Reject ────────────────────────────────────────────────────────────
export const adminRejectKitchen = async (
  kitchenId: string,
  adminUserId: string,
  reason: string
) => {
  if (!reason?.trim()) throw new AppError("Rejection reason is required", 400);
  const kitchen = await rejectKitchen(kitchenId, adminUserId, reason.trim());
  if (!kitchen) throw new AppError("Kitchen not found", 404);
  return kitchen;
};

// ─── Admin: Mark For Review ───────────────────────────────────────────────────
export const adminMarkForReview = async (
  kitchenId: string,
  adminUserId: string,
  reason: string
) => {
  const kitchen = await markKitchenForReview(kitchenId, adminUserId, reason ?? "");
  if (!kitchen) throw new AppError("Kitchen not found", 404);
  return kitchen;
};

// ─── Existing Services (kept for backward compat) ────────────────────────────
export const createKitchenProfile = async (userId: string, body: any) => {
  const existing = await findKitchenByOwner(userId);
  if (existing) throw new AppError("Kitchen already exists for this user", 409);
  return createKitchen({ ownerId: userId as any, ...body });
};

export const updateKitchenProfile = async (userId: string, body: any) => {
  const kitchen = await findKitchenByOwner(userId);
  if (!kitchen) throw new AppError("Kitchen not found", 404);
  return updateKitchenById(kitchen._id.toString(), body);
};

export const listKitchens = async (query: Record<string, string>) => {
  const { status, page, limit, search } = query;
  return adminListKitchens({ status, page, limit, search });
};

export const listKitchenMenu = async (kitchenId: string) => {
  const { MenuItem } = await import("./kitchen.model");
  return MenuItem.find({ kitchenId, isAvailable: true }).exec();
};

export const addMenuItem = async (userId: string, body: any) => {
  const kitchen = await findKitchenByOwner(userId);
  if (!kitchen) throw new AppError("Kitchen not found", 404);
  if (kitchen.status !== KITCHEN_STATUS.VERIFIED) {
    throw new AppError("Kitchen must be verified before adding menu items", 403);
  }
  const { MenuItem } = await import("./kitchen.model");
  return MenuItem.create({ kitchenId: kitchen._id, ...body });
};

export const updateMenuItem = async (userId: string, menuItemId: string, body: any) => {
  const kitchen = await findKitchenByOwner(userId);
  if (!kitchen) throw new AppError("Kitchen not found", 404);
  const { MenuItem } = await import("./kitchen.model");
  return MenuItem.findOneAndUpdate(
    { _id: menuItemId, kitchenId: kitchen._id },
    { $set: body },
    { new: true }
  ).exec();
};
