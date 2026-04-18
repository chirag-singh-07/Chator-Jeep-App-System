import { Types } from "mongoose";
import { IKitchen, IMenuItem, Kitchen, MenuItem } from "./kitchen.model";

export const createKitchen = (payload: Partial<IKitchen>): Promise<IKitchen> => Kitchen.create(payload);

export const updateKitchenByOwner = (
  ownerId: string,
  payload: Partial<IKitchen>
): Promise<IKitchen | null> =>
  Kitchen.findOneAndUpdate({ ownerId: new Types.ObjectId(ownerId) }, payload, { new: true }).exec();

export const findKitchenByOwner = (ownerId: string): Promise<IKitchen | null> =>
  Kitchen.findOne({ ownerId: new Types.ObjectId(ownerId) }).exec();

export const listKitchens = (
  filters: Record<string, unknown>,
  skip: number,
  limit: number
): Promise<IKitchen[]> => Kitchen.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).exec();

export const findKitchenById = (kitchenId: string): Promise<IKitchen | null> => Kitchen.findById(kitchenId).exec();

export const createMenuItem = (payload: Partial<IMenuItem>): Promise<IMenuItem> => MenuItem.create(payload);

export const listMenuByKitchen = (kitchenId: string): Promise<IMenuItem[]> =>
  MenuItem.find({ kitchenId: new Types.ObjectId(kitchenId) }).sort({ createdAt: -1 }).exec();

export const updateMenuItemByKitchen = (
  menuItemId: string,
  kitchenId: string,
  payload: Partial<IMenuItem>
): Promise<IMenuItem | null> =>
  MenuItem.findOneAndUpdate(
    { _id: new Types.ObjectId(menuItemId), kitchenId: new Types.ObjectId(kitchenId) },
    payload,
    { new: true }
  ).exec();
