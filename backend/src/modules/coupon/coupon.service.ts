import { Coupon, ICoupon } from "./coupon.model";
import { AppError } from "../../common/errors/app-error";
import { Order } from "../order/order.model";

export const getActiveCoupons = async () => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: now },
    $or: [
      { usageLimit: { $exists: false } },
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  })
    .select("code discountType discountValue minOrderAmount maxDiscountAmount expiryDate")
    .sort({ createdAt: -1 })
    .lean();
  return coupons;
};

export const incrementCouponUsage = async (code: string) => {
  await Coupon.updateOne(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
};

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

export const validateCoupon = async (code: string, orderAmount: number, userId?: string) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw new AppError("Invalid coupon code", 404);
  }

  if (!coupon.isActive) {
    throw new AppError("This coupon is no longer active", 400);
  }

  if (new Date() > new Date(coupon.expiryDate)) {
    throw new AppError("This coupon has expired", 400);
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("This coupon has reached its usage limit", 400);
  }

  if (orderAmount < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount of ₹${coupon.minOrderAmount} is required for this coupon`, 400);
  }

  if (coupon.isForNewUser) {
    if (!userId) {
      throw new AppError("User authentication required to apply this coupon", 401);
    }
    const pastOrders = await Order.countDocuments({
      userId,
      status: { $ne: "CANCELLED" },
    });
    if (pastOrders > 0) {
      throw new AppError("This coupon is valid for new users only", 400);
    }
  }

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  // Ensure discount never exceeds order amount
  if (discount > orderAmount) {
    discount = orderAmount;
  }

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
    message: `Coupon applied! You save ₹${discount}`,
  };
};

export const getWelcomeCoupon = async (userId: string) => {
  const pastOrders = await Order.countDocuments({
    userId,
    status: { $ne: "CANCELLED" },
  });

  if (pastOrders > 0) {
    return null;
  }

  const now = new Date();
  const welcomeCoupon = await Coupon.findOne({
    isForNewUser: true,
    isActive: true,
    expiryDate: { $gt: now },
  })
    .select("code discountType discountValue minOrderAmount maxDiscountAmount expiryDate")
    .sort({ createdAt: -1 })
    .lean();

  return welcomeCoupon;
};
