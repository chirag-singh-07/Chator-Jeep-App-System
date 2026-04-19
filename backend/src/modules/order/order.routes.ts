import { Router } from "express";
import { ROLES } from "../../common/constants";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as controller from "./order.controller";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation";

const router = Router();

router.post("/", authMiddleware, roleMiddleware([ROLES.USER]), validate(createOrderSchema), controller.createOrder);
router.get("/me", authMiddleware, roleMiddleware([ROLES.USER]), controller.listMyOrders);
router.get("/restaurant", authMiddleware, roleMiddleware([ROLES.KITCHEN, ROLES.ADMIN]), controller.listRestaurantOrders);
router.patch("/:orderId/status", authMiddleware, roleMiddleware([ROLES.KITCHEN, ROLES.DELIVERY, ROLES.ADMIN]), validate(updateOrderStatusSchema), controller.updateStatus);

export default router;
