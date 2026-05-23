import { Schema, model, Document } from "mongoose";

export interface IAccountDeletionRequest extends Document {
  email: string;
  userId?: string;
  reason: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DELETED";
  requestedAt: Date;
  confirmationDeadline: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  deletedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountDeletionRequestSchema = new Schema<IAccountDeletionRequest>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "DELETED"],
      default: "PENDING",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: () => new Date(),
    },
    confirmationDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    confirmedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for email and status
accountDeletionRequestSchema.index({ email: 1, status: 1 });

// Index for finding pending deletions that need to be processed
accountDeletionRequestSchema.index({ status: 1, confirmationDeadline: 1 });

export const AccountDeletionRequest = model<IAccountDeletionRequest>(
  "AccountDeletionRequest",
  accountDeletionRequestSchema
);
