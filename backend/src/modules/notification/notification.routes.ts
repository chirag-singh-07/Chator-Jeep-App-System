import { Router } from "express";
import * as controller from "./notification.controller";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { ROLES } from "../../common/constants/roles";

const router = Router();

router.get("/info", controller.info);

// Admin Broadcast routes
router.post("/broadcast", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.broadcast);
router.get("/broadcast/history", authMiddleware, roleMiddleware([ROLES.ADMIN]), controller.getBroadcastHistory);

export default router;
