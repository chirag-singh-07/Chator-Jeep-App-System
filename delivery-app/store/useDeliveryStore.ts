import { Alert } from "react-native";
import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { DeliveryDashboard, DeliveryOrder } from "@/types";

type DeliveryState = {
  dashboard: DeliveryDashboard | null;
  orders: DeliveryOrder[];
  selectedOrder: DeliveryOrder | null;
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
  fetchAssignedOrders: () => Promise<void>;
  fetchOrderDetail: (orderId: string) => Promise<void>;
  toggleAvailability: (isOnline: boolean, coordinates?: [number, number]) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: "PICKED_UP" | "DELIVERED") => Promise<void>;
  pushLocationUpdate: (coordinates: [number, number]) => Promise<void>;
  mergeRealtimeDelivery: (order: DeliveryOrder) => void;
};

const sortOrders = (orders: DeliveryOrder[]) =>
  [...orders].sort((a, b) => Number(new Date(b.order?.createdAt ?? 0)) - Number(new Date(a.order?.createdAt ?? 0)));

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  dashboard: null,
  orders: [],
  selectedOrder: null,
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/delivery/me/dashboard");
      set({
        dashboard: response.data,
        orders: sortOrders(response.data.assignedOrders ?? []),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchAssignedOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/delivery/orders/assigned");
      set({
        orders: sortOrders(response.data ?? []),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchOrderDetail: async (orderId) => {
    const response = await apiClient.get(`/delivery/orders/${orderId}`);
    set({ selectedOrder: response.data });
  },

  toggleAvailability: async (isOnline, coordinates) => {
    const response = await apiClient.patch("/delivery/availability", { isOnline, coordinates });
    set((state) => ({
      dashboard: state.dashboard
        ? {
            ...state.dashboard,
            availability: {
              ...state.dashboard.availability,
              ...response.data,
            },
          }
        : state.dashboard,
    }));
  },

  acceptOrder: async (orderId) => {
    const response = await apiClient.patch(`/delivery/orders/${orderId}/accept`);
    get().mergeRealtimeDelivery(response.data);
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.patch(`/delivery/orders/${orderId}/status`, { status });
    get().mergeRealtimeDelivery(response.data);

    if (status === "DELIVERED") {
      Alert.alert("Delivery completed", "The order was marked delivered and earnings were credited to your wallet.");
      await get().fetchDashboard();
    }
  },

  pushLocationUpdate: async (coordinates) => {
    await apiClient.post("/delivery/location", { coordinates });
  },

  mergeRealtimeDelivery: (order) => {
    set((state) => {
      const nextOrders = sortOrders([
        order,
        ...state.orders.filter((existing) => existing.id !== order.id),
      ]).filter((item) => item.status !== "DELIVERED");

      return {
        orders: nextOrders,
        selectedOrder:
          state.selectedOrder?.id === order.id || state.selectedOrder?.orderId === order.orderId
            ? order
            : state.selectedOrder,
        dashboard: state.dashboard
          ? {
              ...state.dashboard,
              activeOrder: order.status !== "DELIVERED" ? order : null,
              assignedOrders: nextOrders,
            }
          : state.dashboard,
      };
    });
  },
}));
