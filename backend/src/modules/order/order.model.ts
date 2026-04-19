import { Schema, model, models, Document, Types } from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS, OrderStatus, PaymentStatus } from "../../common/constants";

export interface IOrderItemSnapshot {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  deliveryId?: Types.ObjectId;
  items: IOrderItemSnapshot[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
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
    }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });

export const Order = models.Order || model<IOrder>("Order", orderSchema);
