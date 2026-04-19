import { Schema, model, Document, Types } from "mongoose";

// ─── Verification Status ───────────────────────────────────────────────────────
export const KITCHEN_STATUS = {
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

export type KitchenStatus = (typeof KITCHEN_STATUS)[keyof typeof KITCHEN_STATUS];

// ─── Interfaces ────────────────────────────────────────────────────────────────
export interface IKitchenDocument {
  label: string;         // e.g. "FSSAI License", "ID Proof"
  key: string;          // S3 object key
  url: string;          // Public or presigned URL
  verifiedAt?: Date;
}

export interface IBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface IAdminAction {
  adminId: Types.ObjectId;
  action: "APPROVED" | "REJECTED" | "MARKED_FOR_REVIEW";
  reason?: string;
  timestamp: Date;
}

export interface IKitchen extends Document {
  ownerId: Types.ObjectId;
  ownerName: string;
  name: string;
  description?: string;
  email: string;
  phone: string;
  cuisines: string[];
  isOpen: boolean;
  rating: number;
  status: KitchenStatus;
  rejectionReason?: string;
  fssaiLicense?: string;
  logoUrls?: Record<string, string>;
  bannerUrls?: Record<string, string>;
  documents: IKitchenDocument[];
  bankDetails?: IBankDetails;
  adminActions: IAdminAction[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address: {
    line1: string;
    city: string;
    state: string;
    pinCode: string;
  };
}

// ─── Schema ────────────────────────────────────────────────────────────────────
const kitchenSchema = new Schema<IKitchen>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    cuisines: { type: [String], default: [] },
    isOpen: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },

    // ── Verification ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(KITCHEN_STATUS),
      default: KITCHEN_STATUS.PENDING_VERIFICATION,
      index: true,
    },
    rejectionReason: { type: String },
    fssaiLicense: { type: String },

    // ── Brand Assets ──────────────────────────────────────────────────────────
    logoUrls: { type: Schema.Types.Mixed },
    bannerUrls: { type: Schema.Types.Mixed },

    // ── Uploaded Documents ────────────────────────────────────────────────────
    documents: [
      {
        label: { type: String, required: true },
        key: { type: String, required: true },
        url: { type: String, required: true },
        verifiedAt: { type: Date },
      },
    ],

    // ── Bank Details ──────────────────────────────────────────────────────────
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },

    // ── Admin Audit Trail ─────────────────────────────────────────────────────
    adminActions: [
      {
        adminId: { type: Schema.Types.ObjectId, ref: "User" },
        action: { type: String, enum: ["APPROVED", "REJECTED", "MARKED_FOR_REVIEW"] },
        reason: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ── Location ──────────────────────────────────────────────────────────────
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    address: {
      line1: { type: String },
      city: { type: String },
      state: { type: String },
      pinCode: { type: String },
    },
  },
  { timestamps: true }
);

kitchenSchema.index({ location: "2dsphere" });
kitchenSchema.index({ status: 1, createdAt: -1 });

export const Kitchen = model<IKitchen>("Kitchen", kitchenSchema);

// ─── MenuItem (unchanged, kept here for co-location) ─────────────────────────
export interface IMenuItem extends Document {
  kitchenId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  images?: Record<string, string>;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true, index: true },
    imageUrl: { type: String },
    images: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

menuItemSchema.index({ kitchenId: 1, isAvailable: 1 });
export const MenuItem = model<IMenuItem>("MenuItem", menuItemSchema);
