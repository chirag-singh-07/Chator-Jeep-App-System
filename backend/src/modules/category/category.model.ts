import { Schema, model, models, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: string[];
  isActive: boolean;
  order: number;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    image: { type: String },
    subcategories: {
      type: [String],
      default: [],
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1 });

export const Category = models.Category || model<ICategory>("Category", categorySchema);
