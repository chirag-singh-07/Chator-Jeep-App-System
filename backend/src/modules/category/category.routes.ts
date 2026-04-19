import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { ROLES } from "../../common/constants";
import * as ctrl from "./category.controller";

const router = Router();

// Public: List all categories
router.get("/", ctrl.getCategories);

// Authenticated Admin Routes
router.use(authMiddleware, roleMiddleware([ROLES.ADMIN]));

router.post("/", ctrl.createCategory);
router.get("/:id", ctrl.getCategory);
router.patch("/:id", ctrl.updateCategory);
router.delete("/:id", ctrl.deleteCategory);

export default router;
