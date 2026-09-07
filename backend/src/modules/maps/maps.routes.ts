import { Router } from "express";
import * as ctrl from "./maps.controller";

const router = Router();

router.get("/autocomplete", ctrl.autocomplete);
router.get("/details", ctrl.placeDetails);

export default router;
