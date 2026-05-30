import { Router } from "express";
import { ROLES } from "../../common/constants";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as controller from "./order.controller";
import {
  createOrderSchema,
  onlineCheckoutPaymentSchema,
  updateOrderStatusSchema,
  verifyOnlineCheckoutPaymentSchema,
} from "./order.validation";

const router = Router();

// ============================================
// CUSTOMER ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Place a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - items
 *             properties:
 *               restaurantId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   landmark:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post("/", authMiddleware, roleMiddleware([ROLES.USER]), validate(createOrderSchema), controller.createOrder);

/**
 * @openapi
 * /api/v1/orders/payment/checkout:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create Razorpay payment for checkout
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - items
 *               - deliveryAddress
 *             properties:
 *               restaurantId:
 *                 type: string
 *               items:
 *                 type: array
 *               deliveryAddress:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment initiated
 */
router.post("/payment/checkout", authMiddleware, roleMiddleware([ROLES.USER]), validate(onlineCheckoutPaymentSchema), controller.initiateCheckoutPayment);

/**
 * @openapi
 * /api/v1/orders/payment/checkout-preview:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Preview checkout prices before payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Price preview
 */
router.post("/payment/checkout-preview", authMiddleware, roleMiddleware([ROLES.USER]), validate(onlineCheckoutPaymentSchema), controller.checkoutPreview);

/**
 * @openapi
 * /api/v1/orders/payment/verify-create:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Verify payment and create order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */
router.post("/payment/verify-create", authMiddleware, roleMiddleware([ROLES.USER]), validate(verifyOnlineCheckoutPaymentSchema), controller.verifyCheckoutPayment);

/**
 * @openapi
 * /api/v1/orders/my:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get user's orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/my", authMiddleware, roleMiddleware([ROLES.USER]), controller.listMyOrders);

/**
 * @openapi
 * /api/v1/orders/me:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get user's orders (legacy alias)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/me", authMiddleware, roleMiddleware([ROLES.USER]), controller.listMyOrders);

/**
 * @openapi
 * /api/v1/orders/wallet:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get user wallet balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance
 */
router.get("/wallet", authMiddleware, roleMiddleware([ROLES.USER]), controller.getWalletBalance);

/**
 * @openapi
 * /api/v1/orders/wallet/transactions:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get user wallet transaction history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/wallet/transactions", authMiddleware, roleMiddleware([ROLES.USER]), controller.getWalletTransactions);

// ============================================
// RESTAURANT / ADMIN ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/orders/restaurant:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get restaurant orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of restaurant orders
 */
router.get("/restaurant", authMiddleware, roleMiddleware([ROLES.KITCHEN, ROLES.ADMIN]), controller.listRestaurantOrders);

/**
 * @openapi
 * /api/v1/orders/admin/all:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all orders (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get("/admin/all", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.adminListOrders);

/**
 * @openapi
 * /api/v1/orders/{orderId}/status:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACCEPTED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch("/:orderId/status", authMiddleware, roleMiddleware([ROLES.KITCHEN, ROLES.DELIVERY, ROLES.ADMIN]), validate(updateOrderStatusSchema), controller.updateStatus);

/**
 * @openapi
 * /api/v1/orders/{orderId}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
router.get("/:orderId", authMiddleware, controller.getOrderDetail);

/**
 * @openapi
 * /api/v1/orders/{orderId}:
 *   delete:
 *     tags:
 *       - Orders
 *     summary: Cancel an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.delete("/:orderId", authMiddleware, roleMiddleware([ROLES.USER]), controller.cancelOrder);

/**
 * @openapi
 * /api/v1/orders/{orderId}/payment:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Initiate PhonePe payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment initiated
 */
router.post("/:orderId/payment", authMiddleware, roleMiddleware([ROLES.USER]), controller.initiatePayment);

/**
 * @openapi
 * /api/v1/orders/{orderId}/payment/status:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get PhonePe payment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 */
router.get("/:orderId/payment/status", authMiddleware, roleMiddleware([ROLES.USER]), controller.getPaymentStatus);

/**
 * @openapi
 * /api/v1/orders/{orderId}/payment/verify:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Verify Razorpay payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post("/:orderId/payment/verify", authMiddleware, roleMiddleware([ROLES.USER]), controller.verifyPayment);

/**
 * @openapi
 * /api/v1/orders/admin/{orderId}/refund:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin refund an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
router.post("/admin/:orderId/refund", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.adminRefundOrder);

export default router;