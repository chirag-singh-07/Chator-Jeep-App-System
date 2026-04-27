import mongoose from "mongoose";

export interface IOtp {
  email: string;
  otp: string;
  type: "register" | "forgot_password" | "login";
  expiresAt: Date;
}

const otpSchema = new mongoose.Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ["register", "forgot_password", "login"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

export const Otp = mongoose.models.Otp || mongoose.model<IOtp>("Otp", otpSchema);
