import { NextFunction, Request, Response } from "express";
import { 
  createCoupon, 
  getCoupons, 
  getCouponById, 
  updateCoupon, 
  deleteCoupon 
} from "./coupon.service";
import { asyncHandler } from "../../common/utils/async-handler";

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
