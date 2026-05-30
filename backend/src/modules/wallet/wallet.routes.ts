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

// ============================================
// RESTAURANT (KITCHEN) ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/wallet/stats:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get restaurant wallet stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet statistics
 */
router.get("/stats", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.getMyStats);

/**
 * @openapi
 * /api/v1/wallet/withdrawals:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get restaurant withdrawal history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of withdrawals
 */
router.get("/withdrawals", authMiddleware, roleMiddleware(["KITCHEN"]), ctrl.getMyWithdrawalHistory);

/**
 * @openapi
 * /api/v1/wallet/withdraw:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Create withdrawal request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               bankAccount:
 *                 type: string
 *     responses:
 *       201:
 *         description: Withdrawal request created
 */
router.post("/withdraw", authMiddleware, roleMiddleware(["KITCHEN"]), validate(createWithdrawalSchema), ctrl.createWithdrawalRequest);

// ============================================
// DELIVERY PARTNER ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/wallet/delivery/overview:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get delivery wallet overview
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet overview
 */
router.get("/delivery/overview", authMiddleware, roleMiddleware(["DELIVERY"]), ctrl.getDeliveryWalletOverview);

/**
 * @openapi
 * /api/v1/wallet/delivery/payouts:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get delivery payout history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payouts
 */
router.get("/delivery/payouts", authMiddleware, roleMiddleware(["DELIVERY"]), ctrl.getDeliveryPayoutHistory);

/**
 * @openapi
 * /api/v1/wallet/delivery/transactions:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: Get delivery transaction history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/delivery/transactions", authMiddleware, roleMiddleware(["DELIVERY"]), ctrl.getDeliveryTransactions);

/**
 * @openapi
 * /api/v1/wallet/delivery/payouts:
 *   post:
 *     tags:
 *       - Wallet
 *     summary: Create delivery payout request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payout request created
 */
router.post("/delivery/payouts", authMiddleware, roleMiddleware(["DELIVERY"]), validate(createDeliveryPayoutSchema), ctrl.createDeliveryPayoutRequest);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @openapi
 * /api/v1/wallet/admin/withdrawals:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all restaurant withdrawal requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: List of withdrawals
 */
router.get("/admin/withdrawals", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminListWithdrawals);

/**
 * @openapi
 * /api/v1/wallet/admin/withdrawals/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Process restaurant withdrawal request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal processed
 */
router.patch("/admin/withdrawals/:id", authMiddleware, roleMiddleware(["ADMIN"]), validate(processRestaurantWithdrawalSchema), ctrl.adminProcessRequest);

/**
 * @openapi
 * /api/v1/wallet/admin/delivery-payouts:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all delivery payout requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of delivery payouts
 */
router.get("/admin/delivery-payouts", authMiddleware, roleMiddleware(["ADMIN"]), ctrl.adminListDeliveryPayouts);

/**
 * @openapi
 * /api/v1/wallet/admin/delivery-payouts/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Process delivery payout request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Payout processed
 */
router.patch("/admin/delivery-payouts/:id", authMiddleware, roleMiddleware(["ADMIN"]), validate(processDeliveryPayoutSchema), ctrl.adminProcessDeliveryPayout);

export default router;