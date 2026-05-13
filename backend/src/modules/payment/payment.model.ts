import { Schema, model, models, Document, Types } from "mongoose";

export type PaymentPurpose = "RESTAURANT_REGISTRATION";
export type PaymentStatus = "CREATED" | "PAID" | "FAILED" | "CONSUMED";

export interface IPaymentTransaction extends Document {
  purpose: PaymentPurpose;
  status: PaymentStatus;
  amount: number;
  currency: string;
  receipt: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  consumedByRestaurantId?: Types.ObjectId;
  paidAt?: Date;
  failedAt?: Date;
  consumedAt?: Date;
  failureReason?: string;
  plan: {
    name: string;
    registrationFee: number;
    launchCommissionPercentage: number;
    normalCommissionPercentage: number;
    offerWindowHours: number;
  };
  metadata?: Record<string, unknown>;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    purpose: { type: String, enum: ["RESTAURANT_REGISTRATION"], required: true, index: true },
    status: { type: String, enum: ["CREATED", "PAID", "FAILED", "CONSUMED"], default: "CREATED", index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    receipt: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    consumedByRestaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
    paidAt: { type: Date },
    failedAt: { type: Date },
    consumedAt: { type: Date },
    failureReason: { type: String },
    plan: {
      name: { type: String, required: true },
      registrationFee: { type: Number, required: true },
      launchCommissionPercentage: { type: Number, required: true },
      normalCommissionPercentage: { type: Number, required: true },
      offerWindowHours: { type: Number, required: true },
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

paymentTransactionSchema.index({ purpose: 1, status: 1, createdAt: -1 });

export const PaymentTransaction =
  models.PaymentTransaction ||
  model<IPaymentTransaction>("PaymentTransaction", paymentTransactionSchema);
