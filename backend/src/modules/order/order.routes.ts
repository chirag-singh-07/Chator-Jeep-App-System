import { Router } from "express";
import { ROLES } from "../../common/constants";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as controller from "./order.controller";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation";

const router = Router();

// ─── Customer Routes ──────────────────────────────────────────────────────────

/** POST /api/v1/orders — Place a new order */
router.post(
  "/",
  authMiddleware,
  roleMiddleware([ROLES.USER]),
  validate(createOrderSchema),
  controller.createOrder
);

/** GET /api/v1/orders/my — List my orders (alias: /me for legacy) */
router.get("/my", authMiddleware, roleMiddleware([ROLES.USER]), controller.listMyOrders);
router.get("/me", authMiddleware, roleMiddleware([ROLES.USER]), controller.listMyOrders); // legacy alias

/** GET /api/v1/orders/wallet — User wallet balance */
router.get("/wallet", authMiddleware, roleMiddleware([ROLES.USER]), controller.getWalletBalance);

/** GET /api/v1/orders/wallet/transactions — User wallet history */
router.get("/wallet/transactions", authMiddleware, roleMiddleware([ROLES.USER]), controller.getWalletTransactions);



// ─── Restaurant / Admin Routes ─────────────────────────────────────────────────

/** GET /api/v1/orders/restaurant — All orders for logged-in restaurant owner */
router.get(
  "/restaurant",
  authMiddleware,
  roleMiddleware([ROLES.KITCHEN, ROLES.ADMIN]),
  controller.listRestaurantOrders
);

/** PATCH /api/v1/orders/:orderId/status — Update order status */
router.patch(
  "/:orderId/status",
  authMiddleware,
  roleMiddleware([ROLES.KITCHEN, ROLES.DELIVERY, ROLES.ADMIN]),
  validate(updateOrderStatusSchema),
  controller.updateStatus
);

/** GET /api/v1/orders/:orderId — Order detail */
router.get("/:orderId", authMiddleware, controller.getOrderDetail);

/** DELETE /api/v1/orders/:orderId — Cancel order */
router.delete("/:orderId", authMiddleware, roleMiddleware([ROLES.USER]), controller.cancelOrder);

/** POST /api/v1/orders/:orderId/payment — Initiate Razorpay payment */
router.post("/:orderId/payment", authMiddleware, roleMiddleware([ROLES.USER]), controller.initiatePayment);

/** POST /api/v1/orders/:orderId/payment/verify — Verify Razorpay payment */
router.post("/:orderId/payment/verify", authMiddleware, roleMiddleware([ROLES.USER]), controller.verifyPayment);

export default router;
