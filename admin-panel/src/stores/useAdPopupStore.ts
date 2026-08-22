import { create } from "zustand";
import { apiClient as api } from "@/lib/api-client";

export interface AdPopupRecord {
  _id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  type: "general" | "new_user";
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdPopupState {
  popups: AdPopupRecord[];
  loading: boolean;
  error: string | null;
  fetchPopups: () => Promise<void>;
  createPopup: (data: Partial<AdPopupRecord>) => Promise<void>;
  updatePopup: (id: string, data: Partial<AdPopupRecord>) => Promise<void>;
  deletePopup: (id: string) => Promise<void>;
}

export const useAdPopupStore = create<AdPopupState>((set) => ({
  popups: [],
  loading: false,
  error: null,

  fetchPopups: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/ad-popup");
      set({ popups: res.data.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPopup: async (data) => {
    try {
      await api.post("/ad-popup", data);
      await useAdPopupStore.getState().fetchPopups();
    } catch (err: any) {
      throw err;
    }
  },

  updatePopup: async (id, data) => {
    try {
      await api.put(`/ad-popup/${id}`, data);
      await useAdPopupStore.getState().fetchPopups();
    } catch (err: any) {
      throw err;
    }
  },

  deletePopup: async (id) => {
    try {
      await api.delete(`/ad-popup/${id}`);
      await useAdPopupStore.getState().fetchPopups();
    } catch (err: any) {
      throw err;
    }
  },
}));
