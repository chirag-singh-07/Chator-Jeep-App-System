import { Schema, model, Document, Types } from "mongoose";

export interface IKitchen extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description?: string;
  cuisines: string[];
  isOpen: boolean;
  rating: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

const kitchenSchema = new Schema<IKitchen>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    cuisines: { type: [String], default: [] },
    isOpen: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  { timestamps: true }
);

kitchenSchema.index({ location: "2dsphere" });

export const Kitchen = model<IKitchen>("Kitchen", kitchenSchema);

export interface IMenuItem extends Document {
  kitchenId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true, index: true },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

menuItemSchema.index({ kitchenId: 1, isAvailable: 1 });

export const MenuItem = model<IMenuItem>("MenuItem", menuItemSchema);
