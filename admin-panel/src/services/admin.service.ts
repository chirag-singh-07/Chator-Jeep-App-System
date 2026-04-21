import { apiClient } from "@/lib/api-client";

export const adminService = {
  // Users
  getUsers: async (params: { role?: string; page?: number; search?: string }) => {
    // If role is undefined or "all", we pass empty or "ALL" depending on backend expectation
    // Our updated backend handles role: undefined or role !== "ALL"
    const response = await apiClient.get("/users/admin/all", { 
      params: {
        ...params,
        role: params.role === "all" ? "ALL" : params.role
      } 
    });
    return response.data;
  },
  
  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/admin/${id}`);
    return response.data;
  },

  createAdmin: async (data: any) => {
    const response = await apiClient.post("/users/admin/create", data);
    return response.data;
  },

  createDelivery: async (data: any) => {
    const response = await apiClient.post("/users/admin/delivery", data);
    return response.data;
  },

  // Restaurants (Unified)
  getRestaurants: async (params: { status?: string; page?: number; search?: string }) => {
    const response = await apiClient.get("/restaurants/admin/all", { params });
    return response.data;
  },
  
  getRestaurantById: async (id: string) => {
    const response = await apiClient.get(`/restaurants/admin/${id}`);
    return response.data;
  },
  
  approveRestaurant: async (id: string) => {
    const response = await apiClient.patch(`/restaurants/admin/${id}/approve`);
    return response.data;
  },
  
  rejectRestaurant: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/restaurants/admin/${id}/reject`, { reason });
    return response.data;
  },
  
  flagRestaurant: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/restaurants/admin/${id}/flag`, { reason });
    return response.data;
  },

  getDeliveryPayouts: async (params?: { status?: string }) => {
    const response = await apiClient.get("/wallet/admin/delivery-payouts", { params });
    return response.data;
  },

  processDeliveryPayout: async (
    id: string,
    payload: { status: "APPROVED" | "REJECTED"; note?: string }
  ) => {
    const response = await apiClient.patch(`/wallet/admin/delivery-payouts/${id}`, payload);
    return response.data;
  },
};
