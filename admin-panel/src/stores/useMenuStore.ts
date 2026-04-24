import { create } from "zustand";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

interface MenuFilters {
  page: number;
  search: string;
  category: string;
  status: string;
}

interface MenuState {
  foodItems: any[];
  addOns: any[];
  loading: boolean;
  error: string | null;
  filters: MenuFilters;
  pagination: { page: number; limit: number; total: number; pages: number };

  setFilters: (filters: Partial<MenuFilters>) => void;
  fetchFoodItems: () => Promise<void>;
  createFoodItem: (data: any) => Promise<void>;
  updateFoodItem: (id: string, data: any) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  foodItems: [],
  addOns: [],
  loading: false,
  error: null,
  filters: {
    page: 1,
    search: "",
    category: "all",
    status: "all"
  },
  pagination: { page: 1, limit: 20, total: 0, pages: 1 },

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  fetchFoodItems: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      
      const data = await adminService.getMenuItems({
        page: filters.page,
        search: filters.search,
        category: filters.category
      });
      
      // Also apply local status filtering if needed
      let items = data.items || [];
      if (filters.status === "Active") {
        items = items.filter((i: any) => i.isAvailable);
      } else if (filters.status === "Inactive") {
        items = items.filter((i: any) => !i.isAvailable);
      }
      
      set({ 
        foodItems: items,
        pagination: data.pagination,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch menu items");
    }
  },

  createFoodItem: async () => {},
  updateFoodItem: async () => {},
  deleteFoodItem: async () => {},
}));
