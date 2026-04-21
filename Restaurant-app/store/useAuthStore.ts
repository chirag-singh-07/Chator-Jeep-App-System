import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantId?: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserStatus: (status: string) => void;
  uploadBranding: (logoJson: any, bannerJson: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post(`/restaurants/login`, { email, password });
          const { accessToken, status, restaurantId } = response.data.data;
          
          await AsyncStorage.setItem("token", accessToken);
          set({ 
            token: accessToken, 
            user: { 
              email, 
              status: status, 
              restaurantId,
              id: '', 
              name: '',
              role: 'KITCHEN'
            }, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error.response?.data?.message || 'Login failed';
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post(`/restaurants/register`, data);
          const { accessToken, status, restaurantId } = response.data.data;
          
          await AsyncStorage.setItem("token", accessToken);
          set({ 
            token: accessToken,
            user: {
              email: data.email,
              status: status,
              restaurantId,
              id: '',
              name: data.ownerName,
              role: 'KITCHEN'
            },
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error.response?.data?.message || error.message || 'Registration failed due to network settings.';
        }
      },

      uploadBranding: async (logo, banner) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          if (logo) {
            // @ts-ignore
            formData.append('logo', {
              uri: logo.uri,
              name: 'logo.jpg',
              type: 'image/jpeg',
            });
          }
          if (banner) {
            // @ts-ignore
            formData.append('banner', {
              uri: banner.uri,
              name: 'banner.jpg',
              type: 'image/jpeg',
            });
          }

          // 1. Upload images
          const uploadRes = await apiClient.post('/uploads/restaurant-brand', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const { logo: logoUrls, banner: bannerUrls } = uploadRes.data.data;

          // 2. Update restaurant branding in database
          await apiClient.patch('/restaurants/me/branding', {
            logoUrls,
            bannerUrls,
          });

          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error.response?.data?.message || error.message || 'Image upload failed';
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUserStatus: (status) => {
        set((state) => ({
          user: state.user ? { ...state.user, status } : null
        }));
      }
    }),
    {
      name: 'restaurant-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
