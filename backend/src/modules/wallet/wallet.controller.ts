import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import * as service from "./wallet.service";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";

export const getMyStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await service.getWalletStats(req.user!.userId);
    res.status(200).json({ success: true, data: stats });
  }
);

export const getMyWithdrawalHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const history = await service.getMyWithdrawals(req.user!.userId);
    res.status(200).json({ success: true, data: history });
  }
);

export const createWithdrawalRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { amount } = req.body;
    const request = await service.requestWithdrawal(req.user!.userId, Number(amount));
    res.status(201).json({ success: true, message: "Withdrawal request submitted.", data: request });
  }
);

// Admin Handlers
export const adminListWithdrawals = asyncHandler(
  async (req: Request, res: Response) => {
    const withdrawals = await service.adminListAllWithdrawals(req.query.status as string);
    res.status(200).json({ success: true, data: withdrawals });
  }
);

export const adminProcessRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, note } = req.body;
    const result = await service.adminProcessWithdrawal(String(req.params.id), status, note);
    res.status(200).json({ success: true, message: `Withdrawal ${status.toLowerCase()}.`, data: result });
  }
);

export const getDeliveryWalletOverview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const overview = await service.getDeliveryWalletOverview(req.user!.userId);
    res.status(200).json({ success: true, data: overview });
  }
);

export const getDeliveryPayoutHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const payouts = await service.getDeliveryPayoutRequests(req.user!.userId);
    res.status(200).json({ success: true, data: payouts });
  }
);

export const getDeliveryTransactions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const transactions = await service.getDeliveryWalletTransactions(req.user!.userId);
    res.status(200).json({ success: true, data: transactions });
  }
);

export const createDeliveryPayoutRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const request = await service.requestDeliveryPayout(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: "Delivery payout request submitted.",
      data: request,
    });
  }
);

export const adminListDeliveryPayouts = asyncHandler(
  async (req: Request, res: Response) => {
    const payouts = await service.adminListDeliveryPayouts(req.query.status as string);
    res.status(200).json({ success: true, data: payouts });
  }
);

export const adminProcessDeliveryPayout = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, note } = req.body;
    const result = await service.adminProcessDeliveryPayout(String(req.params.id), status, note);
    res.status(200).json({
      success: true,
      message: `Delivery payout ${status.toLowerCase()}.`,
      data: result,
    });
  }
);
