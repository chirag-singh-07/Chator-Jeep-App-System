import { Schema, model, models, Document, Types } from "mongoose";

export type NotificationEventStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";
export type NotificationEventType =
  | "ORDER_PLACED"
  | "ORDER_ACCEPTED"
  | "ORDER_PREPARING"
  | "ORDER_READY"
  | "ORDER_OUT_FOR_DELIVERY"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "PAYMENT_CONFIRMED"
  | "REFUND_PROCESSED"
  | "FOOD_DISCOVERY"
  | "LUNCH_REMINDER"
  | "EVENING_CRAVING"
  | "DINNER_REMINDER"
  | "RE_ENGAGEMENT"
  | "PROMOTIONAL"
  | string;

export interface INotificationEvent extends Document {
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;
  type: NotificationEventType;
  title: string;
  body: string;
  language: "en" | "hi";
  status: NotificationEventStatus;
  deduplicationKey: string;
  /** Template ID from notification-templates-library.ts — used for per-user cooldown tracking */
  templateId?: string;
  retryCount: number;
  failureReason?: string;
  sentAt?: Date;
  scheduledAt?: Date;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationEventSchema = new Schema<INotificationEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    language: { type: String, enum: ["en", "hi"], default: "en" },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    // Unique key to prevent duplicate sends across retries, restarts, and multiple workers.
    // Format: order:{orderId}:status:{status} or periodic:{userId}:{templateId}:{date}
    deduplicationKey: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    /**
     * Template ID from the template library — stored to enforce per-user cooldowns.
     * The template-selector queries this field to avoid repeating the same template.
     */
    templateId: { type: String, default: null, index: true },
    retryCount: { type: Number, default: 0 },
    failureReason: { type: String, default: null },
    sentAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound index for finding events by user and status efficiently
notificationEventSchema.index({ userId: 1, status: 1, createdAt: -1 });
// Index for periodic notification eligibility queries
notificationEventSchema.index({ userId: 1, type: 1, sentAt: -1 });
// Index for template cooldown lookups: "which templates did user X receive in the last N days?"
notificationEventSchema.index({ userId: 1, templateId: 1, sentAt: -1 });
// Cleanup old events after 30 days automatically
notificationEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const NotificationEvent =
  models.NotificationEvent ||
  model<INotificationEvent>("NotificationEvent", notificationEventSchema);
