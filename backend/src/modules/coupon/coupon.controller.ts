import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import { 
  createCoupon, 
  getCoupons, 
  getCouponById, 
  updateCoupon, 
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
  getWelcomeCoupon,
} from "./coupon.service";
import { asyncHandler } from "../../common/utils/async-handler";

export const getActiveCouponsHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const coupons = await getActiveCoupons();
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

export const createCouponHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await createCoupon(req.body);
  res.status(201).json({
    success: true,
    data: coupon,
  });
});

export const getCouponsHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const coupons = await getCoupons();
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

export const getCouponByIdHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await getCouponById(req.params.id as string);
  res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const updateCouponHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await updateCoupon(req.params.id as string, req.body);
  res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const deleteCouponHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await deleteCoupon(req.params.id as string);
  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});

export const getWelcomeCouponHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  const coupon = await getWelcomeCoupon(userId);
  res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const applyCouponHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { code, orderAmount } = req.body;
  if (!code || orderAmount == null) {
    res.status(400).json({ success: false, message: "Coupon code and order amount are required" });
    return;
  }
  const result = await validateCoupon(code, orderAmount, req.user?.userId);
  res.status(200).json({
    success: true,
    data: result,
  });
});
