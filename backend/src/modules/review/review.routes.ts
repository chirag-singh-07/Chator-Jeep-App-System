import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import * as controller from "./review.controller";

const router = Router();

router.post("/", authMiddleware, controller.createReview);
router.get("/restaurant/:id", controller.getRestaurantReviews);
router.get("/my", authMiddleware, controller.getMyReviews);

export default router;
