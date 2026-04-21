import { findRestaurantByOwner } from "../restaurant/restaurant.repository";
import { Withdrawal, WITHDRAWAL_STATUS } from "./withdrawal.model";
import { AppError } from "../../common/errors/app-error";
import {
  DeliveryWallet,
  DeliveryWalletTransaction,
  DELIVERY_WALLET_TRANSACTION_TYPE,
} from "./delivery-wallet.model";
import {
  DeliveryPayout,
  DELIVERY_PAYOUT_STATUS,
  IDeliveryPayout,
} from "./delivery-payout.model";
import { User } from "../user/user.model";
import { deliveryEvent } from "../../sockets/events";

const roundCurrency = (amount: number): number =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

const ensureDeliveryWallet = async (riderId: string) => {
  let wallet = await DeliveryWallet.findOne({ riderId }).exec();

  if (!wallet) {
    wallet = await DeliveryWallet.create({ riderId });
  }

  return wallet;
};

const assertDeliveryPartner = async (userId: string) => {
  const rider = await User.findById(userId).exec();
  if (!rider || rider.role !== "DELIVERY") {
    throw new AppError("Delivery partner not found", 404);
  }

  return rider;
};

export const requestWithdrawal = async (userId: string, amount: number) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  if (restaurant.walletBalance < amount) {
    throw new AppError("Insufficient wallet balance", 400);
  }

  if (!restaurant.bankDetails || !restaurant.bankDetails.accountNumber) {
    throw new AppError(
      "Please update your bank details before withdrawing",
      400,
    );
  }

  // Create request
  const request = await Withdrawal.create({
    restaurantId: restaurant._id,
    amount,
    bankDetails: restaurant.bankDetails,
    status: WITHDRAWAL_STATUS.PENDING,
  });

  // Deduct from wallet balance immediately (hold)
  const { Restaurant } = await import("../restaurant/restaurant.model");
  await Restaurant.findByIdAndUpdate(restaurant._id, {
    $inc: { walletBalance: -amount },
  });

  return request;
};

export const getMyWithdrawals = async (userId: string) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return Withdrawal.find({ restaurantId: restaurant._id }).sort({
    createdAt: -1,
  });
};

export const getWalletStats = async (userId: string) => {
  const restaurant = await findRestaurantByOwner(userId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return {
    balance: restaurant.walletBalance,
    totalEarnings: restaurant.totalEarnings,
  };
};

// ─── Admin Services ───────────────────────────────────────────────────────────
export const adminListAllWithdrawals = async (status?: string) => {
  const filter = status ? { status } : {};
  return Withdrawal.find(filter)
    .populate("restaurantId", "name ownerName phone")
    .sort({ createdAt: -1 });
};

export const adminProcessWithdrawal = async (
  requestId: string,
  status: "APPROVED" | "REJECTED",
  note?: string,
) => {
  const request = await Withdrawal.findById(requestId);
  if (!request) throw new AppError("Withdrawal request not found", 404);

  if (request.status !== WITHDRAWAL_STATUS.PENDING) {
    throw new AppError("Request already processed", 400);
  }

  request.status =
    status === "APPROVED"
      ? WITHDRAWAL_STATUS.COMPLETED
      : WITHDRAWAL_STATUS.REJECTED;
  request.adminNote = note;
  request.processedAt = new Date();
  await request.save();

  // If rejected, refund the money to restaurant balance
  if (status === "REJECTED") {
    const { Restaurant } = await import("../restaurant/restaurant.model");
    await Restaurant.findByIdAndUpdate(request.restaurantId, {
      $inc: { walletBalance: request.amount },
    });
  }

  return request;
};

export const creditDeliveryPartnerEarnings = async (input: {
  riderId: string;
  amount: number;
  orderId: string;
  description: string;
  metadata?: Record<string, unknown>;
}) => {
  await assertDeliveryPartner(input.riderId);
  const amount = roundCurrency(input.amount);
  if (amount <= 0) {
    return null;
  }

  const wallet = await ensureDeliveryWallet(input.riderId);
  const existing = await DeliveryWalletTransaction.findOne({
    riderId: input.riderId,
    type: DELIVERY_WALLET_TRANSACTION_TYPE.DELIVERY_EARNING,
    referenceType: "ORDER",
    referenceId: input.orderId,
  }).exec();

  if (existing) {
    return wallet;
  }

  const updatedWallet = await DeliveryWallet.findByIdAndUpdate(
    wallet._id,
    {
      $inc: {
        balance: amount,
        totalEarnings: amount,
      },
    },
    { new: true }
  ).exec();

  if (!updatedWallet) {
    throw new AppError("Unable to update delivery wallet", 500);
  }

  await DeliveryWalletTransaction.create({
    walletId: updatedWallet._id,
    riderId: input.riderId,
    type: DELIVERY_WALLET_TRANSACTION_TYPE.DELIVERY_EARNING,
    amount,
    balanceAfter: updatedWallet.balance,
    description: input.description,
    referenceType: "ORDER",
    referenceId: input.orderId,
    metadata: input.metadata,
  });

  return updatedWallet;
};

export const getDeliveryWalletOverview = async (riderId: string) => {
  await assertDeliveryPartner(riderId);
  const wallet = await ensureDeliveryWallet(riderId);

  const [pendingPayouts, completedPayouts, recentPayouts, recentTransactions] = await Promise.all([
    DeliveryPayout.countDocuments({
      riderId,
      status: DELIVERY_PAYOUT_STATUS.PENDING,
    }).exec(),
    DeliveryPayout.countDocuments({
      riderId,
      status: DELIVERY_PAYOUT_STATUS.APPROVED,
    }).exec(),
    DeliveryPayout.find({ riderId }).sort({ createdAt: -1 }).limit(8).exec(),
    DeliveryWalletTransaction.find({ riderId }).sort({ createdAt: -1 }).limit(12).exec(),
  ]);

  return {
    balance: wallet.balance,
    heldBalance: wallet.heldBalance,
    totalEarnings: wallet.totalEarnings,
    totalPaidOut: wallet.totalPaidOut,
    payoutCount: wallet.payoutCount,
    pendingPayouts,
    completedPayouts,
    payouts: recentPayouts,
    transactions: recentTransactions,
  };
};

export const getDeliveryPayoutRequests = async (riderId: string) => {
  await assertDeliveryPartner(riderId);
  await ensureDeliveryWallet(riderId);

  return DeliveryPayout.find({ riderId }).sort({ createdAt: -1 }).exec();
};

export const getDeliveryWalletTransactions = async (riderId: string) => {
  await assertDeliveryPartner(riderId);
  await ensureDeliveryWallet(riderId);

  return DeliveryWalletTransaction.find({ riderId }).sort({ createdAt: -1 }).exec();
};

export const requestDeliveryPayout = async (
  riderId: string,
  input: {
    amount: number;
    paymentMethod: IDeliveryPayout["paymentMethod"];
  }
) => {
  await assertDeliveryPartner(riderId);
  const amount = roundCurrency(input.amount);

  if (amount <= 0) {
    throw new AppError("Payout amount must be greater than zero", 400);
  }

  const wallet = await ensureDeliveryWallet(riderId);
  const updatedWallet = await DeliveryWallet.findOneAndUpdate(
    {
      _id: wallet._id,
      balance: { $gte: amount },
    },
    {
      $inc: {
        balance: -amount,
        heldBalance: amount,
      },
    },
    { new: true }
  ).exec();

  if (!updatedWallet) {
    throw new AppError("Insufficient wallet balance", 400);
  }

  try {
    const payout = await DeliveryPayout.create({
      riderId,
      walletId: wallet._id,
      amount,
      paymentMethod: input.paymentMethod,
      status: DELIVERY_PAYOUT_STATUS.PENDING,
    });

    await DeliveryWalletTransaction.create({
      walletId: wallet._id,
      riderId,
      type: DELIVERY_WALLET_TRANSACTION_TYPE.PAYOUT_HOLD,
      amount: -amount,
      balanceAfter: updatedWallet.balance,
      description: "Payout request submitted",
      referenceType: "DELIVERY_PAYOUT",
      referenceId: payout._id.toString(),
      metadata: {
        method: input.paymentMethod.type,
      },
    });

    const populated = await DeliveryPayout.findById(payout._id)
      .populate("riderId", "name email phone")
      .exec();

    deliveryEvent("admin", "delivery:payout_requested", populated);
    return payout;
  } catch (error) {
    await DeliveryWallet.findByIdAndUpdate(wallet._id, {
      $inc: { balance: amount, heldBalance: -amount },
    }).exec();
    throw error;
  }
};

export const adminListDeliveryPayouts = async (status?: string) => {
  const filter =
    status && status !== "ALL"
      ? {
          status,
        }
      : {};

  return DeliveryPayout.find(filter)
    .populate("riderId", "name email phone status")
    .sort({ createdAt: -1 })
    .exec();
};

export const adminProcessDeliveryPayout = async (
  payoutId: string,
  status: "APPROVED" | "REJECTED",
  note?: string
) => {
  const payout = await DeliveryPayout.findById(payoutId).exec();
  if (!payout) {
    throw new AppError("Delivery payout request not found", 404);
  }

  if (payout.status !== DELIVERY_PAYOUT_STATUS.PENDING) {
    throw new AppError("Payout request already processed", 400);
  }

  const wallet = await DeliveryWallet.findById(payout.walletId).exec();
  if (!wallet) {
    throw new AppError("Delivery wallet not found", 404);
  }

  payout.status =
    status === "APPROVED" ? DELIVERY_PAYOUT_STATUS.APPROVED : DELIVERY_PAYOUT_STATUS.REJECTED;
  payout.adminNote = note;
  payout.processedAt = new Date();
  await payout.save();

  if (status === "APPROVED") {
    const updatedWallet = await DeliveryWallet.findByIdAndUpdate(
      wallet._id,
      {
        $inc: {
          heldBalance: -payout.amount,
          totalPaidOut: payout.amount,
          payoutCount: 1,
        },
      },
      { new: true }
    ).exec();

    if (!updatedWallet) {
      throw new AppError("Unable to process delivery payout", 500);
    }

    await DeliveryWalletTransaction.create({
      walletId: wallet._id,
      riderId: payout.riderId,
      type: DELIVERY_WALLET_TRANSACTION_TYPE.PAYOUT_APPROVED,
      amount: 0,
      balanceAfter: updatedWallet.balance,
      description: "Payout approved by admin",
      referenceType: "DELIVERY_PAYOUT",
      referenceId: payout._id.toString(),
      metadata: {
        amount: payout.amount,
        note,
      },
    });
  } else {
    const updatedWallet = await DeliveryWallet.findByIdAndUpdate(
      wallet._id,
      {
        $inc: {
          balance: payout.amount,
          heldBalance: -payout.amount,
        },
      },
      { new: true }
    ).exec();

    if (!updatedWallet) {
      throw new AppError("Unable to refund delivery payout", 500);
    }

    await DeliveryWalletTransaction.create({
      walletId: wallet._id,
      riderId: payout.riderId,
      type: DELIVERY_WALLET_TRANSACTION_TYPE.PAYOUT_REJECTED,
      amount: payout.amount,
      balanceAfter: updatedWallet.balance,
      description: "Payout rejected and refunded",
      referenceType: "DELIVERY_PAYOUT",
      referenceId: payout._id.toString(),
      metadata: {
        note,
      },
    });
  }

  const populated = await DeliveryPayout.findById(payout._id)
    .populate("riderId", "name email phone")
    .exec();

  deliveryEvent(`rider_${payout.riderId.toString()}`, "delivery:payout_updated", populated);
  deliveryEvent("admin", "delivery:payout_updated", populated);

  return populated;
};
