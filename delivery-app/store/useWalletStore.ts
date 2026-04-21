import { Alert } from "react-native";
import { router } from "expo-router";
import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { WalletOverview } from "@/types";

type WalletState = {
  overview: WalletOverview | null;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchWalletOverview: () => Promise<void>;
  requestPayout: (payload: {
    amount: number;
    paymentMethod: {
      type: "UPI" | "BANK_ACCOUNT";
      upiId?: string;
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
    };
  }) => Promise<void>;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  overview: null,
  isLoading: false,
  isSubmitting: false,

  fetchWalletOverview: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/wallet/delivery/overview");
      set({ overview: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  requestPayout: async (payload) => {
    set({ isSubmitting: true });
    try {
      await apiClient.post("/wallet/delivery/payouts", payload);
      await get().fetchWalletOverview();
      set({ isSubmitting: false });
      Alert.alert("Payout requested", "Your request was submitted to admin for review.");
      router.back();
    } catch (error: any) {
      set({ isSubmitting: false });
      Alert.alert("Unable to request payout", error?.response?.data?.message || "Please try again.");
    }
  },
}));
