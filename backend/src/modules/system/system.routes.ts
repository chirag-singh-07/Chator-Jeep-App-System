import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import * as controller from "./system.controller";

const router = Router();

router.get(
  "/logs",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getSystemLogs,
);
router.get(
  "/settings",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.getSettings,
);
router.post(
  "/settings",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  controller.updateSetting,
);

export default router;
