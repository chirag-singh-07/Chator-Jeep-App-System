import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>("Review", ReviewSchema);
