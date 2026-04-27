import { Schema, model, models, Document, Types } from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS, OrderStatus, PaymentStatus } from "../../common/constants";

export interface IOrderItemSnapshot {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export type PaymentMethod = "COD" | "ONLINE" | "WALLET" | "PARTIAL_WALLET";

export interface IOrder extends Document {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  deliveryId?: Types.ObjectId;
  items: IOrderItemSnapshot[];
  totalAmount: number;
  deliveryAddress: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  walletAmountUsed?: number;
  deliveryOtp?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    deliveryId: { type: Schema.Types.ObjectId, ref: "Delivery", default: null, index: true },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "WALLET", "PARTIAL_WALLET"],
      default: "COD"
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    walletAmountUsed: { type: Number, default: 0 },
    deliveryOtp: { type: String, select: false },
    cancellationReason: { type: String, default: null }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });

export const Order = models.Order || model<IOrder>("Order", orderSchema);
