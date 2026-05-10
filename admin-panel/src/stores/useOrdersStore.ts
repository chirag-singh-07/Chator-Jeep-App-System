import { create } from "zustand";
import { adminService } from "@/services/admin.service";

interface OrdersState {
  orders: any[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    page: number;
    search: string;
  };
  total: number;

  fetchOrders: () => Promise<void>;
  setFilters: (filters: Partial<OrdersState["filters"]>) => void;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  filters: {
    status: "all",
    page: 1,
    search: "",
  },
  total: 0,

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { status, page, search } = get().filters;
      const response = await adminService.getOrders({ status, page, search });
      if (response.success) {
        set({ orders: response.orders, total: response.pagination.total, loading: false });
      } else {
        set({ error: response.message || "Failed to fetch orders", loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", loading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    // Implement API call for updating order status if needed
  }
}));
