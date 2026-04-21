import { create } from "zustand";
import { adminService } from "@/services/admin.service";

interface RestaurantState {
  restaurants: any[];
  total: number;
  loading: boolean;
  error: string | null;
  counts: Record<string, number>;
  selectedRestaurant: any | null;
  filters: {
    status: string;
    search: string;
    page: number;
  };

  fetchRestaurants: () => Promise<void>;
  fetchRestaurantById: (id: string) => Promise<void>;
  setFilters: (filters: Partial<RestaurantState["filters"]>) => void;
  approveRestaurant: (id: string) => Promise<void>;
  rejectRestaurant: (id: string, reason: string) => Promise<void>;
  flagRestaurant: (id: string, reason: string) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurants: [],
  total: 0,
  loading: false,
  error: null,
  counts: {
    ALL: 0,
    REQUESTED: 0,
    ACTIVE: 0,
    REJECTED: 0,
    CLOSED: 0,
    FLAGGED: 0,
  },
  selectedRestaurant: null,
  filters: {
    status: "ALL",
    search: "",
    page: 1,
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  fetchRestaurants: async () => {
    set({ loading: true, error: null });
    try {
      const { status, search, page } = get().filters;
      const response = await adminService.getRestaurants({ 
        status: status === "ALL" ? undefined : status, 
        search, 
        page 
      });
      if (response.success) {
        set({ 
          restaurants: response.restaurants, 
          total: response.pagination.total, 
          counts: response.counts || get().counts,
          loading: false 
        });
      } else {
        set({ error: response.message || "Failed to fetch restaurants", loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", loading: false });
    }
  },

  fetchRestaurantById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await adminService.getRestaurantById(id);
      if (response.success) {
        set({ selectedRestaurant: response.data, loading: false });
      } else {
        set({ error: response.message || "Failed to fetch restaurant details", loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", loading: false });
    }
  },

  approveRestaurant: async (id: string) => {
    try {
      set({ loading: true });
      await adminService.approveRestaurant(id);
      // Refresh list and detail
      await get().fetchRestaurants();
      if (get().selectedRestaurant?._id === id) {
        await get().fetchRestaurantById(id);
      }
      set({ loading: false });
    } catch (err: any) {
       set({ error: err.message, loading: false });
       throw err;
    }
  },

  rejectRestaurant: async (id: string, reason: string) => {
    try {
      set({ loading: true });
      await adminService.rejectRestaurant(id, reason);
      await get().fetchRestaurants();
      if (get().selectedRestaurant?._id === id) {
        await get().fetchRestaurantById(id);
      }
      set({ loading: false });
    } catch (err: any) {
       set({ error: err.message, loading: false });
       throw err;
    }
  },

  flagRestaurant: async (id: string, reason: string) => {
    try {
      set({ loading: true });
      await adminService.flagRestaurant(id, reason);
      await get().fetchRestaurants();
      if (get().selectedRestaurant?._id === id) {
        await get().fetchRestaurantById(id);
      }
      set({ loading: false });
    } catch (err: any) {
       set({ error: err.message, loading: false });
       throw err;
    }
  }
}));
