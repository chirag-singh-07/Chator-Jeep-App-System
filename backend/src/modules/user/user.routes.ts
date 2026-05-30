import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as controller from "./user.controller";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, controller.me);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/users/admin/all:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all platform users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, KITCHEN, DELIVERY, ADMIN]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/admin/all", authMiddleware, roleMiddleware(["ADMIN"]), controller.adminListUsers);

/**
 * @openapi
 * /api/v1/users/admin/create:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new admin user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created
 */
router.post("/admin/create", authMiddleware, roleMiddleware(["ADMIN"]), controller.adminCreateAdmin);

/**
 * @openapi
 * /api/v1/users/admin/delivery:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new delivery partner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery partner created
 */
router.post("/admin/delivery", authMiddleware, roleMiddleware(["ADMIN"]), controller.adminCreateDelivery);

/**
 * @openapi
 * /api/v1/users/admin/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get user details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get("/admin/:id", authMiddleware, roleMiddleware(["ADMIN"]), controller.adminGetUser);

/**
 * @openapi
 * /api/v1/users/admin/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/admin/:id", authMiddleware, roleMiddleware(["ADMIN"]), controller.adminDeleteUser);

export default router;