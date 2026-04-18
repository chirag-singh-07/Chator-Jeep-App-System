import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as controller from "./auth.controller";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refresh);
router.post("/logout", authMiddleware, controller.logout);

export default router;
