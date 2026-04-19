import { create } from "zustand";
import axios from "axios";

// Accessing API URL from environment consistently
const API_BASE = "http://localhost:5000/api/v1";

interface CategoryState {
  categories: any[];
  loading: boolean;
  error: string | null;

  fetchCategories: (options?: { activeOnly?: boolean }) => Promise<void>;
  createCategory: (data: any) => Promise<void>;
  updateCategory: (id: string, data: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (options) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth-storage") 
        ? JSON.parse(localStorage.getItem("auth-storage")!).state.token 
        : null;

      const response = await axios.get(`${API_BASE}/categories`, {
        params: { active: options?.activeOnly },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        set({ categories: response.data.data, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createCategory: async (data) => {
    set({ loading: true });
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage")!).state.token;
      await axios.post(`${API_BASE}/categories`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh list
      const state = useCategoryStore.getState();
      await state.fetchCategories();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true });
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage")!).state.token;
      await axios.patch(`${API_BASE}/categories/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const state = useCategoryStore.getState();
      await state.fetchCategories();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true });
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage")!).state.token;
      await axios.delete(`${API_BASE}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const state = useCategoryStore.getState();
      await state.fetchCategories();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
