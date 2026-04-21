import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import {
  uploadSingle,
  uploadMultiple,
  uploadFields,
} from "../../common/middleware/upload.middleware";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadRestaurantBrand,
  uploadAvatar,
  getPresignedUploadUrl,
  deleteImages,
  getAllMedia,
  deleteSingleMedia,
} from "./upload.controller";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { ROLES } from "../../common/constants/roles";

const router = Router();

// All upload routes require a valid JWT
router.use(authMiddleware);

// ─── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/uploads/single
 * Upload one image via server-side processing.
 * Form field: "file"
 * Body fields: folder, profiles (optional comma-separated, default "thumbnail,medium")
 */
router.post("/single", uploadSingle("file"), uploadSingleImage);

/**
 * POST /api/v1/uploads/multiple
 * Upload up to 10 images via server-side processing.
 * Form field: "files"
 * Body fields: folder, profiles
 */
router.post("/multiple", uploadMultiple("files", 10), uploadMultipleImages);

/**
 * POST /api/v1/uploads/restaurant-brand
 * Upload restaurant logo + banner together during onboarding.
 * Form fields: "logo" (image), "banner" (image)
 * → Produces placeholder + thumbnail + medium for logo
 * → Produces placeholder + medium + full for banner
 */
router.post(
  "/restaurant-brand",
  uploadFields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  uploadRestaurantBrand
);

/**
 * POST /api/v1/uploads/avatar
 * Upload a user or delivery agent avatar.
 * Form field: "avatar"
 * → Produces placeholder + thumbnail (square crop)
 */
router.post("/avatar", uploadSingle("avatar"), uploadAvatar);

/**
 * POST /api/v1/uploads/presign
 * Get a pre-signed S3 URL for direct client-side upload (no server bandwidth used).
 * Body (JSON): { folder: string, extension?: string }
 */
router.post("/presign", getPresignedUploadUrl);

router.delete("/", deleteImages);

// Admin dedicated media management routes
router.get("/admin/all", roleMiddleware([ROLES.ADMIN]), getAllMedia);
router.delete("/admin/:key", roleMiddleware([ROLES.ADMIN]), deleteSingleMedia);

export default router;
