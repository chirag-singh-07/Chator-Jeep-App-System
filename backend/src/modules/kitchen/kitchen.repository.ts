import { Kitchen, IKitchen, KitchenStatus } from "./kitchen.model";
import { Types } from "mongoose";

// ─── Creation ──────────────────────────────────────────────────────────────────
export const createKitchen = (payload: Partial<IKitchen>): Promise<IKitchen> =>
  Kitchen.create(payload);

// ─── Lookups ───────────────────────────────────────────────────────────────────
export const findKitchenByOwner = (ownerId: string): Promise<IKitchen | null> =>
  Kitchen.findOne({ ownerId: new Types.ObjectId(ownerId) }).exec();

export const findKitchenById = (id: string): Promise<IKitchen | null> =>
  Kitchen.findById(id).exec();

// ─── Admin Listing (paginated + filtered) ─────────────────────────────────────
export const listKitchensByStatus = async (
  status?: KitchenStatus,
  page = 1,
  limit = 20,
  search?: string
): Promise<{ kitchens: IKitchen[]; total: number }> => {
  const filter: Record<string, unknown> = {};
  if (status) filter["status"] = status;
  if (search) {
    filter["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [kitchens, total] = await Promise.all([
    Kitchen.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Kitchen.countDocuments(filter).exec(),
  ]);

  return { kitchens, total };
};

// ─── Status Counts (for admin dashboard stat cards) ───────────────────────────
export const getKitchenStatusCounts = async (): Promise<Record<string, number>> => {
  const counts = await Kitchen.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const result: Record<string, number> = {
    PENDING_VERIFICATION: 0,
    UNDER_REVIEW: 0,
    VERIFIED: 0,
    REJECTED: 0,
  };
  counts.forEach((c) => {
    result[c._id] = c.count;
  });
  return result;
};

// ─── Profile Updates ──────────────────────────────────────────────────────────
export const updateKitchenById = (
  id: string,
  update: Partial<IKitchen>
): Promise<IKitchen | null> =>
  Kitchen.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();

// ─── Admin Actions ────────────────────────────────────────────────────────────
export const approveKitchen = (id: string, adminId: string): Promise<IKitchen | null> =>
  Kitchen.findByIdAndUpdate(
    id,
    {
      $set: { status: "VERIFIED", rejectionReason: null, isOpen: false },
      $push: {
        adminActions: {
          adminId: new Types.ObjectId(adminId),
          action: "APPROVED",
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  ).exec();

export const rejectKitchen = (
  id: string,
  adminId: string,
  reason: string
): Promise<IKitchen | null> =>
  Kitchen.findByIdAndUpdate(
    id,
    {
      $set: { status: "REJECTED", rejectionReason: reason },
      $push: {
        adminActions: {
          adminId: new Types.ObjectId(adminId),
          action: "REJECTED",
          reason,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  ).exec();

export const markKitchenForReview = (
  id: string,
  adminId: string,
  reason: string
): Promise<IKitchen | null> =>
  Kitchen.findByIdAndUpdate(
    id,
    {
      $set: { status: "UNDER_REVIEW" },
      $push: {
        adminActions: {
          adminId: new Types.ObjectId(adminId),
          action: "MARKED_FOR_REVIEW",
          reason,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  ).exec();

// ─── Menu Management ─────────────────────────────────────────────────────────
export const listMenuByKitchen = async (kitchenId: string) => {
  const { MenuItem } = await import("./kitchen.model");
  return MenuItem.find({ kitchenId: new Types.ObjectId(kitchenId) }).exec();
};

