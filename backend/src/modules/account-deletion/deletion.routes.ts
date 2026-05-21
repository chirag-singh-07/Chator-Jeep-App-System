import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as controller from "./deletion.controller";

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────
/**
 * POST /api/v1/account/request-deletion
 * Request account deletion (no auth required)
 */
router.post("/request-deletion", controller.requestDeletion);

/**
 * GET /api/v1/account/delete/confirm/:requestId
 * Confirm deletion request via email link (no auth required)
 */
router.get("/delete/confirm/:requestId", controller.confirmDeletion);

/**
 * GET /api/v1/account/delete/cancel/:requestId
 * Cancel deletion request via email link (no auth required)
 */
router.get("/delete/cancel/:requestId", controller.cancelDeletion);

// ─── Admin Routes ────────────────────────────────────────────────────────────
/**
 * GET /api/v1/admin/account-deletions/stats
 * Get deletion statistics
 */
router.get(
  "/admin/account-deletions/stats",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getDeletionStats
);

/**
 * GET /api/v1/admin/account-deletions/search
 * Search deletion requests
 */
router.get(
  "/admin/account-deletions/search",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.searchDeletions
);

/**
 * GET /api/v1/admin/account-deletions
 * Get all deletion requests
 */
router.get(
  "/admin/account-deletions",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getAllDeletions
);

/**
 * GET /api/v1/admin/account-deletions/:requestId
 * Get deletion request details
 */
router.get(
  "/admin/account-deletions/:requestId",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getDeletionDetails
);

/**
 * POST /api/v1/admin/account-deletions/:requestId/cancel
 * Cancel deletion request (admin can override)
 */
router.post(
  "/admin/account-deletions/:requestId/cancel",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.adminCancelDeletion
);

export default router;
