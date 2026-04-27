import { Schema, model, models, Document, Types } from "mongoose";

export type TransactionType = "CREDIT" | "DEBIT" | "REFUND";

export interface IUserWalletTransaction extends Document {
  walletId: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: "ORDER" | "TOPUP" | "REFUND";
  referenceId?: string;
  createdAt: Date;
}

export interface IUserWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const userWalletSchema = new Schema<IUserWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const userWalletTransactionSchema = new Schema<IUserWalletTransaction>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "UserWallet", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["CREDIT", "DEBIT", "REFUND"], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    referenceType: { type: String, enum: ["ORDER", "TOPUP", "REFUND"] },
    referenceId: { type: String },
  },
  { timestamps: true }
);

export const UserWallet = models.UserWallet || model<IUserWallet>("UserWallet", userWalletSchema);
export const UserWalletTransaction = models.UserWalletTransaction || model<IUserWalletTransaction>("UserWalletTransaction", userWalletTransactionSchema);
