import { AddonGroup, IAddonGroup } from "./addon.model";
import { Types } from "mongoose";

export const createAddonGroup = (payload: Partial<IAddonGroup>) => AddonGroup.create(payload);

export const findAddonGroupById = (id: string) => AddonGroup.findById(id).exec();

export const listAddonGroupsByRestaurant = (restaurantId: string) =>
  AddonGroup.find({ restaurantId: new Types.ObjectId(restaurantId) }).sort({ createdAt: -1 }).exec();

export const listAllAddonGroups = () => AddonGroup.find({}).sort({ createdAt: -1 }).exec();

export const updateAddonGroup = (id: string, payload: Partial<IAddonGroup>) =>
  AddonGroup.findByIdAndUpdate(id, payload, { new: true }).exec();

export const deleteAddonGroup = (id: string) => AddonGroup.findByIdAndDelete(id).exec();
