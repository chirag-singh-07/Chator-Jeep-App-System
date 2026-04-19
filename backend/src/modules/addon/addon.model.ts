import { Schema, model, models, Document, Types } from "mongoose";

export interface IAddonGroup extends Document {
  restaurantId: Types.ObjectId;
  name: string; // e.g., "Extra Toppings"
  description?: string;
  minSelection: number; // 0 for optional
  maxSelection: number; // 1 for single choice
  options: Array<{
    name: string;
    price: number;
    isAvailable: boolean;
  }>;
  isActive: boolean;
}

const addonGroupSchema = new Schema<IAddonGroup>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    minSelection: { type: Number, default: 0 },
    maxSelection: { type: Number, default: 1 },
    options: [
      {
        name: { type: String, required: true },
        price: { type: Number, default: 0 },
        isAvailable: { type: Boolean, default: true }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

addonGroupSchema.index({ restaurantId: 1, name: 1 });

export const AddonGroup = models.AddonGroup || model<IAddonGroup>("AddonGroup", addonGroupSchema);
