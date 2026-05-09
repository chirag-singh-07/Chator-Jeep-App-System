import { Schema, model, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType: 'RESTAURANT' | 'CATEGORY' | 'EXTERNAL' | 'OFFER';
  linkId?: string;
  isActive: boolean;
  priority: number;
}

const bannerSchema = new Schema<IBanner>({
  title: { type: String, required: true },
  subtitle: { type: String },
  imageUrl: { type: String, required: true },
  linkType: { type: String, enum: ['RESTAURANT', 'CATEGORY', 'EXTERNAL', 'OFFER'], default: 'OFFER' },
  linkId: { type: String },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
}, { timestamps: true });

export const BannerModel = model<IBanner>('Banner', bannerSchema);
