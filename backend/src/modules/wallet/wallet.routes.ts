import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { roleMiddleware } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import * as ctrl from "./wallet.controller";
import {
  createDeliveryPayoutSchema,
  createWithdrawalSchema,
  processDeliveryPayoutSchema,
  processRestaurantWithdrawalSchema,
} from "./wallet.validation";

const router = Router();

// ─── Restaurant Routes ────────────────────────────────────────────────────────
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.getMyStats
);

router.get(
  "/withdrawals",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  ctrl.getMyWithdrawalHistory
);

router.post(
  "/withdraw",
  authMiddleware,
  roleMiddleware(["KITCHEN"]),
  validate(createWithdrawalSchema),
  ctrl.createWithdrawalRequest
);

router.get(
  "/delivery/overview",
  authMiddleware,
  roleMiddleware(["DELIVERY"]),
  ctrl.getDeliveryWalletOverview
);

router.get(
  "/delivery/payouts",
  authMiddleware,
  roleMiddleware(["DELIVERY"]),
  ctrl.getDeliveryPayoutHistory
);

router.get(
  "/delivery/transactions",
  authMiddleware,
  roleMiddleware(["DELIVERY"]),
  ctrl.getDeliveryTransactions
);

router.post(
  "/delivery/payouts",
  authMiddleware,
  roleMiddleware(["DELIVERY"]),
  validate(createDeliveryPayoutSchema),
  ctrl.createDeliveryPayoutRequest
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get(
  "/admin/withdrawals",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminListWithdrawals
);

router.patch(
  "/admin/withdrawals/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validate(processRestaurantWithdrawalSchema),
  ctrl.adminProcessRequest
);

router.get(
  "/admin/delivery-payouts",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ctrl.adminListDeliveryPayouts
);

router.patch(
  "/admin/delivery-payouts/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validate(processDeliveryPayoutSchema),
  ctrl.adminProcessDeliveryPayout
);

export default router;
