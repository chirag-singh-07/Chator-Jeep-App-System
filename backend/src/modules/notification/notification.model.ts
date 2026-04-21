import { Schema, model, models, Document } from "mongoose";

export interface INotification extends Document {
  title: string;
  body: string;
  type: "BROADCAST" | "TARGETED";
  targetUserType?: "USER" | "KITCHEN" | "DELIVERY" | "ADMIN" | "ALL";
  targetUserId?: Schema.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ["BROADCAST", "TARGETED"], default: "TARGETED" },
    targetUserType: { 
      type: String, 
      enum: ["USER", "KITCHEN", "DELIVERY", "ADMIN", "ALL"],
      default: "ALL"
    },
    targetUserId: { type: Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = models.Notification || model<INotification>("Notification", notificationSchema);
