import { create } from "zustand";
import api from "@/lib/api";

interface Order {
  _id: string;
  status: string;
  totalAmount: number;
  items: any[];
  createdAt: string;
  restaurantId: any;
  restaurantName?: string;
  deliveryId?: any;
  deliveryOtp?: string;
  isReviewed?: boolean;
  paymentMethod?: string;
  paymentStatus?: string;
  walletAmountUsed?: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  placeOrder: (data: any) => Promise<any>;
  fetchMyOrders: () => Promise<void>;
  fetchOrderDetail: (id: string) => Promise<void>;
  cancelOrder: (id: string, reason?: string) => Promise<void>;
  updateCurrentOrderFromSocket: (data: any) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  placeOrder: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/orders", data);
      set({ isLoading: false });
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/orders/my");
      set({ orders: res.data.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchOrderDetail: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/orders/${id}`);
      set({ currentOrder: res.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  cancelOrder: async (id, reason) => {
    set({ isLoading: true });
    try {
      await api.delete(`/orders/${id}`, { data: { reason } });
      // Refresh
      await get().fetchOrderDetail(id);
      set({ isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      set({ isLoading: false });
      throw new Error(msg);
    }
  },

  updateCurrentOrderFromSocket: (data) => {
    set((state) => ({
      currentOrder:
        state.currentOrder?._id === data.orderId || state.currentOrder?._id === data._id
          ? { ...state.currentOrder, ...data }
          : state.currentOrder,
      orders: state.orders.map((o) =>
        o._id === data.orderId || o._id === data._id ? { ...o, ...data } : o
      ),
    }));
  },
}));
