import { Schema, model, Document, Types } from "mongoose";

export interface IDelivery extends Document {
  riderId: Types.ObjectId;
  orderId?: Types.ObjectId | null;
  status: "AVAILABLE" | "ASSIGNED" | "PICKED_UP" | "DELIVERED";
  isAvailable: boolean;
  currentLocation: {
    type: "Point";
    coordinates: [number, number];
  };
}

const deliverySchema = new Schema<IDelivery>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null, unique: true, sparse: true, index: true },
    status: { type: String, enum: ["AVAILABLE", "ASSIGNED", "PICKED_UP", "DELIVERED"], default: "AVAILABLE" },
    isAvailable: { type: Boolean, default: true, index: true },
    currentLocation: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }
    }
  },
  { timestamps: true }
);

deliverySchema.index({ currentLocation: "2dsphere" });

export const Delivery = model<IDelivery>("Delivery", deliverySchema);
