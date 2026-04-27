import { AppError } from "../../common/errors/app-error";
import { UserWallet, UserWalletTransaction } from "./user-wallet.model";

const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const ensureWallet = async (userId: string) => {
  let wallet = await UserWallet.findOne({ userId });
  if (!wallet) wallet = await UserWallet.create({ userId, balance: 0 });
  return wallet;
};

/** Get or create wallet balance for a user */
export const getUserWalletBalance = async (userId: string) => {
  const wallet = await ensureWallet(userId);
  return { balance: wallet.balance, walletId: wallet._id.toString() };
};

/** Get wallet transactions */
export const getUserWalletTransactions = async (userId: string) => {
  await ensureWallet(userId);
  return UserWalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
};

/** Add money to user wallet (after Razorpay top-up) */
export const topUpUserWallet = async (userId: string, amount: number, referenceId?: string) => {
  const amt = round(amount);
  if (amt <= 0) throw new AppError("Amount must be positive", 400);

  const wallet = await ensureWallet(userId);
  const updated = await UserWallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: amt } },
    { new: true }
  );

  await UserWalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: "CREDIT",
    amount: amt,
    balanceAfter: updated!.balance,
    description: "Wallet top-up",
    referenceType: "TOPUP",
    referenceId,
  });

  return updated;
};

/** Deduct from user wallet for an order. Returns amount actually deducted. */
export const deductUserWallet = async (
  userId: string,
  requestedAmount: number,
  orderId: string
): Promise<number> => {
  const wallet = await ensureWallet(userId);
  const deductAmount = round(Math.min(requestedAmount, wallet.balance));

  if (deductAmount <= 0) return 0;

  const updated = await UserWallet.findOneAndUpdate(
    { _id: wallet._id, balance: { $gte: deductAmount } },
    { $inc: { balance: -deductAmount } },
    { new: true }
  );

  if (!updated) return 0; // Concurrent modification — return 0 safely

  await UserWalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: "DEBIT",
    amount: deductAmount,
    balanceAfter: updated.balance,
    description: "Payment for order",
    referenceType: "ORDER",
    referenceId: orderId,
  });

  return deductAmount;
};

/** Refund to user wallet after order cancellation */
export const refundUserWallet = async (
  userId: string,
  amount: number,
  orderId: string,
  reason?: string
): Promise<void> => {
  const amt = round(amount);
  if (amt <= 0) return;

  const wallet = await ensureWallet(userId);
  const updated = await UserWallet.findByIdAndUpdate(
    wallet._id,
    { $inc: { balance: amt } },
    { new: true }
  );

  await UserWalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: "REFUND",
    amount: amt,
    balanceAfter: updated!.balance,
    description: reason || "Order refund",
    referenceType: "REFUND",
    referenceId: orderId,
  });
};
