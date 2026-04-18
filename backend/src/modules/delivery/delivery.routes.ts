import { Router } from "express";
import { ROLES } from "../../common/constants";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as controller from "./delivery.controller";
import { assignOrderSchema, updateDeliveryStatusSchema, updateLocationSchema } from "./delivery.validation";

const router = Router();

router.post("/assign/:orderId", authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.KITCHEN]), validate(assignOrderSchema), controller.assignOrder);
router.get("/orders/assigned", authMiddleware, roleMiddleware([ROLES.DELIVERY]), controller.myAssignedOrders);
router.patch("/orders/:orderId/status", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateDeliveryStatusSchema), controller.updateStatus);
router.post("/location", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateLocationSchema), controller.updateLocation);

export default router;
