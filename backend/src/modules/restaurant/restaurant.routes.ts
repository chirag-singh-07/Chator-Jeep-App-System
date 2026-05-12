import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as ctrl from "./restaurant.controller";

const router = Router();

// Public
/** GET /api/v1/restaurants - List all active restaurants */
router.get("/", ctrl.listRestaurants);

/** GET /api/v1/restaurants/menu/popular - List popular items across all restaurants */
router.get("/menu/popular", ctrl.listPopularItems);



/** POST /api/v1/restaurants/reviews - Submit a review */
router.post("/reviews", authMiddleware, ctrl.createReview);

/** POST /api/v1/restaurants/register - Restaurant owner signs up */
router.post("/register", ctrl.registerRestaurant);

/** POST /api/v1/restaurants/login - Restaurant owner logs in */
router.post("/login", ctrl.loginRestaurant);

// Restaurant User (authenticated)
/** GET /api/v1/restaurants/me/status - Check verification status */
router.get(
  "/me/status",
  authMiddleware,
  roleMiddleware(["KITCHEN"]), // Still using KITCHEN role internally
  ctrl.getMyStatus
);

/** GET /api/v1/restaurants/me/menu - List this restaurant's menu items */
router.get(
  "/me/menu",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.listMyMenu
);

/** POST /api/v1/restaurants/me/menu - Add menu item during onboarding or after activation */
router.post(
  "/me/menu",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.addMenuItem
);

/** PATCH /api/v1/restaurants/me/menu/:id - Update menu item */
router.patch(
  "/me/menu/:id",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.updateMenuItem
);

/** DELETE /api/v1/restaurants/me/menu/:id - Delete menu item */
router.delete(
  "/me/menu/:id",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.deleteMenuItem
);

/** PATCH /api/v1/restaurants/me/menu/:id/stock - Toggle stock */
router.patch(
  "/me/menu/:id/stock",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.updateMenuItemStock
);

/** PATCH /api/v1/restaurants/me/branding - Update logo and banner */
router.patch(
  "/me/branding",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.updateMyBranding
);

/** PATCH /api/v1/restaurants/me/legal-docs - Update legal documents */
router.patch(
  "/me/legal-docs",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.updateMyLegalDocs
);

/** PATCH /api/v1/restaurants/me/status - Toggle restaurant open/closed */
router.patch(
  "/me/status",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.updateMyOpenStatus
);



// Admin Routes
/** GET /api/v1/restaurants/admin/all - List all restaurants with filters */
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminListRestaurants
);

/** GET /api/v1/restaurants/admin/menu - List all menu items across restaurants */
router.get(
  "/admin/menu",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminListMenuItems
);

/** GET /api/v1/restaurants/admin/:id - Full restaurant detail for review */
router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminGetRestaurant
);

/** PATCH /api/v1/restaurants/admin/:id/approve - Approve restaurant as ACTIVE */
router.patch(
  "/admin/:id/approve",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminApprove
);

/** PATCH /api/v1/restaurants/admin/:id/reject - Reject restaurant as REJECTED */
router.patch(
  "/admin/:id/reject",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminReject
);

/** PATCH /api/v1/restaurants/admin/:id/flag - Flag restaurant as FLAGGED */
router.patch(
  "/admin/:id/flag",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminFlag
);

/** DELETE /api/v1/restaurants/admin/:id - Delete restaurant and all its assets */
router.delete(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminDeleteRestaurant
);

/** GET /api/v1/restaurants/admin/:id/stats - Performance analytics for a restaurant */
router.get(
  "/admin/:id/stats",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminGetRestaurantStats
);

/** GET /api/v1/restaurants/:id - Get restaurant details */
router.get("/:id", ctrl.getRestaurant);

/** GET /api/v1/restaurants/:restaurantId/menu - Public menu for a restaurant */
router.get("/:restaurantId/menu", ctrl.listRestaurantMenu);

export default router;
