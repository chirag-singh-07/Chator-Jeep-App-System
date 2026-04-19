import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { ROLES } from "../../common/constants";
import { 
  createAddon, 
  getMyAddons, 
  adminGetAllAddons, 
  updateAddon, 
  deleteAddon 
} from "./addon.controller";

const router = Router();

// All addon routes require authentication and KITCHEN (Restaurant) role
router.use(authMiddleware, roleMiddleware([ROLES.KITCHEN, ROLES.ADMIN]));

router.post("/", createAddon);
router.get("/me", getMyAddons);
router.get("/admin/all", roleMiddleware([ROLES.ADMIN]), adminGetAllAddons);
router.patch("/:id", updateAddon);
router.delete("/:id", deleteAddon);

export default router;
