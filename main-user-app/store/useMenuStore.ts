import { create } from "zustand";
import api from "@/lib/api";

export interface Restaurant {
  _id: string;
  name: string;
  rating: number;
  cuisines: string[];
  isOpen: boolean;
  logoUrls?: Record<string, string>;
  bannerUrls?: Record<string, string>;
  address: {
    line1: string;
    city: string;
  };
  location: {
    coordinates: [number, number];
  };
}

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  image?: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType: string;
  linkId?: string;
}

interface MenuState {
  restaurants: Restaurant[];
  categories: Category[];
  banners: Banner[];
  selectedRestaurant: Restaurant | null;
  popularItems: any[];
  isLoading: boolean;
  error: string | null;
  fetchHomeData: (lat?: number, lng?: number) => Promise<void>;
  fetchRestaurants: (params?: any) => Promise<void>;
  fetchRestaurantDetail: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  restaurants: [],
  categories: [],
  banners: [],
  selectedRestaurant: null,
  menu: [],
  popularItems: [],
  isLoading: false,
  error: null,

  fetchHomeData: async (lat, lng) => {
    set({ isLoading: true, error: null });
    try {
      const [resCategories, resRestaurants, resPopular] = await Promise.all([
        api.get("/categories"),
        api.get("/restaurants", { params: { lat, lng, limit: 10 } }),
        api.get("/restaurants/menu/popular"),
      ]);

      set({
        categories: resCategories.data.data || [],
        restaurants: resRestaurants.data.restaurants || [],
        popularItems: resPopular.data.data || [],
        isLoading: false,
      });

      // Fetch banners separately to avoid failing the whole request if banners endpoint doesn't exist yet
      try {
        const resBanners = await api.get("/banners");
        set({ banners: resBanners.data.data || [] });
      } catch (err) {
        console.log("Banners endpoint not available yet or failed:", err);
        set({ banners: [] });
      }

    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchRestaurants: async (params) => {
    set({ isLoading: true });
    try {
      const res = await api.get("/restaurants", { params });
      set({ restaurants: res.data.restaurants || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchRestaurantDetail: async (id) => {
    set({ isLoading: true, selectedRestaurant: null, menu: [] });
    try {
      const [resDetail, resMenu] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get(`/restaurants/${id}/menu`),
      ]);

      set({
        selectedRestaurant: resDetail.data.data,
        menu: resMenu.data.data || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));

