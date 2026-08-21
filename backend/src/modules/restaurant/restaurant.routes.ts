import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as ctrl from "./restaurant.controller";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/restaurants:
 *   get:
 *     tags:
 *       - Restaurants
 *     summary: List all active restaurants
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by restaurant name
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *         description: Filter by cuisine type
 *     responses:
 *       200:
 *         description: List of active restaurants
 */
router.get("/", ctrl.listRestaurants);

/**
 * @openapi
 * /api/v1/restaurants/menu/popular:
 *   get:
 *     tags:
 *       - Restaurants
 *     summary: List popular items across all restaurants
 *     responses:
 *       200:
 *         description: List of popular menu items
 */
router.get("/menu/popular", ctrl.listPopularItems);

/**
 * @openapi
 * /api/v1/restaurants/reviews:
 *   post:
 *     tags:
 *       - Restaurants
 *     summary: Submit a review for an order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - rating
 *             properties:
 *               orderId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted
 */
router.post("/reviews", authMiddleware, ctrl.createReview);

/**
 * @openapi
 * /api/v1/restaurants/register:
 *   post:
 *     tags:
 *       - Restaurants
 *     summary: Register a new restaurant (Kitchen Partner)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant registered
 */
router.post("/register", ctrl.registerRestaurant);

/**
 * @openapi
 * /api/v1/restaurants/register/precheck:
 *   post:
 *     tags:
 *       - Restaurants
 *     summary: Validate restaurant registration before payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post("/register/precheck", ctrl.precheckRestaurantRegistration);

/**
 * @openapi
 * /api/v1/restaurants/login:
 *   post:
 *     tags:
 *       - Restaurants
 *     summary: Restaurant owner login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", ctrl.loginRestaurant);

// ============================================
// RESTAURANT USER ROUTES (Authenticated Kitchen)
// ============================================

/**
 * @openapi
 * /api/v1/restaurants/me/status:
 *   get:
 *     tags:
 *       - Restaurants
 *     summary: Get restaurant verification status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant status
 */
router.get("/me/status", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.getMyStatus);

/**
 * @openapi
 * /api/v1/restaurants/me/menu:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get restaurant's menu items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get("/me/menu", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.listMyMenu);

/**
 * @openapi
 * /api/v1/restaurants/me/menu:
 *   post:
 *     tags:
 *       - Menu
 *     summary: Add a menu item
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
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discountPrice:
 *                 type: number
 *               category:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menu item added
 */
router.post("/me/menu", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.addMenuItem);

/**
 * @openapi
 * /api/v1/restaurants/me/menu/{id}:
 *   patch:
 *     tags:
 *       - Menu
 *     summary: Update a menu item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discountPrice:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu item updated
 */
router.patch("/me/menu/:id", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.updateMenuItem);

/**
 * @openapi
 * /api/v1/restaurants/me/menu/{id}:
 *   delete:
 *     tags:
 *       - Menu
 *     summary: Delete a menu item
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
 *         description: Menu item deleted
 */
router.delete("/me/menu/:id", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.deleteMenuItem);

/**
 * @openapi
 * /api/v1/restaurants/me/menu/{id}/stock:
 *   patch:
 *     tags:
 *       - Menu
 *     summary: Toggle menu item stock availability
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - isAvailable
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Stock toggled
 */
router.patch("/me/menu/:id/stock", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.updateMenuItemStock);

/**
 * @openapi
 * /api/v1/restaurants/me/branding:
 *   patch:
 *     tags:
 *       - Restaurants
 *     summary: Update restaurant logo and banner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *               banner:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branding updated
 */
router.patch("/me/branding", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.updateMyBranding);

/**
 * @openapi
 * /api/v1/restaurants/me/legal-docs:
 *   patch:
 *     tags:
 *       - Restaurants
 *     summary: Update legal documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fssaiNumber:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Legal docs updated
 */
router.patch("/me/legal-docs", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.updateMyLegalDocs);

/**
 * @openapi
 * /api/v1/restaurants/me/status:
 *   patch:
 *     tags:
 *       - Restaurants
 *     summary: Toggle restaurant open/closed status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isOpen
 *             properties:
 *               isOpen:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status toggled
 */
router.patch("/me/status", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.updateMyOpenStatus);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/restaurants/admin/all:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all restaurants with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, FLAGGED]
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get("/admin/all", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminListRestaurants);

/**
 * @openapi
 * /api/v1/restaurants/admin/menu:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all menu items across restaurants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get("/admin/menu", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminListMenuItems);

/**
 * @openapi
 * /api/v1/restaurants/admin/{restaurantId}/menu/bulk:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Bulk upload menu items for a restaurant (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       201:
 *         description: Items uploaded successfully
 */
router.post(
  "/admin/:restaurantId/menu/bulk",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminBulkUploadMenuItems
);

router.post(
  "/admin/menu/bulk",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminBulkUploadMenuItems
);

router.delete(
  "/admin/menu/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminDeleteMenuItem
);

router.patch(
  "/admin/menu/:id/stock",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminToggleMenuItemStock
);

/**
 * @openapi
 * /api/v1/restaurants/admin/create:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new restaurant (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created
 */
router.post("/admin/create", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminCreateRestaurant);

/**
 * @openapi
 * /api/v1/restaurants/admin/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get restaurant details
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
 *         description: Restaurant details
 */
router.get("/admin/:id", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminGetRestaurant);

/**
 * @openapi
 * /api/v1/restaurants/admin/{id}/approve:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Approve a restaurant
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
 *         description: Restaurant approved
 */
router.patch("/admin/:id/approve", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminApprove);

/**
 * @openapi
 * /api/v1/restaurants/admin/{id}/reject:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Reject a restaurant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant rejected
 */
router.patch("/admin/:id/reject", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminReject);

/**
 * @openapi
 * /api/v1/restaurants/admin/{id}/flag:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Flag a restaurant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant flagged
 */
router.patch("/admin/:id/flag", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminFlag);

/**
 * @openapi
 * /api/v1/restaurants/admin/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a restaurant
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
 *         description: Restaurant deleted
 */
router.delete("/admin/:id", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminDeleteRestaurant);

/**
 * @openapi
 * /api/v1/restaurants/admin/{id}/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get restaurant performance statistics
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
 *         description: Restaurant stats
 */
router.get("/admin/:id/stats", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminGetRestaurantStats);

/**
 * @openapi
 * /api/v1/restaurants/{id}:
 *   get:
 *     tags:
 *       - Restaurants
 *     summary: Get restaurant details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant details
 */
router.get("/:id", ctrl.getRestaurant);

/**
 * @openapi
 * /api/v1/restaurants/{restaurantId}/menu:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get public menu for a restaurant
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant menu
 */
router.get("/:restaurantId/menu", ctrl.listRestaurantMenu);

export default router;