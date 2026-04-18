import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import * as controller from "./user.controller";

const router = Router();
router.get("/me", authMiddleware, controller.me);

export default router;
