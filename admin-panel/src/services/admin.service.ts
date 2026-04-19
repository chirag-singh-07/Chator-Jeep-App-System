import { apiClient } from "@/lib/api-client";

export const adminService = {
  // Users
  getUsers: async (params: { role?: string; page?: number; search?: string }) => {
    const response = await apiClient.get("/users/admin/all", { params });
    return response.data;
  },
  
  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/admin/${id}`);
    return response.data;
  },

  // Kitchens / Restaurants
  getKitchens: async (params: { status?: string; page?: number; search?: string }) => {
    const response = await apiClient.get("/kitchens/admin/all", { params });
    return response.data;
  },
  
  getKitchenById: async (id: string) => {
    const response = await apiClient.get(`/kitchens/admin/${id}`);
    return response.data;
  },
  
  approveKitchen: async (id: string) => {
    const response = await apiClient.patch(`/kitchens/admin/${id}/approve`);
    return response.data;
  },
  
  rejectKitchen: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/kitchens/admin/${id}/reject`, { reason });
    return response.data;
  },
  
  markKitchenUnderReview: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/kitchens/admin/${id}/review`, { reason });
    return response.data;
  },
};
