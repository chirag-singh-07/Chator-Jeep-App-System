import { Router } from "express";
import * as controller from "./payment.controller";

const router = Router();
router.get("/info", controller.info);
router.get("/phonepe/redirect", controller.phonePeRedirect);
router.post("/phonepe/redirect", controller.phonePeRedirect);

export default router;
