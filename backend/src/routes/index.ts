import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";
import kitchenRoutes from "../modules/kitchen/kitchen.routes";
import orderRoutes from "../modules/order/order.routes";
import deliveryRoutes from "../modules/delivery/delivery.routes";
import paymentRoutes from "../modules/payment/payment.routes";
import notificationRoutes from "../modules/notification/notification.routes";
import uploadRoutes from "../modules/upload/upload.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/kitchens", kitchenRoutes);
router.use("/orders", orderRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/uploads", uploadRoutes);

export default router;
