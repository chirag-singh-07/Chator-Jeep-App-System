import { Schema, model, models, Document } from "mongoose";
import { Role, ROLES } from "../../common/constants";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAddress {
  label: string;
  line1: string;
  city: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

export type UserStatus = "ACTIVE" | "DISABLED" | "PENDING";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  refreshToken?: string | null;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    city:  { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) =>
            v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 && // lng
            v[1] >= -90  && v[1] <= 90,    // lat
          message: "Coordinates must be [lng, lat] with valid ranges",
        },
      },
    },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED", "PENDING"],
      default: "ACTIVE",
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret: any) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ "addresses.location": "2dsphere" });

// ─── Model ────────────────────────────────────────────────────────────────────

export const User = models.User || model<IUser>("User", userSchema);