import { create } from "zustand";
import { adminService } from "@/services/admin.service";

interface UsersState {
  users: any[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: {
    role?: string;
    search?: string;
    page: number;
  };

  fetchUsers: () => Promise<void>;
  setFilters: (filters: Partial<UsersState["filters"]>) => void;
  createAdmin: (data: any) => Promise<any>;
  createDelivery: (data: any) => Promise<any>;
  updateUserStatus: (id: string, status: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    role: "ALL",
    search: "",
    page: 1,
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    // We don't auto-fetch here to give the component control, 
    // but we could if we wanted a reactive approach.
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { role, search, page } = get().filters;
      const response = await adminService.getUsers({ role, search, page });
      if (response.success) {
        set({ users: response.users, total: response.pagination.total, loading: false });
      } else {
        set({ error: response.message || "Failed to fetch users", loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", loading: false });
    }
  },

  createAdmin: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await adminService.createAdmin(data);
      if (response.success) {
        // Optimistic refresh or manual fetch call from component
        await get().fetchUsers();
        set({ loading: false });
        return response;
      }
      throw new Error(response.message || "Failed to create admin");
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createDelivery: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await adminService.createDelivery(data);
      if (response.success) {
        await get().fetchUsers();
        set({ loading: false });
        return response;
      }
      throw new Error(response.message || "Failed to create delivery");
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateUserStatus: async (id: string, status: string) => {
    // Implementation for updating user status
    // For now we just refresh the list
    await get().fetchUsers();
  }
}));
