import { Schema, model, Document, Types } from "mongoose";

export interface IDelivery extends Document {
  riderId: Types.ObjectId;
  orderId?: Types.ObjectId | null;
  status: "AVAILABLE" | "ASSIGNED" | "PICKED_UP" | "DELIVERED";
  isAvailable: boolean;
  isOnline: boolean;
  acceptedAt?: Date | null;
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
  lastLocationUpdatedAt?: Date | null;
  route?: {
    pickupAddress?: string;
    dropAddress?: string;
    pickupCoordinates?: [number, number];
    dropCoordinates?: [number, number];
  } | null;
  earnings?: {
    estimatedAmount: number;
    finalAmount: number;
    distanceKm: number;
  } | null;
  currentLocation: {
    type: "Point";
    coordinates: [number, number];
  };
}

const deliverySchema = new Schema<IDelivery>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null, unique: true, sparse: true, index: true },
    status: { type: String, enum: ["AVAILABLE", "ASSIGNED", "PICKED_UP", "DELIVERED"], default: "AVAILABLE" },
    isAvailable: { type: Boolean, default: true, index: true },
    isOnline: { type: Boolean, default: false, index: true },
    acceptedAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    lastLocationUpdatedAt: { type: Date, default: null },
    route: {
      pickupAddress: { type: String },
      dropAddress: { type: String },
      pickupCoordinates: { type: [Number] },
      dropCoordinates: { type: [Number] },
    },
    earnings: {
      estimatedAmount: { type: Number },
      finalAmount: { type: Number },
      distanceKm: { type: Number },
    },
    currentLocation: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }
    }
  },
  { timestamps: true }
);

deliverySchema.index({ currentLocation: "2dsphere" });

export const Delivery = model<IDelivery>("Delivery", deliverySchema);
