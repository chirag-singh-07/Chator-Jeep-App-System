import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as controller from "./user.controller";

const router = Router();

// ─── Public/Auth ─────────────────────────────────────────────────────────────
router.get("/me", authMiddleware, controller.me);

// ─── Admin Routes ────────────────────────────────────────────────────────────
/** GET /api/v1/users/admin/all — List all platform users */
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.adminListUsers
);

/** POST /api/v1/users/admin/create — Create new Admin user */
router.post(
  "/admin/create",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.adminCreateAdmin
);

/** POST /api/v1/users/admin/delivery — Create new Delivery user */
router.post(
  "/admin/delivery",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.adminCreateDelivery
);

/** GET /api/v1/users/admin/:id — Get user details */
router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.adminGetUser
);

export default router;
