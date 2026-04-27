import { Schema, model, Document, Types } from "mongoose";

export type PartnerStatus = "pending" | "approved" | "rejected" | "blocked";
export type VehicleType = "Bike" | "Cycle" | "Car";

export interface IDeliveryPartner extends Document {
  userId: Types.ObjectId;
  /** Alias for userId — used in some service functions */
  riderId?: Types.ObjectId;
  /** The order currently being handled */
  orderId?: Types.ObjectId | null;
  fullName: string;
  phoneNumber: string;
  email: string;
  profilePhoto?: string;
  vehicleType: VehicleType;
  drivingLicense?: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  status: PartnerStatus;
  isOnline: boolean;
  isAvailable: boolean;
  currentOrderId?: Types.ObjectId | null;
  adminRemarks?: string;
  currentLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  lastLocationUpdatedAt?: Date | null;
  acceptedAt?: Date | null;
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
  earnings?: {
    estimatedAmount: number;
    finalAmount: number;
    distanceKm: number;
  } | null;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const deliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    profilePhoto: { type: String },
    vehicleType: { type: String, enum: ["Bike", "Cycle", "Car"], required: true },
    drivingLicense: { type: String },
    bankDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
    },
    status: { type: String, enum: ["pending", "approved", "rejected", "blocked"], default: "pending", index: true },
    isOnline: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: false, index: true },
    currentOrderId: { type: Schema.Types.ObjectId, ref: "Order", default: null, index: true },
    adminRemarks: { type: String },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }
    },
    lastLocationUpdatedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    earnings: {
      estimatedAmount: { type: Number },
      finalAmount: { type: Number },
      distanceKm: { type: Number },
    },
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ currentLocation: "2dsphere" });

export const DeliveryPartner = model<IDeliveryPartner>("DeliveryPartner", deliveryPartnerSchema);
