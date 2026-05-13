import { Router } from "express";
import * as controller from "./payment.controller";

const router = Router();
router.get("/info", controller.info);
router.get("/restaurant-registration/plan", controller.restaurantRegistrationPlan);
router.post("/restaurant-registration/order", controller.createRestaurantRegistrationPayment);
router.post("/restaurant-registration/verify", controller.verifyRestaurantRegistration);
router.post("/razorpay/webhook", controller.razorpayWebhook);
router.get("/phonepe/redirect", controller.phonePeRedirect);
router.post("/phonepe/redirect", controller.phonePeRedirect);

export default router;
