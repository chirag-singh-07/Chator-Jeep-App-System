import mongoose, { Schema, model, Document } from 'mongoose';

export interface IAdPopup extends Document {
  title: string;
  imageUrl: string;
  isActive: boolean;
  type: 'general' | 'new_user';
  couponCode?: string;
}

const adPopupSchema = new Schema<IAdPopup>({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['general', 'new_user'], default: 'general' },
  couponCode: { type: String },
}, { timestamps: true });

export const AdPopup = mongoose.models.AdPopup || model<IAdPopup>('AdPopup', adPopupSchema);
