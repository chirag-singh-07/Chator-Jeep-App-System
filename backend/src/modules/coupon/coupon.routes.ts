import { Router } from "express";
import {
  createCouponHandler,
  getCouponsHandler,
  getCouponByIdHandler,
  updateCouponHandler,
  deleteCouponHandler,
} from "./coupon.controller";
import { ROLES } from "../../common/constants/roles";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";

const router = Router();

// All routes here are admin only for now
router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN]));

router.post("/", createCouponHandler);
router.get("/", getCouponsHandler);
router.get("/:id", getCouponByIdHandler);
router.patch("/:id", updateCouponHandler);
router.delete("/:id", deleteCouponHandler);

export default router;
