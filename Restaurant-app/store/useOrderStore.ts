import { create } from 'zustand';
import { apiClient } from '../lib/api';

export interface Order {
  _id: string;
  orderNumber: string;
  customerData: { name: string; phone: string; address?: string };
  items: { name: string; quantity: number; price: number; addOns?: string[] }[];
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
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
      // GET /orders/restaurant — lists orders for the authenticated restaurant owner
      const response = await apiClient.get('/orders/restaurant');
      set({ orders: response.data.data || [], isLoading: false });
    } catch (e) {
      console.error('fetchOrders failed:', e);
      set({ isLoading: false });
    }
  },

  setIncomingOrder: (order) => {
    set({ incomingOrder: order });
  },

  acceptOrder: async (orderId, _timeToPrep = 15) => {
    try {
      // Backend uses PATCH /orders/:orderId/status with UPPERCASE status
      await apiClient.patch(`/orders/${orderId}/status`, { status: 'ACCEPTED' });
      set({ incomingOrder: null });
      await get().fetchOrders();
    } catch (e) {
      console.error('acceptOrder failed:', e);
      // Always dismiss the alert even on failure so UI doesn't freeze
      set({ incomingOrder: null });
    }
  },

  rejectOrder: async (orderId, _reason = 'Kitchen full') => {
    try {
      // Backend uses CANCELLED for rejection
      await apiClient.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
      set({ incomingOrder: null });
      await get().fetchOrders();
    } catch (e) {
      console.error('rejectOrder failed:', e);
      // Always dismiss the alert even on failure so UI doesn't freeze
      set({ incomingOrder: null });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status });
      await get().fetchOrders();
    } catch (e) {
      console.error('updateOrderStatus failed:', e);
    }
  },
}));
