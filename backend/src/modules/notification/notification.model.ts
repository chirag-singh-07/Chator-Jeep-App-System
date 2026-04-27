import { Schema, model, models, Document, Types } from "mongoose";

export type NotificationType = 
  | "ORDER_PLACED" 
  | "ORDER_CONFIRMED" 
  | "ORDER_ACCEPTED"
  | "ORDER_PREPARING" 
  | "ORDER_PREPARING"
  | "ORDER_READY"
  | "ORDER_PICKED_UP" 
  | "ORDER_ARRIVED"
  | "ORDER_COMPLETED"
  | "ORDER_DELIVERED" 
  | "ORDER_CANCELLED" 
  | "NEW_DELIVERY_REQUEST" 
  | "DELIVERY_ASSIGNED"
  | "DELIVERY_ARRIVED" 
  | "PROMOTIONAL" 
  | string; // Catch-all for dynamic status types like ORDER_PENDING etc.

export interface INotification extends Document {
  userId: Types.ObjectId;
  userType: "CUSTOMER" | "PARTNER" | "RESTAURANT";
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userType: { 
      type: String, 
      enum: ["CUSTOMER", "PARTNER", "RESTAURANT"], 
      required: true 
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      index: true 
    },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = models.Notification || model<INotification>("Notification", notificationSchema);
