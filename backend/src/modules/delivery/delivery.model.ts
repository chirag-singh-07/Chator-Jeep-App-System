import { Schema, model, Document, Types } from "mongoose";

export type PartnerStatus = "pending" | "approved" | "rejected" | "blocked";
export type VehicleType = "Bike" | "Cycle" | "Car";
export type VehicleFuelType = "Petrol" | "EV";
export type PayoutMethod = "UPI" | "BANK_ACCOUNT";

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
  vehicleFuelType?: VehicleFuelType;
  bikeNumber?: string;
  drivingLicense?: string;
  documents?: {
    aadhaarNumber: string;
    aadhaarPhoto: string;
    panNumber?: string;
    panPhoto?: string;
    drivingLicenseNumber: string;
    drivingLicensePhoto: string;
    vehicleRcNumber?: string;
    vehicleRcPhoto?: string;
    bikeInsurancePhoto?: string;
    profilePhoto?: string;
    livePhoto: string;
  };
  address?: {
    buildingName: string;
    streetName: string;
    landmark?: string;
    area: string;
    state: string;
    city: string;
  };
  payoutMethod?: PayoutMethod;
  upiId?: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  termsAccepted?: boolean;
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
    vehicleFuelType: { type: String, enum: ["Petrol", "EV"] },
    bikeNumber: { type: String, uppercase: true, trim: true },
    drivingLicense: { type: String },
    documents: {
      aadhaarNumber: { type: String, trim: true, select: false },
      aadhaarPhoto: { type: String, trim: true },
      panNumber: { type: String, trim: true, uppercase: true },
      panPhoto: { type: String, trim: true },
      drivingLicenseNumber: { type: String, trim: true, uppercase: true },
      drivingLicensePhoto: { type: String, trim: true },
      vehicleRcNumber: { type: String, trim: true, uppercase: true },
      vehicleRcPhoto: { type: String, trim: true },
      bikeInsurancePhoto: { type: String, trim: true },
      profilePhoto: { type: String, trim: true },
      livePhoto: { type: String, trim: true },
    },
    address: {
      buildingName: { type: String, trim: true },
      streetName: { type: String, trim: true },
      landmark: { type: String, trim: true },
      area: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    payoutMethod: { type: String, enum: ["UPI", "BANK_ACCOUNT"], default: "BANK_ACCOUNT" },
    upiId: { type: String, trim: true },
    bankDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String },
      ifscCode: { type: String, uppercase: true },
      bankName: { type: String },
    },
    termsAccepted: { type: Boolean, default: false },
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
