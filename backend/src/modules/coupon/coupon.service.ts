import { Coupon, ICoupon } from "./coupon.model";
import { AppError } from "../../common/errors/app-error";

export const createCoupon = async (data: Partial<ICoupon>) => {
  const existing = await Coupon.findOne({ code: data.code?.toUpperCase() });
  if (existing) {
    throw new AppError("Coupon code already exists", 400);
  }
  return await Coupon.create(data);
};

export const getCoupons = async () => {
  return await Coupon.find().sort({ createdAt: -1 });
};

export const getCouponById = async (id: string) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }
  return coupon;
};

export const updateCoupon = async (id: string, data: Partial<ICoupon>) => {
  const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }
  return coupon;
};

export const deleteCoupon = async (id: string) => {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }
  return coupon;
};
