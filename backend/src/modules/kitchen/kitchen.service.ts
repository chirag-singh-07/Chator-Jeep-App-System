import { Types } from "mongoose";
import { AppError } from "../../common/errors/app-error";
import * as repo from "./kitchen.repository";

export const createKitchenProfile = async (
  ownerId: string,
  input: {
    name: string;
    description?: string;
    cuisines?: string[];
    location: { coordinates: [number, number] };
  }
) => {
  const existing = await repo.findKitchenByOwner(ownerId);
  if (existing) {
    throw new AppError("Kitchen profile already exists", 409);
  }

  return repo.createKitchen({
    ownerId: new Types.ObjectId(ownerId),
    name: input.name,
    description: input.description,
    cuisines: input.cuisines ?? [],
    location: {
      type: "Point",
      coordinates: input.location.coordinates
    }
  });
};

export const updateKitchenProfile = async (ownerId: string, input: Record<string, unknown>) => {
  const payload: Record<string, unknown> = { ...input };

  if (input.location && typeof input.location === "object") {
    const location = input.location as { coordinates: [number, number] };
    payload.location = { type: "Point", coordinates: location.coordinates };
  }

  const kitchen = await repo.updateKitchenByOwner(ownerId, payload);
  if (!kitchen) {
    throw new AppError("Kitchen profile not found", 404);
  }

  return kitchen;
};

export const listKitchens = async (query: { isOpen?: string; skip?: string; limit?: string }) => {
  const skip = Number(query.skip ?? 0);
  const limit = Math.min(Number(query.limit ?? 20), 100);

  const filters: Record<string, unknown> = {};
  if (query.isOpen !== undefined) {
    filters.isOpen = query.isOpen === "true";
  }

  return repo.listKitchens(filters, skip, limit);
};

export const listKitchenMenu = async (kitchenId: string) => {
  const kitchen = await repo.findKitchenById(kitchenId);
  if (!kitchen) {
    throw new AppError("Kitchen not found", 404);
  }
  return repo.listMenuByKitchen(kitchenId);
};

export const addMenuItem = async (
  ownerId: string,
  input: {
    name: string;
    price: number;
    description?: string;
    category?: string;
    isVeg?: boolean;
    isAvailable?: boolean;
    imageUrl?: string;
  }
) => {
  const kitchen = await repo.findKitchenByOwner(ownerId);
  if (!kitchen) {
    throw new AppError("Kitchen profile not found", 404);
  }

  return repo.createMenuItem({
    kitchenId: kitchen._id,
    ...input
  });
};

export const updateMenuItem = async (
  ownerId: string,
  menuItemId: string,
  input: Record<string, unknown>
) => {
  const kitchen = await repo.findKitchenByOwner(ownerId);
  if (!kitchen) {
    throw new AppError("Kitchen profile not found", 404);
  }

  const menuItem = await repo.updateMenuItemByKitchen(menuItemId, kitchen._id.toString(), input);
  if (!menuItem) {
    throw new AppError("Menu item not found", 404);
  }

  return menuItem;
};
