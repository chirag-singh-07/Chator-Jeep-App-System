import { Router } from "express";
import { ROLES } from "../../common/constants";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as controller from "./delivery.controller";
import {
  acceptAssignmentSchema,
  assignOrderSchema,
  getOrderDetailSchema,
  updateAvailabilitySchema,
  updateDeliveryStatusSchema,
  updateLocationSchema,
} from "./delivery.validation";

const router = Router();

router.post("/assign/:orderId", authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.KITCHEN]), validate(assignOrderSchema), controller.assignOrder);
router.get("/me/dashboard", authMiddleware, roleMiddleware([ROLES.DELIVERY]), controller.dashboard);
router.post("/register", authMiddleware, roleMiddleware([ROLES.DELIVERY, ROLES.USER]), controller.register);
router.get("/profile", authMiddleware, roleMiddleware([ROLES.DELIVERY]), controller.getProfile);
router.patch("/availability", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateAvailabilitySchema), controller.updateAvailability);
router.get("/orders/assigned", authMiddleware, roleMiddleware([ROLES.DELIVERY]), controller.myAssignedOrders);
router.get("/orders/:orderId", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(getOrderDetailSchema), controller.getAssignedOrder);
router.patch("/orders/:orderId/accept", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(acceptAssignmentSchema), controller.acceptOrder);
router.patch("/orders/:orderId/status", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateDeliveryStatusSchema), controller.updateStatus);
router.post("/location", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateLocationSchema), controller.updateLocation);

// Admin Routes
router.get("/admin/partners", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.adminListAllPartners);
router.patch("/admin/partners/:partnerId/status", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.adminUpdatePartnerStatus);

export default router;
