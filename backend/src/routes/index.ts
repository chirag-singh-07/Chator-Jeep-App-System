import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";
import restaurantRoutes from "../modules/restaurant/restaurant.routes";
import orderRoutes from "../modules/order/order.routes";
import deliveryRoutes from "../modules/delivery/delivery.routes";
import paymentRoutes from "../modules/payment/payment.routes";
import notificationRoutes from "../modules/notification/notification.routes";
import uploadRoutes from "../modules/upload/upload.routes";
import categoryRoutes from "../modules/category/category.routes";
import addonRoutes from "../modules/addon/addon.routes";
import walletRoutes from "../modules/wallet/wallet.routes";
import couponRoutes from "../modules/coupon/coupon.routes";
import systemRoutes from "../modules/system/system.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/orders", orderRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/uploads", uploadRoutes);
router.use("/categories", categoryRoutes);
router.use("/addons", addonRoutes);
router.use("/wallet", walletRoutes);
router.use("/coupons", couponRoutes);
router.use("/system", systemRoutes);

export default router;
