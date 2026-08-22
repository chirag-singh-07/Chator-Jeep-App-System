import { AppError } from "../../common/errors/app-error";
import { findUserById, listUsers, createUser, findUserByEmail, deleteUserById } from "./user.repository";
import { Role, ROLES } from "../../common/constants";
import { hashPassword } from "../../common/utils/hash";
import { DeliveryPartner } from "../delivery/delivery.model";
import { Restaurant } from "../restaurant/restaurant.model";
import { User } from "./user.model";

export const getMyProfile = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const addAddress = async (userId: string, addressData: any) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  
  if (user.addresses.length >= 10) {
    throw new AppError("Maximum number of addresses reached", 400);
  }

  user.addresses.push(addressData);
  await user.save();
  return user.addresses[user.addresses.length - 1];
};

export const getAddresses = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user.addresses;
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  
  user.addresses = user.addresses.filter((addr: any) => (addr as any)._id?.toString() !== addressId);
  await user.save();
  return user.addresses;
};

// ─── Admin Services ──────────────────────────────────────────────────────────

export const adminListUsers = async (query: {
  role?: string;
  page?: string;
  limit?: string;
  search?: string;
}) => {
  const role = query.role;
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "20");
  
  const { users, total } = await listUsers(role, page, limit, query.search);
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const adminGetUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  let partnerProfile = null;
  let restaurantProfile = null;

  if (user.role === ROLES.DELIVERY) {
    partnerProfile = await DeliveryPartner.findOne({ userId });
  } else if (user.role === ROLES.KITCHEN) {
    restaurantProfile = await Restaurant.findOne({ ownerId: userId });
  }

  // Convert mongoose doc to plain object so we can add properties
  const userObj = user.toObject();
  
  return {
    ...userObj,
    partnerProfile,
    restaurantProfile
  };
};

export const adminApproveUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === ROLES.DELIVERY) {
    const partner = await DeliveryPartner.findOneAndUpdate(
      { userId },
      { status: "approved" },
      { new: true }
    );
    if (!partner) throw new AppError("Delivery partner profile not found", 404);
  } else if (user.role === ROLES.KITCHEN) {
    const restaurant = await Restaurant.findOneAndUpdate(
      { ownerId: userId },
      { isApproved: true, status: "active" },
      { new: true }
    );
    if (!restaurant) throw new AppError("Restaurant profile not found", 404);
  } else {
    throw new AppError("Only Delivery and Kitchen users can be approved", 400);
  }

  // Update the main user record
  await User.findByIdAndUpdate(userId, { status: "ACTIVE" });
  
  return { message: "User approved successfully" };
};

export const adminDeleteUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  await deleteUserById(userId);
  return { message: "User deleted successfully" };
};

export const adminCreateUser = async (payload: any, role: Role) => {
  const { name, email, password, phone } = payload;
  
  if (!password || password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await hashPassword(password);
  
  const user = await createUser({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    role,
    status: "ACTIVE"
  });

  return user;
};
