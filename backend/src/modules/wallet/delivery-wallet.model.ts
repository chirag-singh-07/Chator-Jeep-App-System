import { Document, Schema, Types, model, models } from "mongoose";

export const DELIVERY_WALLET_TRANSACTION_TYPE = {
  DELIVERY_EARNING: "DELIVERY_EARNING",
  PAYOUT_HOLD: "PAYOUT_HOLD",
  PAYOUT_APPROVED: "PAYOUT_APPROVED",
  PAYOUT_REJECTED: "PAYOUT_REJECTED",
} as const;

export type DeliveryWalletTransactionType =
  (typeof DELIVERY_WALLET_TRANSACTION_TYPE)[keyof typeof DELIVERY_WALLET_TRANSACTION_TYPE];

export interface IDeliveryWallet extends Document {
  riderId: Types.ObjectId;
  balance: number;
  heldBalance: number;
  totalEarnings: number;
  totalPaidOut: number;
  payoutCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeliveryWalletTransaction extends Document {
  walletId: Types.ObjectId;
  riderId: Types.ObjectId;
  type: DeliveryWalletTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryWalletSchema = new Schema<IDeliveryWallet>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    heldBalance: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    totalPaidOut: { type: Number, default: 0, min: 0 },
    payoutCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const deliveryWalletTransactionSchema = new Schema<IDeliveryWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryWallet",
      required: true,
      index: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(DELIVERY_WALLET_TRANSACTION_TYPE),
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    referenceType: { type: String },
    referenceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

deliveryWalletTransactionSchema.index({ riderId: 1, createdAt: -1 });
deliveryWalletTransactionSchema.index(
  { riderId: 1, type: 1, referenceType: 1, referenceId: 1 },
  { unique: true, sparse: true }
);

export const DeliveryWallet =
  models.DeliveryWallet || model<IDeliveryWallet>("DeliveryWallet", deliveryWalletSchema);

export const DeliveryWalletTransaction =
  models.DeliveryWalletTransaction ||
  model<IDeliveryWalletTransaction>("DeliveryWalletTransaction", deliveryWalletTransactionSchema);
