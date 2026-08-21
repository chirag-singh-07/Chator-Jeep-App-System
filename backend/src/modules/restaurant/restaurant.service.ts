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
import { deleteUploadedFiles } from "../../common/services/upload.service";
import { deleteRestaurantById, listMenuByRestaurant } from "./restaurant.repository";
import { Order } from "../order/order.model";
import { consumeRestaurantRegistrationPayment } from "../payment/payment.service";
import { User, IUser } from "../user/user.model";
import { isRedisEnabled, redisConnection } from "../../config/redis";

const indianPhoneRegex = /^[6-9]\d{9}$/;

const validateRestaurantRegistrationInput = async (input: {
  email: string;
  phone: string;
  termsAccepted?: boolean;
}) => {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!indianPhoneRegex.test(phone)) {
    throw new AppError("Please enter a valid Indian mobile number", 400);
  }

  const existing = await findUserByEmail(email);
  if (existing) throw new AppError("Email already registered", 409);
  if (!input.termsAccepted) throw new AppError("Terms and Conditions must be accepted", 400);

  return { email, phone };
};

export const precheckRestaurantRegistration = async (input: {
  email: string;
  phone: string;
  termsAccepted?: boolean;
}) => {
  await validateRestaurantRegistrationInput(input);
  return { canProceed: true };
};

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
  termsAccepted?: boolean;
}) => {
  const { email, phone } = await validateRestaurantRegistrationInput(input);
  
  const activationTimestamp = new Date();
  const launchOfferExpiresAt = new Date(
    activationTimestamp.getTime() + 48 * 60 * 60 * 1000,
  );

  // 1. Create auth user with RESTAURANT role (mapped from KITCHEN for legacy code)
  const hashed = await hashPassword(input.password);
  let user: IUser | null = null;
  let restaurant: any = null;

  try {
    user = await createUser({
      name: input.ownerName,
      email,
      password: hashed,
      phone,
      role: ROLES.KITCHEN as any, // We keep the enum internal as KITCHEN for now to avoid breaking other components
    });

  // 2. Create restaurant profile — starts as REQUESTED
    restaurant = await createRestaurant({
      ownerId: user._id as any,
      ownerName: input.ownerName,
      name: input.restaurantName,
      email,
      phone,
      fssaiLicense: input.fssaiLicense,
      address: input.address,
      cuisines: input.cuisines ?? [],
      bankDetails: input.bankDetails,
      logoUrls: input.logoUrls,
      bannerUrls: input.bannerUrls,
      documents: input.documents ?? [],
      status: RESTAURANT_STATUS.REQUESTED,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      activationTimestamp,
      launchOfferExpiresAt,
      currentCommissionPercentage: 10,
      registrationPayment: {
        transactionId: new mongoose.Types.ObjectId() as any,
        razorpayOrderId: "FREE_REGISTRATION",
        razorpayPaymentId: "FREE_REGISTRATION_" + Date.now(),
        status: "COMPLETED",
        amount: 0,
        currency: "INR",
        paidAt: new Date(),
        planName: "Free Registration",
        launchCommissionPercentage: 10,
        normalCommissionPercentage: 10,
        offerWindowHours: 48,
      },
    });

  } catch (error) {
    if (restaurant?._id) await Restaurant.findByIdAndDelete(restaurant._id).catch(() => null);
    if (user?._id) await User.findByIdAndDelete(user._id).catch(() => null);
    throw error;
  }

  if (!user || !restaurant) {
    throw new AppError("Restaurant registration could not be completed", 500);
  }

  const payload: AuthPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await updateRefreshToken(user._id.toString(), refreshToken);

  return {
    accessToken,
    refreshToken,
    restaurantId: restaurant._id.toString(),
    status: restaurant.status,
    registrationPayment: restaurant.registrationPayment,
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
    activationTimestamp: restaurant.activationTimestamp,
    launchOfferExpiresAt: restaurant.launchOfferExpiresAt,
    offerActive: Boolean(
      restaurant.launchOfferExpiresAt &&
        restaurant.launchOfferExpiresAt.getTime() > Date.now(),
    ),
    currentCommissionPercentage:
      restaurant.launchOfferExpiresAt &&
      restaurant.launchOfferExpiresAt.getTime() > Date.now()
        ? restaurant.registrationPayment?.launchCommissionPercentage ??
          restaurant.currentCommissionPercentage
        : restaurant.registrationPayment?.normalCommissionPercentage ??
          restaurant.currentCommissionPercentage,
    registrationPayment: restaurant.registrationPayment,
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
  restaurantId?: string;
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
  if (query.restaurantId) {
    filter.restaurantId = query.restaurantId;
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

export const adminBulkUploadMenuItems = async (restaurantId: string, rawItems: any[]) => {
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError("No items provided for bulk upload", 400);
  }

  const sanitizedItems = rawItems.map((item, index) => {
    if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
      throw new AppError(`Item at row ${index + 1} is missing a valid name`, 400);
    }
    const price = Number(item.price);
    if (isNaN(price) || price < 0) {
      throw new AppError(`Item '${item.name}' at row ${index + 1} has an invalid price`, 400);
    }

    const discountPrice =
      item.discountPrice !== undefined && item.discountPrice !== null && item.discountPrice !== ""
        ? Number(item.discountPrice)
        : undefined;

    // Normalize isVeg
    let isVeg = false;
    if (typeof item.isVeg === "boolean") {
      isVeg = item.isVeg;
    } else if (typeof item.isVeg === "string") {
      const v = item.isVeg.trim().toLowerCase();
      isVeg = v === "true" || v === "yes" || v === "veg" || v === "1" || v === "vegetarian";
    }

    // Normalize ingredients
    let ingredients: string[] = [];
    if (Array.isArray(item.ingredients)) {
      ingredients = item.ingredients.map((i: any) => String(i).trim()).filter(Boolean);
    } else if (typeof item.ingredients === "string" && item.ingredients.trim()) {
      ingredients = item.ingredients.split(",").map((i: string) => i.trim()).filter(Boolean);
    }

    // Normalize allergens
    let allergens: string[] = [];
    if (Array.isArray(item.allergens)) {
      allergens = item.allergens.map((i: any) => String(i).trim()).filter(Boolean);
    } else if (typeof item.allergens === "string" && item.allergens.trim()) {
      allergens = item.allergens.split(",").map((i: string) => i.trim()).filter(Boolean);
    }

    // Normalize tags
    const tags = {
      isJain: Boolean(item.tags?.isJain ?? item.isJain),
      isSpicy: Boolean(item.tags?.isSpicy ?? item.isSpicy),
      isBestseller: Boolean(item.tags?.isBestseller ?? item.isBestseller),
      isRecommended: Boolean(item.tags?.isRecommended ?? item.isRecommended),
    };

    // Normalize variants
    let variants: { name: string; price: number }[] = [];
    if (Array.isArray(item.variants)) {
      variants = item.variants
        .map((v: any) => ({
          name: String(v.name || "").trim(),
          price: Number(v.price) || 0,
        }))
        .filter((v: any) => v.name && v.price >= 0);
    } else if (typeof item.variants === "string" && item.variants.trim()) {
      variants = item.variants
        .split(",")
        .map((vStr: string) => {
          const [vName, vPrice] = vStr.split(":");
          return {
            name: vName?.trim() || "",
            price: Number(vPrice?.trim()) || 0,
          };
        })
        .filter((v: any) => v.name && !isNaN(v.price));
    }

    // Normalize addOns
    let addOns: { name: string; price: number; imageUrl?: string }[] = [];
    if (Array.isArray(item.addOns)) {
      addOns = item.addOns
        .map((a: any) => ({
          name: String(a.name || "").trim(),
          price: Number(a.price) || 0,
          imageUrl: a.imageUrl ? String(a.imageUrl).trim() : undefined,
        }))
        .filter((a: any) => a.name && a.price >= 0);
    } else if (typeof item.addOns === "string" && item.addOns.trim()) {
      addOns = item.addOns
        .split(",")
        .map((aStr: string) => {
          const [aName, aPrice] = aStr.split(":");
          return {
            name: aName?.trim() || "",
            price: Number(aPrice?.trim()) || 0,
          };
        })
        .filter((a: any) => a.name && !isNaN(a.price));
    }

    return {
      restaurantId: restaurant._id,
      name: item.name.trim(),
      shortDescription: item.shortDescription ? String(item.shortDescription).trim() : undefined,
      description: item.description ? String(item.description).trim() : undefined,
      price,
      discountPrice: discountPrice !== undefined && !isNaN(discountPrice) ? discountPrice : undefined,
      category: item.category ? String(item.category).trim() : undefined,
      subcategory: item.subcategory ? String(item.subcategory).trim() : undefined,
      isVeg,
      isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
      showInMenu: item.showInMenu !== undefined ? Boolean(item.showInMenu) : true,
      imageUrl: item.imageUrl ? String(item.imageUrl).trim() : undefined,
      portionSize: item.portionSize ? String(item.portionSize).trim() : undefined,
      preparationTimeMins:
        !isNaN(Number(item.preparationTimeMins)) && Number(item.preparationTimeMins) > 0
          ? Number(item.preparationTimeMins)
          : undefined,
      calories:
        !isNaN(Number(item.calories)) && Number(item.calories) > 0 ? Number(item.calories) : undefined,
      ingredients,
      allergens,
      tags,
      variants,
      addOns,
    };
  });

  const inserted = await MenuItem.insertMany(sanitizedItems);

  if (isRedisEnabled && redisConnection) {
    await redisConnection.del(`menu:${restaurant._id.toString()}`);
  }

  return {
    count: inserted.length,
    items: inserted,
  };
};

export const adminDeleteMenuItem = async (itemId: string) => {
  const item = await MenuItem.findByIdAndDelete(itemId);
  if (!item) throw new AppError("Menu item not found", 404);

  if (isRedisEnabled && redisConnection && item.restaurantId) {
    await redisConnection.del(`menu:${item.restaurantId.toString()}`);
  }
  return true;
};

export const adminToggleMenuItemStock = async (itemId: string, isAvailable: boolean) => {
  const item = await MenuItem.findByIdAndUpdate(
    itemId,
    { $set: { isAvailable } },
    { new: true }
  );
  if (!item) throw new AppError("Menu item not found", 404);

  if (isRedisEnabled && redisConnection && item.restaurantId) {
    await redisConnection.del(`menu:${item.restaurantId.toString()}`);
  }
  return item;
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
export const adminDeleteRestaurant = async (id: string) => {
  const restaurant = await findRestaurantById(id);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  // Fetch all menu items so we can delete their images too
  const menuItems = await listMenuByRestaurant(id);

  // 1. Collect all upload keys
  const keysToDelete = new Set<string>();

  // Helper to extract the directory or file key from public URL
  const extractKey = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes(".io/")) return url.split(".io/")[1];
      if (url.includes(".dev/")) return url.split(".dev/")[1];
      if (url.includes("/uploads/")) {
         const fullKey = url.split("/uploads/")[1];
         // For processed images (e.g., folder1/folder2/uuid/file.webp), we want to delete the parent 'uuid' folder
         const parts = fullKey.split("/");
         if (parts.length > 1) {
             return parts.slice(0, -1).join("/");
         }
         return fullKey;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const extractFromMixed = (obj: any) => {
    if (!obj) return;
    if (typeof obj === "string") {
      const key = extractKey(obj);
      if (key) keysToDelete.add(key);
    } else {
      Object.values(obj).forEach(url => {
        const key = extractKey(url as string);
        if (key) keysToDelete.add(key);
      });
    }
  };

  extractFromMixed(restaurant.logoUrls);
  extractFromMixed(restaurant.bannerUrls);
  extractFromMixed(restaurant.aadharCard);
  extractFromMixed(restaurant.panCard);
  extractFromMixed(restaurant.livePhoto);

  // Extract from documents array
  if (restaurant.documents && restaurant.documents.length > 0) {
    restaurant.documents.forEach((doc: any) => {
      // Raw files use the full key
      if (doc.key) keysToDelete.add(doc.key);
      else {
        const key = extractKey(doc.url);
        // For raw files, it's just the file itself, but our extractKey might strip the filename if we aren't careful.
        // Actually doc.key is always present for documents per upload.controller.ts, so we're safe.
        if (key) keysToDelete.add(key);
      }
    });
  }

  // Extract from Menu Items
  menuItems.forEach((item: any) => {
      extractFromMixed(item.images);
      if (item.imageUrl) {
         const key = extractKey(item.imageUrl);
         if (key) keysToDelete.add(key);
      }
  });

  // 2. Delete from Filesystem/S3
  const keysArray = Array.from(keysToDelete);
  if (keysArray.length > 0) {
    console.log(`Deleting ${keysArray.length} file paths from storage for restaurant ${id}`);
    try {
      await deleteUploadedFiles(keysArray);
    } catch (err) {
      console.warn("Storage Deletion failed during restaurant cleanup:", err);
      // Continue to ensure DB is cleaned up
    }
  }

  // 3. Delete from Database (Restaurant + Menu Items)
  return deleteRestaurantById(id);
};

// ─── Admin Create Restaurant ───────────────────────────────────────────────────
export const adminCreateRestaurant = async (
  adminUserId: string,
  input: {
    ownerName: string;
    email: string;
    password: string;
    phone: string;
    restaurantName: string;
    type?: string;
    location?: string;
    cuisine?: string;
    heroImage?: string;
    logoImage?: string;
    notes?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    fssaiLicense?: string;
    aadharCard?: any;
    panCard?: any;
    livePhoto?: any;
  }
) => {
  const { email, phone } = await validateRestaurantRegistrationInput({
    email: input.email,
    phone: input.phone,
    termsAccepted: true,
  });

  const hashed = await hashPassword(input.password);
  let user: IUser | null = null;
  let restaurant: any = null;

  try {
    user = await createUser({
      name: input.ownerName,
      email,
      password: hashed,
      phone,
      role: ROLES.KITCHEN as any,
    });

    let mappedStatus: RestaurantStatus = RESTAURANT_STATUS.ACTIVE;
    if (input.type === "requested") mappedStatus = RESTAURANT_STATUS.REQUESTED;
    if (input.type === "closed") mappedStatus = RESTAURANT_STATUS.CLOSED;
    if (input.type === "flagged") mappedStatus = RESTAURANT_STATUS.FLAGGED;
    if (input.type === "active") mappedStatus = RESTAURANT_STATUS.ACTIVE;

    const bannerUrls = input.heroImage ? { default: input.heroImage } : undefined;
    const logoUrls = input.logoImage ? { default: input.logoImage } : undefined;
    const cuisines = input.cuisine ? input.cuisine.split(",").map((c: string) => c.trim()) : [];

    restaurant = await createRestaurant({
      ownerId: user._id as any,
      ownerName: input.ownerName,
      name: input.restaurantName,
      email,
      phone,
      cuisines,
      bannerUrls,
      logoUrls,
      fssaiLicense: input.fssaiLicense,
      aadharCard: input.aadharCard,
      panCard: input.panCard,
      livePhoto: input.livePhoto,
      address: {
        line1: input.addressLine1 || input.location || "",
        city: input.city || "",
        state: input.state || "",
        pinCode: input.pinCode || "",
      },
      bankDetails: {
        bankName: input.bankName || "",
        accountHolderName: input.accountHolderName || "",
        accountNumber: input.accountNumber || "",
        ifscCode: input.ifscCode || "",
      },
      status: mappedStatus,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      activationTimestamp: new Date(),
      currentCommissionPercentage: 10,
      description: input.notes,
      registrationPayment: {
        transactionId: new mongoose.Types.ObjectId() as any,
        razorpayOrderId: "OFFLINE_CASH",
        razorpayPaymentId: "OFFLINE_CASH_" + Date.now(),
        status: "COMPLETED",
        amount: 0,
        currency: "INR",
        paidAt: new Date(),
        planName: "Offline Registration",
        launchCommissionPercentage: 10,
        normalCommissionPercentage: 10,
        offerWindowHours: 0,
      },
    });
    
    // Add admin action since it's created by admin
    await Restaurant.findByIdAndUpdate(restaurant._id, {
      $push: {
        adminActions: {
          adminId: adminUserId,
          action: "APPROVED",
          reason: "Created by Admin via Admin Panel",
          timestamp: new Date()
        }
      }
    });

  } catch (error) {
    if (restaurant?._id) await Restaurant.findByIdAndDelete(restaurant._id).catch(() => null);
    if (user?._id) await User.findByIdAndDelete(user._id).catch(() => null);
    throw error;
  }

  if (!user || !restaurant) {
    throw new AppError("Restaurant creation failed", 500);
  }

  return restaurant;
};

// ─── Menu Management ─────────────────────────────────────────────────────────
export const addMenuItem = async (userId: string, body: any) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  
  if (
    restaurant.status !== RESTAURANT_STATUS.REQUESTED &&
    restaurant.status !== RESTAURANT_STATUS.ACTIVE
  ) {
    throw new AppError(`Restaurant cannot manage menu while status is ${restaurant.status}`, 403);
  }
  
  const item = await MenuItem.create({ restaurantId: restaurant._id, ...body });
  if (isRedisEnabled && redisConnection) {
    await redisConnection.del(`menu:${restaurant._id.toString()}`);
  }
  return item;
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
  if (isRedisEnabled && redisConnection) {
    await redisConnection.del(`menu:${restaurant._id.toString()}`);
  }
  return item;
};

export const deleteMenuItem = async (userId: string, itemId: string) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);
  
  const item = await MenuItem.findOneAndDelete({ _id: itemId, restaurantId: restaurant._id });
  
  if (!item) throw new AppError("Menu item not found", 404);
  if (isRedisEnabled && redisConnection) {
    await redisConnection.del(`menu:${restaurant._id.toString()}`);
  }
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
  if (isRedisEnabled && redisConnection) {
    await redisConnection.del(`menu:${restaurant._id.toString()}`);
  }
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
  const cacheKey = `menu:${restaurantId}`;
  
  if (isRedisEnabled && redisConnection) {
    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const menu = await MenuItem.find({
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    isAvailable: true,
    showInMenu: true
  }).exec();
  
  if (isRedisEnabled && redisConnection) {
    await redisConnection.set(cacheKey, JSON.stringify(menu), "EX", 3600); // Cache for 1 hour
  }
  
  return menu;
};

export const updateRestaurantBranding = async (
  userId: string,
  updates: { logoUrls?: Record<string, string>; bannerUrls?: Record<string, string> }
) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return updateRestaurantById(restaurant._id.toString(), updates);
};

export const updateRestaurantLegalDocs = async (
  userId: string,
  docs: {
    aadharCard?: any;
    panCard?: any;
    livePhoto?: any;
    documents?: any[];
  }
) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return updateRestaurantById(restaurant._id.toString(), docs);
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
  city?: string;
  page?: string;
  limit?: string;
}) => {
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  const skip = (page - 1) * limit;

  // Filter out restaurants with no menu items
  const activeRestaurantIds = await MenuItem.distinct("restaurantId", {
    isAvailable: true,
    showInMenu: true,
  });
  const filter: any = {
    status: RESTAURANT_STATUS.ACTIVE,
    _id: { $in: activeRestaurantIds },
  };

  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  if (query.categoryId) {
    filter.cuisines = { $in: [query.categoryId] };
  }

  let sort: any = { createdAt: -1 };
  let restaurants: any[] = [];
  let total = 0;

  // If coordinates provided, try geo query first, then fallback to city-based or all
  if (query.lat && query.lng) {
    const latitude = parseFloat(query.lat);
    const longitude = parseFloat(query.lng);

    // Tiered Radius Search: 5km -> 8km -> 10km
    const radii = [5000, 8000, 10000];
    let geoResults: any[] = [];
    let geoTotal = 0;

    try {
      for (const maxDistance of radii) {
        const geoFilter = {
          ...filter,
          location: {
            $near: {
              $geometry: { type: "Point", coordinates: [longitude, latitude] },
              $maxDistance: maxDistance,
            },
          },
        };

        geoTotal = await Restaurant.countDocuments(geoFilter).exec();
        if (geoTotal > 0) {
          geoResults = await Restaurant.find(geoFilter)
            .skip(skip)
            .limit(limit)
            .exec();
          
          // If we found enough results for this page, or we've found all there is in this radius
          if (geoResults.length >= limit || geoTotal < limit) {
            break;
          }
        }
      }

      // If we found restaurants with geo query, return them
      if (geoResults.length > 0) {
        restaurants = geoResults;
        total = geoTotal;
      } else {
        // No results with geo query - try to find restaurants in the same city/area
        // First, try to find restaurants without strict location (they may not have coordinates set)
        const noLocationFilter = {
          ...filter,
          $or: [
            { location: { $exists: false } },
            { location: null },
            { "location.coordinates": { $size: 0 } },
            { "address.city": { $regex: query.city ?? "", $options: "i" } },
          ],
        };

        const noLocationResults = await Restaurant.find(noLocationFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec();

        const noLocationCount = await Restaurant.countDocuments(noLocationFilter).exec();

        if (noLocationResults.length > 0) {
          restaurants = noLocationResults;
          total = noLocationCount;
        } else {
          // Fallback: get all active restaurants (ignore location entirely)
          restaurants = await Restaurant.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
          total = await Restaurant.countDocuments(filter).exec();
        }
      }
    } catch (geoError) {
      // Geo query failed (e.g., no 2dsphere index) - fallback to all restaurants
      console.warn("Geo query failed, falling back to all restaurants:", geoError);
      restaurants = await Restaurant.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      total = await Restaurant.countDocuments(filter).exec();
    }
  } else {
    // No coordinates provided - show all active restaurants
    [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      Restaurant.countDocuments(filter).exec(),
    ]);
  }

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

export const listPopularMenuItems = async (limit: number = 10) => {
  return MenuItem.find({ 
    isAvailable: true, 
    showInMenu: true,
    "tags.isRecommended": true 
  })
    .populate("restaurantId", "name rating")
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
};

export const adminGetRestaurantStats = async (id: string) => {
  const restaurant = await findRestaurantById(id);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  const resId = new mongoose.Types.ObjectId(id);

  // 1. Basic Stats
  const stats = await Order.aggregate([
    { $match: { restaurantId: resId, status: "COMPLETED" } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$foodAmount" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$foodAmount" }
      }
    }
  ]);

  // 2. Daily Sales (last 15 days)
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const dailySales = await Order.aggregate([
    { 
      $match: { 
        restaurantId: resId, 
        status: "COMPLETED",
        createdAt: { $gte: fifteenDaysAgo }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$foodAmount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // 3. Top Items
  const topItems = await Order.aggregate([
    { $match: { restaurantId: resId, status: "COMPLETED" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 }
  ]);

  return {
    overview: stats[0] || { totalEarnings: 0, totalOrders: 0, avgOrderValue: 0 },
    dailySales,
    topItems,
    rating: restaurant.rating,
    totalReviews: restaurant.totalReviews,
    walletBalance: restaurant.walletBalance
  };
};

