import { Restaurant, IRestaurant, RestaurantStatus } from "./restaurant.model";
import { Types } from "mongoose";

// ─── Creation ──────────────────────────────────────────────────────────────────
export const createRestaurant = (payload: Partial<IRestaurant>): Promise<IRestaurant> =>
  Restaurant.create(payload);

// ─── Lookups ───────────────────────────────────────────────────────────────────
export const findRestaurantByOwner = (ownerId: string): Promise<IRestaurant | null> =>
  Restaurant.findOne({ ownerId: new Types.ObjectId(ownerId) }).exec();

export const findRestaurantById = (id: string): Promise<IRestaurant | null> =>
  Restaurant.findById(id).exec();

// ─── Admin Listing (paginated + filtered) ─────────────────────────────────────
export const listRestaurantsByStatus = async (
  status?: RestaurantStatus,
  page = 1,
  limit = 20,
  search?: string
): Promise<{ restaurants: IRestaurant[]; total: number }> => {
  const filter: Record<string, unknown> = {};
  if (status) filter["status"] = status;
  if (search) {
    filter["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Restaurant.countDocuments(filter).exec(),
  ]);

  return { restaurants, total };
};

// ─── Status Counts (for admin dashboard stat cards) ───────────────────────────
export const getRestaurantStatusCounts = async (): Promise<Record<string, number>> => {
  const counts = await Restaurant.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const result: Record<string, number> = {
    ALL: 0,
    REQUESTED: 0,
    ACTIVE: 0,
    REJECTED: 0,
    CLOSED: 0,
    FLAGGED: 0,
  };
  let total = 0;
  counts.forEach((c) => {
    result[c._id] = c.count;
    total += c.count;
  });
  result.ALL = total;
  return result;
};

// ─── Profile Updates ──────────────────────────────────────────────────────────
export const updateRestaurantById = (
  id: string,
  update: Partial<IRestaurant>
): Promise<IRestaurant | null> =>
  Restaurant.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();

// ─── Admin Actions ────────────────────────────────────────────────────────────
export const approveRestaurant = (id: string, adminId: string): Promise<IRestaurant | null> =>
  Restaurant.findByIdAndUpdate(
    id,
    {
      $set: { status: "ACTIVE", rejectionReason: null, isOpen: false },
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

export const rejectRestaurant = (
  id: string,
  adminId: string,
  reason: string
): Promise<IRestaurant | null> =>
  Restaurant.findByIdAndUpdate(
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

export const flagRestaurant = (
  id: string,
  adminId: string,
  reason: string
): Promise<IRestaurant | null> =>
  Restaurant.findByIdAndUpdate(
    id,
    {
      $set: { status: "FLAGGED" },
      $push: {
        adminActions: {
          adminId: new Types.ObjectId(adminId),
          action: "FLAGGED",
          reason,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  ).exec();

// ─── Menu Management ─────────────────────────────────────────────────────────
export const listMenuByRestaurant = async (restaurantId: string) => {
  const { MenuItem } = await import("./restaurant.model");
  return MenuItem.find({ restaurantId: new Types.ObjectId(restaurantId) }).exec();
};
