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
  profileFetchError: string | null;
  profileFetchErrorStatus: number | null;
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

const isMockOrderId = (orderId: string) => orderId.startsWith("MOCK-");

const createTimeline = (status: DeliveryOrder["status"]) => {
  const now = new Date().toISOString();
  return [
    { label: "Accepted", done: true, date: now },
    { label: "Picked up", done: ["PICKED_UP", "ARRIVED", "COMPLETED"].includes(status), date: status === "ACCEPTED" ? null : now },
    { label: "Arrived", done: ["ARRIVED", "COMPLETED"].includes(status), date: ["ACCEPTED", "PICKED_UP"].includes(status) ? null : now },
    { label: "Completed", done: status === "COMPLETED", date: status === "COMPLETED" ? now : null },
  ];
};

const createMockDeliveryOrder = (orderId: string, status: DeliveryOrder["status"] = "ACCEPTED"): DeliveryOrder => {
  const createdAt = new Date().toISOString();

  return {
    id: orderId,
    orderId,
    status,
    acceptedAt: createdAt,
    deliveryOtp: "1234",
    route: {
      pickupAddress: "The Chatori Kitchen, Sector 15, Gurugram",
      dropAddress: "Happy Heights, Tower B, Sector 46, Gurugram",
      pickupCoordinates: [77.043, 28.4595],
      dropCoordinates: [77.0588, 28.4368],
    },
    restaurant: {
      id: "mock-restaurant",
      name: "The Chatori Kitchen",
      phone: "9876543210",
      address: "Sector 15, Gurugram",
      coordinates: [77.043, 28.4595],
    },
    customer: {
      id: "mock-customer",
      name: "Aman Sharma",
      phone: "9999999999",
      address: "Happy Heights, Tower B, Sector 46, Gurugram",
      coordinates: [77.0588, 28.4368],
    },
    order: {
      id: orderId,
      totalAmount: 450,
      paymentStatus: "PAID",
      status: "OUT_FOR_DELIVERY",
      createdAt,
      items: [
        { menuItemId: "mock-paneer-roll", name: "Paneer Tikka Roll", price: 180, quantity: 1 },
        { menuItemId: "mock-momos", name: "Veg Steamed Momos", price: 140, quantity: 1 },
        { menuItemId: "mock-coffee", name: "Cold Coffee", price: 130, quantity: 1 },
      ],
    },
    paymentSummary: {
      totalAmount: 450,
      paymentStatus: "PAID",
    },
    earnings: {
      estimatedAmount: 45,
      finalAmount: 45,
      distanceKm: 4.2,
    },
    statusTimeline: createTimeline(status),
  };
};

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  dashboard: null,
  orders: [],
  selectedOrder: null,
  partnerProfile: null,
  initialProfileFetched: false,
  profileFetchError: null,
  profileFetchErrorStatus: null,
  activeRequest: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/delivery/profile");
      set({
        partnerProfile: response.data,
        isLoading: false,
        initialProfileFetched: true,
        profileFetchError: null,
        profileFetchErrorStatus: null,
      });
    } catch (error: any) {
      const status = error?.response?.status ?? null;
      set({
        partnerProfile: null,
        isLoading: false,
        initialProfileFetched: true,
        profileFetchError:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load your delivery profile.",
        profileFetchErrorStatus: status,
      });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post("/delivery/register", data);
      const accessToken = response.data?.accessToken;
      const partner = response.data?.partner ?? response.data;
      
      // Update the auth token with the new role
      if (accessToken) {
        await AsyncStorage.setItem("delivery-token", accessToken);
        useAuthStore.setState({ token: accessToken, isAuthenticated: true });
      }

      set({
        partnerProfile: partner,
        initialProfileFetched: true,
        profileFetchError: null,
        profileFetchErrorStatus: null,
        isLoading: false,
      });
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
      set((state) => {
        const mockOrders = state.orders.filter((order) => isMockOrderId(order.orderId));
        const assignedOrders = sortOrders([...(response.data.assignedOrders ?? []), ...mockOrders]);
        return {
          dashboard: {
            ...response.data,
            activeOrder: mockOrders[0] ?? response.data.activeOrder,
            assignedOrders,
          },
          orders: assignedOrders,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchAssignedOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/delivery/orders/assigned");
      set((state) => {
        const mockOrders = state.orders.filter((order) => isMockOrderId(order.orderId));
        return {
          orders: sortOrders([...(response.data ?? []), ...mockOrders]),
          isLoading: false,
        };
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchOrderDetail: async (orderId) => {
    if (isMockOrderId(orderId)) {
      const mockOrder = get().orders.find((order) => order.orderId === orderId);
      set({ selectedOrder: mockOrder ?? createMockDeliveryOrder(orderId) });
      return;
    }

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
    if (isMockOrderId(orderId)) {
      const mockOrder = createMockDeliveryOrder(orderId);
      get().mergeRealtimeDelivery(mockOrder);
      set({ activeRequest: null, selectedOrder: mockOrder });
      return;
    }

    const response = await apiClient.patch(
      `/delivery/orders/${orderId}/accept`,
    );
    get().mergeRealtimeDelivery(response.data);
  },

  updateOrderStatus: async (orderId, status, otp) => {
    if (isMockOrderId(orderId)) {
      const currentOrder =
        get().orders.find((order) => order.orderId === orderId) ??
        get().selectedOrder ??
        createMockDeliveryOrder(orderId);
      const nextStatus = status as DeliveryOrder["status"];

      if (nextStatus === "COMPLETED" && otp !== currentOrder.deliveryOtp) {
        Alert.alert("Invalid OTP", "Use 1234 for the test order.");
        return;
      }

      const nextOrder: DeliveryOrder = {
        ...currentOrder,
        status: nextStatus,
        pickedUpAt: ["PICKED_UP", "ARRIVED", "COMPLETED"].includes(nextStatus)
          ? new Date().toISOString()
          : currentOrder.pickedUpAt,
        deliveredAt: nextStatus === "COMPLETED" ? new Date().toISOString() : currentOrder.deliveredAt,
        statusTimeline: createTimeline(nextStatus),
      };

      get().mergeRealtimeDelivery(nextOrder);

      if (nextStatus === "COMPLETED") {
        set((state) => ({
          selectedOrder: nextOrder,
          dashboard: state.dashboard
            ? {
                ...state.dashboard,
                activeOrder: null,
                wallet: {
                  ...state.dashboard.wallet,
                  balance: state.dashboard.wallet.balance + (nextOrder.earnings?.finalAmount ?? 0),
                  totalEarnings: state.dashboard.wallet.totalEarnings + (nextOrder.earnings?.finalAmount ?? 0),
                },
              }
            : state.dashboard,
        }));
        Alert.alert(
          "Test delivery completed",
          "Mock order completed. Earnings were added locally for testing.",
        );
      }
      return;
    }

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
          : {
              availability: {
                isOnline: true,
                isAvailable: order.status === "COMPLETED",
              },
              activeOrder: order.status !== "COMPLETED" ? order : null,
              assignedOrders: nextOrders,
              wallet: {
                balance: 0,
                heldBalance: 0,
                totalEarnings: 0,
                totalPaidOut: 0,
                pendingPayouts: 0,
              },
            },
      };
    });
  },

  simulateOrder: () => {
    const orderId = "MOCK-" + Math.random().toString(36).slice(2, 9).toUpperCase();
    const mockRequest = {
      orderId,
      pickupAddress: "The Chatori Kitchen, Sector 15, Gurugram",
      deliveryAddress: "Happy Heights, Tower B, Sector 46, Gurugram",
      totalAmount: 450,
      itemsCount: 3,
      restaurantName: "The Chatori Kitchen",
      distanceKm: 4.2,
      estimatedTime: "15 mins",
      earnings: 45,
      expiresIn: 30,
    };
    set({ activeRequest: mockRequest });
  },
}));
