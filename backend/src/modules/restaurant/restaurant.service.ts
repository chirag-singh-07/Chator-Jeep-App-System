import mongoose from "mongoose";
import { AppError } from "../../common/errors/app-error";
import { hashPassword, comparePassword } from "../../common/utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken, AuthPayload } from "../../common/utils/jwt";
import { createUser, findUserByEmail, findUserById, updateRefreshToken } from "../auth/auth.repository";
import { ROLES } from "../../common/constants";
import {
  createRestaurant,
  findRestaurantByOwner,
  findRestaurantById,
  listRestaurantsByStatus,
  getRestaurantStatusCounts,
  approveRestaurant,
  rejectRestaurant,
  flagRestaurant,
  updateRestaurantById,
} from "./restaurant.repository";
import { RESTAURANT_STATUS, RestaurantStatus, MenuItem, Restaurant } from "./restaurant.model";
import Review from "./review.model";

// ─── Register Restaurant ─────────────────────────────────────────────────────
export const registerRestaurant = async (input: {
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  restaurantName: string;
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

  // 1. Create auth user with RESTAURANT role (mapped from KITCHEN for legacy code)
  const hashed = await hashPassword(input.password);
  const user = await createUser({
    name: input.ownerName,
    email,
    password: hashed,
    phone: input.phone,
    role: ROLES.KITCHEN as any, // We keep the enum internal as KITCHEN for now to avoid breaking other components
  });

  // 2. Create restaurant profile — starts as REQUESTED
  const restaurant = await createRestaurant({
    ownerId: user._id as any,
    ownerName: input.ownerName,
    name: input.restaurantName,
    email,
    phone: input.phone,
    fssaiLicense: input.fssaiLicense,
    address: input.address,
    cuisines: input.cuisines ?? [],
    bankDetails: input.bankDetails,
    logoUrls: input.logoUrls,
    bannerUrls: input.bannerUrls,
    documents: input.documents ?? [],
    status: RESTAURANT_STATUS.REQUESTED,
  });

  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await updateRefreshToken(user._id.toString(), refreshToken);

  return {
    accessToken,
    refreshToken,
    restaurantId: restaurant._id.toString(),
    status: restaurant.status,
  };
};

// ─── Restaurant Login ────────────────────────────────────────────────────────
export const loginRestaurant = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.role !== ROLES.KITCHEN) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new AppError("Invalid credentials", 401);

  const restaurant = await findRestaurantByOwner(user._id.toString());

  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await updateRefreshToken(user._id.toString(), refreshToken);

  return {
    accessToken,
    refreshToken,
    status: restaurant?.status ?? RESTAURANT_STATUS.REQUESTED,
    restaurantId: restaurant?._id?.toString() ?? null,
  };
};

// ─── Status (for app gating) ─────────────────────────────────────────────────
export const getMyRestaurantStatus = async (userId: string) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant profile not found", 404);
  return {
    status: restaurant.status,
    rejectionReason: restaurant.rejectionReason,
    name: restaurant.name,
    restaurantId: restaurant._id.toString(),
  };
};

// ─── Admin Services ──────────────────────────────────────────────────────────
export const adminListRestaurants = async (query: {
  status?: string;
  page?: string;
  limit?: string;
  search?: string;
}) => {
  const status = query.status as RestaurantStatus | undefined;
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  const { restaurants, total } = await listRestaurantsByStatus(status, page, limit, query.search);
  const counts = await getRestaurantStatusCounts();

  return {
    restaurants,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    counts,
  };
};

export const adminListMenuItems = async (query: {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
}) => {
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }
  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  const [items, total] = await Promise.all([
    MenuItem.find(filter)
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    MenuItem.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const adminGetRestaurant = async (id: string) => {
  const restaurant = await findRestaurantById(id);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  return restaurant;
};

export const adminApproveRestaurant = async (id: string, adminUserId: string) => {
  const restaurant = await approveRestaurant(id, adminUserId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  return restaurant;
};

export const adminRejectRestaurant = async (id: string, adminUserId: string, reason: string) => {
  if (!reason?.trim()) throw new AppError("Rejection reason is required", 400);
  const restaurant = await rejectRestaurant(id, adminUserId, reason.trim());
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  return restaurant;
};

export const adminFlagRestaurant = async (id: string, adminUserId: string, reason: string) => {
  const restaurant = await flagRestaurant(id, adminUserId, reason);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  return restaurant;
};


// ─── Menu Management ─────────────────────────────────────────────────────────
export const addMenuItem = async (userId: string, body: any) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  
  if (restaurant.status !== RESTAURANT_STATUS.ACTIVE) {
    throw new AppError(`Restaurant must be ACTIVE to manage menu. Current status: ${restaurant.status}`, 403);
  }
  
  return MenuItem.create({ restaurantId: restaurant._id, ...body });
};

export const listMyMenu = async (userId: string) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return MenuItem.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 }).exec();
};

export const updateMenuItem = async (userId: string, itemId: string, body: any) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  
  const item = await MenuItem.findOneAndUpdate(
    { _id: itemId, restaurantId: restaurant._id },
    { $set: body },
    { new: true }
  );
  
  if (!item) throw new AppError("Menu item not found", 404);
  return item;
};

export const deleteMenuItem = async (userId: string, itemId: string) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  
  const item = await MenuItem.findOneAndDelete({ _id: itemId, restaurantId: restaurant._id });
  
  if (!item) throw new AppError("Menu item not found", 404);
  return true;
};

export const updateMenuItemStock = async (userId: string, itemId: string, isAvailable: boolean) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  
  const item = await MenuItem.findOneAndUpdate(
    { _id: itemId, restaurantId: restaurant._id },
    { $set: { isAvailable } },
    { new: true }
  );
  
  if (!item) throw new AppError("Menu item not found", 404);
  return item;
};

/** Credit restaurant wallet after order completion */
export const addEarningsToRestaurant = async (restaurantId: string, amount: number) => {
  const earnings = Math.round((amount + Number.EPSILON) * 100) / 100;
  if (earnings <= 0) return;

  return Restaurant.findByIdAndUpdate(
    restaurantId,
    { 
      $inc: { 
        walletBalance: earnings,
        totalEarnings: earnings 
      } 
    },
    { new: true }
  );
};

export const listRestaurantMenu = async (restaurantId: string) => {
  return MenuItem.find({ restaurantId, isAvailable: true, showInMenu: true }).exec();
};

export const updateRestaurantBranding = async (
  userId: string,
  updates: { logoUrls?: Record<string, string>; bannerUrls?: Record<string, string> }
) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return updateRestaurantById(restaurant._id.toString(), updates);
};

export const updateRestaurantOpenStatus = async (userId: string, isOpen: boolean) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  if (restaurant.status !== RESTAURANT_STATUS.ACTIVE) {
    throw new AppError("Only ACTIVE restaurants can toggle open status", 403);
  }

  return updateRestaurantById(restaurant._id.toString(), { isOpen });
};

export const listRestaurants = async (query: {
  categoryId?: string;
  search?: string;
  lat?: string;
  lng?: string;
  page?: string;
  limit?: string;
}) => {
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  const skip = (page - 1) * limit;

  const filter: any = { status: RESTAURANT_STATUS.ACTIVE };

  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }
  
  if (query.categoryId) {
    filter.cuisines = { $in: [query.categoryId] };
  }

  let sort: any = { createdAt: -1 };

  // If coordinates provided, sort by proximity
  if (query.lat && query.lng) {
    const latitude = parseFloat(query.lat);
    const longitude = parseFloat(query.lng);
    filter.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: 15000, // 15km
      },
    };
    // Mongoose $near automatically sorts by distance
    sort = null; 
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec(),
    Restaurant.countDocuments(filter).exec(),
  ]);

  return {
    restaurants,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const createReview = async (input: {
  userId: string;
  restaurantId: string;
  orderId: string;
  rating: number;
  comment?: string;
}) => {
  const existing = await Review.findOne({ orderId: input.orderId });
  if (existing) throw new AppError("Review already submitted for this order", 400);

  const review = await Review.create(input);

  // Update restaurant average rating
  const stats = await Review.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(input.restaurantId) } },
    { $group: { _id: "$restaurantId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(input.restaurantId, {
      rating: stats[0].avgRating,
      totalReviews: stats[0].totalReviews
    });
  }

  return review;
};

