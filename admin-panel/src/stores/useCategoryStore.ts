import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export interface CategoryRecord {
  id: string;
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: string[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryState {
  categories: CategoryRecord[];
  loading: boolean;
  error: string | null;

  fetchCategories: (options?: { activeOnly?: boolean }) => Promise<void>;
  getCategoryById: (id: string) => Promise<CategoryRecord>;
  createCategory: (data: Partial<CategoryRecord>) => Promise<CategoryRecord>;
  updateCategory: (id: string, data: Partial<CategoryRecord>) => Promise<CategoryRecord>;
  deleteCategory: (id: string) => Promise<void>;
}

const normalizeCategory = (category: Omit<CategoryRecord, "id">): CategoryRecord => ({
  ...category,
  id: category._id,
});

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (options) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get("/categories", {
        params: { active: options?.activeOnly ? "true" : undefined },
      });

      if (response.data.success) {
        set({
          categories: (response.data.data as Omit<CategoryRecord, "id">[]).map(normalizeCategory),
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  getCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/categories/${id}`);
      const category = normalizeCategory(response.data.data as Omit<CategoryRecord, "id">);
      set({ loading: false });
      return category;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createCategory: async (data) => {
    set({ loading: true });
    try {
      const response = await apiClient.post("/categories", data);
      const state = useCategoryStore.getState();
      await state.fetchCategories();
      return normalizeCategory(response.data.data as Omit<CategoryRecord, "id">);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true });
    try {
      const response = await apiClient.patch(`/categories/${id}`, data);
      const state = useCategoryStore.getState();
      await state.fetchCategories();
      return normalizeCategory(response.data.data as Omit<CategoryRecord, "id">);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true });
    try {
      await apiClient.delete(`/categories/${id}`);
      const state = useCategoryStore.getState();
      await state.fetchCategories();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
