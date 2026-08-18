import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../lib/api/axios';

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
  logout: () => void;
  updateUserStatus: (status: string) => void;
}

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

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
          
          if (typeof window !== "undefined") {
            localStorage.setItem("token", accessToken);
          }
          
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
          const msg = getApiErrorMessage(error, 'Login failed. Please check your credentials.');
          throw new Error(msg);
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post(`/restaurants/register`, data);
          const { accessToken, status, restaurantId } = response.data.data;
          
          if (typeof window !== "undefined") {
            localStorage.setItem("token", accessToken);
          }
          
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
          const msg = error.response?.data?.message || error.message || 'Registration failed due to network settings.';
          throw new Error(msg);
        }
      },

      logout: () => {
        console.log('Logging out user...');
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUserStatus: (status) => {
        set((state) => ({
          user: state.user ? { ...state.user, status } : null
        }));
      }
    }),
    {
      name: 'kitchen-auth-storage',
      // In Next.js, localStorage is only available on the client
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? window.localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
