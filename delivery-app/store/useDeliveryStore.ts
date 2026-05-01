import { Alert } from "react-native";
import { create } from "zustand";
import { apiClient } from "@/lib/api";
import {
  DeliveryDashboard,
  DeliveryOrder,
  DeliveryPartnerProfile,
} from "@/types";
import { useAuthStore } from "./useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DeliveryState = {
  dashboard: DeliveryDashboard | null;
  orders: DeliveryOrder[];
  selectedOrder: DeliveryOrder | null;
  partnerProfile: DeliveryPartnerProfile | null;
  initialProfileFetched: boolean;
  activeRequest: any | null;
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
  fetchAssignedOrders: () => Promise<void>;
  fetchOrderDetail: (orderId: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  register: (data: any) => Promise<void>;
  toggleAvailability: (
    isOnline: boolean,
    coordinates?: [number, number],
  ) => Promise<void>;
  setActiveRequest: (request: any | null) => void;
  acceptOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: string,
    otp?: string,
  ) => Promise<void>;
  pushLocationUpdate: (coordinates: [number, number]) => Promise<void>;
  mergeRealtimeDelivery: (order: DeliveryOrder) => void;
  simulateOrder: () => void;
};

const sortOrders = (orders: DeliveryOrder[]) =>
  [...orders].sort(
    (a, b) =>
      Number(new Date(b.order?.createdAt ?? 0)) -
      Number(new Date(a.order?.createdAt ?? 0)),
  );

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  dashboard: null,
  orders: [],
  selectedOrder: null,
  partnerProfile: null,
  initialProfileFetched: false,
  activeRequest: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/delivery/profile");
      set({ partnerProfile: response.data, isLoading: false, initialProfileFetched: true });
    } catch (error) {
      set({ partnerProfile: null, isLoading: false, initialProfileFetched: true });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post("/delivery/register", data);
      const { accessToken, partner } = response.data;
      
      // Update the auth token with the new role
      if (accessToken) {
        await AsyncStorage.setItem("delivery-token", accessToken);
        useAuthStore.setState({ token: accessToken });
      }

      set({ partnerProfile: partner, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error?.response?.data?.message || "Registration failed");
    }
  },

  setActiveRequest: (request) => set({ activeRequest: request }),

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
    const response = await apiClient.patch("/delivery/availability", {
      isOnline,
      coordinates,
    });
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
    const response = await apiClient.patch(
      `/delivery/orders/${orderId}/accept`,
    );
    get().mergeRealtimeDelivery(response.data);
  },

  updateOrderStatus: async (orderId, status, otp) => {
    const response = await apiClient.patch(
      `/delivery/orders/${orderId}/status`,
      { status, otp },
    );
    get().mergeRealtimeDelivery(response.data);

    if (status === "COMPLETED") {
      Alert.alert(
        "Delivery completed",
        "The order was marked completed and earnings were credited to your wallet.",
      );
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
      ]).filter((item) => item.status !== "COMPLETED");

      return {
        orders: nextOrders,
        selectedOrder:
          state.selectedOrder?.id === order.id ||
          state.selectedOrder?.orderId === order.orderId
            ? order
            : state.selectedOrder,
        dashboard: state.dashboard
          ? {
              ...state.dashboard,
              activeOrder: order.status !== "COMPLETED" ? order : null,
              assignedOrders: nextOrders,
            }
          : state.dashboard,
      };
    });
  },

  simulateOrder: () => {
    const mockRequest = {
      orderId: "MOCK-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      pickupAddress: "123 Kitchen Street, Gourmet Valley",
      deliveryAddress: "456 Customer Lane, Happy Heights",
      totalAmount: 450,
      itemsCount: 3,
      restaurantName: "The Chatori Kitchen",
      estimatedDistance: "4.2 km",
      estimatedTime: "15 mins",
      earnings: 45.00,
    };
    set({ activeRequest: mockRequest });
  },
}));
