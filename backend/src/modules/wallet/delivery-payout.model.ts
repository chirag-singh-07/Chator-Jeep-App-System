import { Document, Schema, Types, model, models } from "mongoose";

export const DELIVERY_PAYOUT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const DELIVERY_PAYOUT_METHOD = {
  BANK_ACCOUNT: "BANK_ACCOUNT",
  UPI: "UPI",
} as const;

export type DeliveryPayoutStatus =
  (typeof DELIVERY_PAYOUT_STATUS)[keyof typeof DELIVERY_PAYOUT_STATUS];

export type DeliveryPayoutMethodType =
  (typeof DELIVERY_PAYOUT_METHOD)[keyof typeof DELIVERY_PAYOUT_METHOD];

export interface IDeliveryPayout extends Document {
  riderId: Types.ObjectId;
  walletId: Types.ObjectId;
  amount: number;
  status: DeliveryPayoutStatus;
  paymentMethod: {
    type: DeliveryPayoutMethodType;
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  adminNote?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryPayoutSchema = new Schema<IDeliveryPayout>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryWallet",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: Object.values(DELIVERY_PAYOUT_STATUS),
      default: DELIVERY_PAYOUT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: {
        type: String,
        enum: Object.values(DELIVERY_PAYOUT_METHOD),
        required: true,
      },
      upiId: { type: String },
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    adminNote: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

deliveryPayoutSchema.index({ riderId: 1, createdAt: -1 });

export const DeliveryPayout =
  models.DeliveryPayout || model<IDeliveryPayout>("DeliveryPayout", deliveryPayoutSchema);
