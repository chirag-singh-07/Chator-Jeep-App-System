import { create } from "zustand";

interface DashboardState {
  stats: any | null;
  analytics: any | null;
  loading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  analytics: null,
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true });
    // API Implementation
    set({ loading: false });
  },
}));
