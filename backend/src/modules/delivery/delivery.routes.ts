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
  registerDeliverySchema,
  updateAvailabilitySchema,
  updateDeliveryStatusSchema,
  updateLocationSchema,
} from "./delivery.validation";

const router = Router();

// ============================================
// DELIVERY PARTNER ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/delivery/me/dashboard:
 *   get:
 *     tags:
 *       - Delivery
 *     summary: Get delivery partner dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get("/me/dashboard", authMiddleware, roleMiddleware([ROLES.DELIVERY]), controller.dashboard);

/**
 * @openapi
 * /api/v1/delivery/register:
 *   post:
 *     tags:
 *       - Delivery
 *     summary: Register as delivery partner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleType
 *               - licenseNumber
 *             properties:
 *               vehicleType:
 *                 type: string
 *                 enum: [BIKE, SCOOTER, CAR]
 *               licenseNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 */
router.post("/register", authMiddleware, roleMiddleware([ROLES.DELIVERY, ROLES.USER]), validate(registerDeliverySchema), controller.register);

/**
 * @openapi
 * /api/v1/delivery/profile:
 *   get:
 *     tags:
 *       - Delivery
 *     summary: Get delivery partner profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get("/profile", authMiddleware, roleMiddleware([ROLES.DELIVERY]), controller.getProfile);

/**
 * @openapi
 * /api/v1/delivery/availability:
 *   patch:
 *     tags:
 *       - Delivery
 *     summary: Update availability status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isAvailable
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability updated
 */
router.patch("/availability", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateAvailabilitySchema), controller.updateAvailability);

/**
 * @openapi
 * /api/v1/delivery/orders/assigned:
 *   get:
 *     tags:
 *       - Delivery
 *     summary: Get assigned orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned orders
 */
router.get("/orders/assigned", authMiddleware, roleMiddleware([ROLES.DELIVERY]), controller.myAssignedOrders);

/**
 * @openapi
 * /api/v1/delivery/orders/{orderId}:
 *   get:
 *     tags:
 *       - Delivery
 *     summary: Get assigned order details
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
router.get("/orders/:orderId", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(getOrderDetailSchema), controller.getAssignedOrder);

/**
 * @openapi
 * /api/v1/delivery/orders/{orderId}/accept:
 *   patch:
 *     tags:
 *       - Delivery
 *     summary: Accept delivery assignment
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
 *         description: Order accepted
 */
router.patch("/orders/:orderId/accept", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(acceptAssignmentSchema), controller.acceptOrder);

/**
 * @openapi
 * /api/v1/delivery/orders/{orderId}/status:
 *   patch:
 *     tags:
 *       - Delivery
 *     summary: Update delivery status
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
 *                 enum: [ACCEPTED, PICKED_UP, DELIVERED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/orders/:orderId/status", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateDeliveryStatusSchema), controller.updateStatus);

/**
 * @openapi
 * /api/v1/delivery/location:
 *   post:
 *     tags:
 *       - Delivery
 *     summary: Update current location
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated
 */
router.post("/location", authMiddleware, roleMiddleware([ROLES.DELIVERY]), validate(updateLocationSchema), controller.updateLocation);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/delivery/admin/partners:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all delivery partners
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery partners
 */
router.get("/admin/partners", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.adminListAllPartners);

/**
 * @openapi
 * /api/v1/delivery/admin/partners/{partnerId}/status:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update delivery partner status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partnerId
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
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *     responses:
 *       200:
 *         description: Partner status updated
 */
router.patch("/admin/partners/:partnerId/status", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.adminUpdatePartnerStatus);

/**
 * @openapi
 * /api/v1/delivery/assign/{orderId}:
 *   post:
 *     tags:
 *       - Delivery
 *     summary: Assign an order to delivery partner
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
 *               - deliveryPartnerId
 *             properties:
 *               deliveryPartnerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order assigned
 */
router.post("/assign/:orderId", authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.KITCHEN]), validate(assignOrderSchema), controller.assignOrder);

export default router;