import * as repo from "./addon.repository";
import { AppError } from "../../common/errors/app-error";
import { findRestaurantByOwner } from "../restaurant/restaurant.repository";

export const createAddonGroup = async (ownerId: string, data: any) => {
  const restaurant = await findRestaurantByOwner(ownerId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return repo.createAddonGroup({ ...data, restaurantId: restaurant._id });
};

export const listRestaurantAddons = async (ownerId: string) => {
  const restaurant = await findRestaurantByOwner(ownerId);
  if (!restaurant) throw new AppError("Restaurant not found", 404);

  return repo.listAddonGroupsByRestaurant(restaurant._id.toString());
};

export const updateAddonGroup = async (ownerId: string, id: string, data: any) => {
  const restaurant = await findRestaurantByOwner(ownerId);
  const addon = await repo.findAddonGroupById(id);
  
  if (!addon || !restaurant || addon.restaurantId.toString() !== restaurant._id.toString()) {
    throw new AppError("Unauthorized or Addon not found", 403);
  }

  return repo.updateAddonGroup(id, data);
};

export const removeAddonGroup = async (ownerId: string, id: string) => {
  const restaurant = await findRestaurantByOwner(ownerId);
  const addon = await repo.findAddonGroupById(id);

  if (!addon || !restaurant || addon.restaurantId.toString() !== restaurant._id.toString()) {
    throw new AppError("Unauthorized or Addon not found", 403);
  }

  return repo.deleteAddonGroup(id);
};

export const listAllAddonGroups = () => repo.listAllAddonGroups();
