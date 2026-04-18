import { Router } from "express";
import { ROLES } from "../../common/constants";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as controller from "./kitchen.controller";
import {
  createKitchenSchema,
  createMenuItemSchema,
  updateKitchenSchema,
  updateMenuItemSchema
} from "./kitchen.validation";

const router = Router();

router.get("/", controller.listKitchens);
router.get("/:kitchenId/menu", controller.listMenu);
router.post("/", authMiddleware, roleMiddleware([ROLES.KITCHEN]), validate(createKitchenSchema), controller.createKitchen);
router.patch("/me", authMiddleware, roleMiddleware([ROLES.KITCHEN]), validate(updateKitchenSchema), controller.updateKitchen);
router.post("/me/menu", authMiddleware, roleMiddleware([ROLES.KITCHEN]), validate(createMenuItemSchema), controller.addMenuItem);
router.patch("/me/menu/:menuItemId", authMiddleware, roleMiddleware([ROLES.KITCHEN]), validate(updateMenuItemSchema), controller.updateMenuItem);

export default router;
