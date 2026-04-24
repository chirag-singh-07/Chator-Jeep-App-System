import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as controller from "./system.controller";

const router = Router();

// GET /api/v1/system/logs?type=system|cron
router.get(
  "/logs",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getSystemLogs
);

export default router;
