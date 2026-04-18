import { Router } from "express";
import * as controller from "./payment.controller";

const router = Router();
router.get("/info", controller.info);

export default router;
