import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { apiClient } from "@/lib/api";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  requestOtp: (email: string, type: "register" | "login" | "forgot_password") => Promise<void>;
  logout: () => Promise<void>;
  markHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      markHydrated: () => set({ hasHydrated: true }),

      register: async (data) => {
        set({ isLoading: true });
        try {
          // Force the role to DELIVERY for this app
          const response = await apiClient.post("/auth/register", { ...data, role: "DELIVERY" });
          const { accessToken, user } = response.data;

          await AsyncStorage.setItem("delivery-token", accessToken);
          set({
            token: accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.message || error?.message || "Registration failed");
        }
      },

      requestOtp: async (email, type) => {
        set({ isLoading: true });
        try {
          await apiClient.post("/auth/request-otp", { email, type });
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.message || error?.message || "Failed to send OTP");
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post("/auth/login", { email, password });
          const { accessToken, user } = response.data;

          if (user.role !== "DELIVERY") {
            throw new Error("This account is not a delivery partner account.");
          }

          await AsyncStorage.setItem("delivery-token", accessToken);
          set({
            token: accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.message || error?.message || "Login failed");
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem("delivery-token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "delivery-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          void AsyncStorage.setItem("delivery-token", state.token);
        }
        state?.markHydrated();
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
