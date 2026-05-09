import { create } from 'zustand';
import { apiClient as api } from '@/lib/api-client';

export interface BannerRecord {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType: 'RESTAURANT' | 'CATEGORY' | 'EXTERNAL' | 'OFFER';
  linkId?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

interface BannerState {
  banners: BannerRecord[];
  loading: boolean;
  fetchBanners: () => Promise<void>;
  createBanner: (data: Partial<BannerRecord>) => Promise<void>;
  updateBanner: (id: string, data: Partial<BannerRecord>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  loading: false,

  fetchBanners: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/banners/admin/all');
      set({ banners: res.data.data || [], loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createBanner: async (data) => {
    try {
      await api.post('/banners/admin/create', data);
      await get().fetchBanners();
    } catch (error) {
      throw error;
    }
  },

  updateBanner: async (id, data) => {
    try {
      await api.put(`/banners/admin/update/${id}`, data);
      await get().fetchBanners();
    } catch (error) {
      throw error;
    }
  },

  deleteBanner: async (id) => {
    try {
      await api.delete(`/banners/admin/delete/${id}`);
      set({ banners: get().banners.filter(b => b._id !== id) });
    } catch (error) {
      throw error;
    }
  },
}));
