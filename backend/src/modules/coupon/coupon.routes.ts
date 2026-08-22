import { Router } from "express";
import {
  createCouponHandler,
  getCouponsHandler,
  getCouponByIdHandler,
  updateCouponHandler,
  deleteCouponHandler,
  applyCouponHandler,
  getActiveCouponsHandler,
  getWelcomeCouponHandler,
} from "./coupon.controller";
import { ROLES } from "../../common/constants/roles";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";

const router = Router();

// Public route (requires auth but any role)
router.get("/welcome", authMiddleware, getWelcomeCouponHandler);
router.post("/apply", authMiddleware, applyCouponHandler);
router.get("/active", authMiddleware, getActiveCouponsHandler);

// Admin only routes
router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN]));

router.post("/", createCouponHandler);
router.get("/", getCouponsHandler);
router.get("/:id", getCouponByIdHandler);
router.patch("/:id", updateCouponHandler);
router.delete("/:id", deleteCouponHandler);

export default router;
