import { create } from 'zustand';
import { apiClient } from '../lib/api';

export interface Order {
  _id: string;
  orderNumber: string;
  customerData: { name: string; phone: string; address?: string };
  items: { name: string; quantity: number; price: number; addOns?: string[] }[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  incomingOrder: Order | null;
  isLoading: boolean;
  
  fetchOrders: () => Promise<void>;
  setIncomingOrder: (order: Order | null) => void;
  acceptOrder: (orderId: string, timeToPrep?: number) => Promise<void>;
  rejectOrder: (orderId: string, reason?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  incomingOrder: null,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/restaurants/orders/active');
      set({ orders: response.data.data, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },

  setIncomingOrder: (order) => {
    set({ incomingOrder: order });
  },

  acceptOrder: async (orderId, timeToPrep = 15) => {
    try {
      await apiClient.post(`/restaurants/orders/${orderId}/accept`, { timeToPrep });
      set({ incomingOrder: null });
      await get().fetchOrders();
    } catch (e) {
      console.error(e);
    }
  },

  rejectOrder: async (orderId, reason = "Kitchen full") => {
    try {
      await apiClient.post(`/restaurants/orders/${orderId}/reject`, { reason });
      set({ incomingOrder: null });
      await get().fetchOrders();
    } catch (e) {
      console.error(e);
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await apiClient.put(`/restaurants/orders/${orderId}/status`, { status });
      await get().fetchOrders();
    } catch (e) {
      console.error(e);
    }
  }
}));
