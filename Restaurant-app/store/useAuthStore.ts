import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1'; // Use your machine's IP for real device

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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await axios.post(`${API_URL}/restaurants/login`, { email, password });
          const { accessToken, restaurantStatus, restaurantId } = response.data.data;
          
          set({ 
            token: accessToken, 
            user: { 
              email, 
              status: restaurantStatus, 
              restaurantId,
              id: '', // filled by actual user data if needed
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

      register: async (data) => {
        set({ isLoading: true });
        try {
          await axios.post(`${API_URL}/restaurants/register`, data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error.response?.data?.message || 'Registration failed';
        }
      },

      logout: async () => {
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
