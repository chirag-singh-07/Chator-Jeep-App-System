import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  hasSeenOnboarding: boolean;
  setAuth: (user: User, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      hasSeenOnboarding: false,
      setAuth: async (user, tokens) => {
        await SecureStore.setItemAsync("accessToken", tokens.accessToken);
        await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);
        set({ user, isAuthenticated: true });
      },
      logout: async () => {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        set({ user: null, isAuthenticated: false });
      },
      setHasSeenOnboarding: (value: boolean) => set({ hasSeenOnboarding: value }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
