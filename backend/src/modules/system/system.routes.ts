import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as controller from "./system.controller";

const router = Router();

router.get(
  "/logs",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getSystemLogs,
);
router.get(
  "/overview",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getOverviewStats,
);
router.get(
  "/settings",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getSettings,
);
router.post(
  "/settings",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.updateSetting,
);
router.get(
  "/payment-stats",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getPaymentStats,
);
router.get(
  "/analytics/sales",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getSalesAnalytics,
);
router.get(
  "/analytics/revenue",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getRevenueAnalytics,
);
router.get(
  "/analytics/top-items",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getTopItems,
);

export default router;
