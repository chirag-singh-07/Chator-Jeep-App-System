import { create } from "zustand";

interface OrdersState {
  orders: any[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    page: number;
  };

  fetchOrders: () => Promise<void>;
  setFilters: (filters: Partial<OrdersState["filters"]>) => void;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  loading: false,
  error: null,
  filters: {
    status: "all",
    page: 1,
  },

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  fetchOrders: async () => {
    set({ loading: true });
    // API Call placeholder
    set({ loading: false });
  },

  updateOrderStatus: async (id, status) => {
    // API Call placeholder
  }
}));
