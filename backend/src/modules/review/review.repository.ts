import Review, { IReview } from "./review.model";

export const createReview = async (data: Partial<IReview>) => {
  return await Review.create(data);
};

export const getRestaurantReviews = async (restaurantId: string) => {
  return await Review.find({ restaurantId }).populate("userId", "name").sort({ createdAt: -1 });
};

export const getMyReviews = async (userId: string) => {
  return await Review.find({ userId }).populate("restaurantId", "name image").sort({ createdAt: -1 });
};
