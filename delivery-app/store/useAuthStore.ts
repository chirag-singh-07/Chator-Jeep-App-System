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
