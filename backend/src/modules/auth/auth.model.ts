import { Schema, model, Document } from "mongoose";
import { Role, ROLES } from "../../common/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  refreshToken?: string | null;
  addresses: Array<{
    label: string;
    line1: string;
    city: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
  }>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    refreshToken: { type: String, default: null },
    addresses: [
      {
        label: { type: String, required: true },
        line1: { type: String, required: true },
        city: { type: String, required: true },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            required: true
          },
          coordinates: {
            type: [Number],
            required: true,
            validate: {
              validator: (v: number[]) => v.length === 2,
              message: "Coordinates must contain [lng, lat]"
            }
          }
        }
      }
    ]
  },
  { timestamps: true }
);

userSchema.index({ "addresses.location": "2dsphere" });

export const User = model<IUser>("User", userSchema);
