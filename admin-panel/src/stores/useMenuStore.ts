import { create } from "zustand";

interface MenuState {
  foodItems: any[];
  addOns: any[];
  loading: boolean;
  error: string | null;

  fetchFoodItems: () => Promise<void>;
  createFoodItem: (data: any) => Promise<void>;
  updateFoodItem: (id: string, data: any) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  foodItems: [],
  addOns: [],
  loading: false,
  error: null,

  fetchFoodItems: async () => {
    set({ loading: true });
    // API Implementation
    set({ loading: false });
  },

  createFoodItem: async () => {},
  updateFoodItem: async () => {},
  deleteFoodItem: async () => {},
}));
