import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as ctrl from "./kitchen.controller";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────────
/** POST /api/v1/kitchens/register — Kitchen owner signs up */
router.post("/register", ctrl.registerKitchen);

/** POST /api/v1/kitchens/login — Kitchen owner logs in, returns status */
router.post("/login", ctrl.loginKitchen);

/** GET /api/v1/kitchens — Public list of verified kitchens */
router.get("/", ctrl.listKitchens);

/** GET /api/v1/kitchens/:kitchenId/menu — Public menu for a kitchen */
router.get("/:kitchenId/menu", ctrl.listMenu);

// ─── Kitchen User (authenticated) ─────────────────────────────────────────────
/** GET /api/v1/kitchens/me/status — Check verification status */
router.get(
  "/me/status",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.getMyStatus
);

/** POST /api/v1/kitchens/me/create — Legacy create (use /register instead) */
router.post(
  "/me/create",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.createKitchen
);

/** PATCH /api/v1/kitchens/me — Update kitchen profile */
router.patch(
  "/me",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.updateKitchen
);

/** POST /api/v1/kitchens/me/menu — Add menu item (VERIFIED only) */
router.post(
  "/me/menu",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.addMenuItem
);

/** PATCH /api/v1/kitchens/me/menu/:menuItemId — Update menu item */
router.patch(
  "/me/menu/:menuItemId",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.updateMenuItem
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
/** GET /api/v1/kitchens/admin/all — List all kitchens with filters */
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminListKitchens
);

/** GET /api/v1/kitchens/admin/:id — Full kitchen detail for review */
router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminGetKitchen
);

/** PATCH /api/v1/kitchens/admin/:id/approve — Approve kitchen */
router.patch(
  "/admin/:id/approve",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminApprove
);

/** PATCH /api/v1/kitchens/admin/:id/reject — Reject with reason */
router.patch(
  "/admin/:id/reject",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminReject
);

/** PATCH /api/v1/kitchens/admin/:id/review — Mark for further review */
router.patch(
  "/admin/:id/review",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminMarkReview
);

export default router;
