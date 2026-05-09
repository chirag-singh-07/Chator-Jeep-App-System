import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as reviewRepo from "./review.repository";

export const createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const review = await reviewRepo.createReview({
    ...req.body,
    userId: req.user!.userId
  });
  res.status(201).json({ success: true, data: review });
});

export const getRestaurantReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await reviewRepo.getRestaurantReviews(req.params.id as string);
  res.status(200).json({ success: true, data: reviews });
});

export const getMyReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reviews = await reviewRepo.getMyReviews(req.user!.userId);
  res.status(200).json({ success: true, data: reviews });
});
