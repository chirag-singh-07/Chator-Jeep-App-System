import { create } from "zustand";
import api from "@/lib/api";

interface WalletState {
  balance: number;
  transactions: any[];
  isLoading: boolean;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  isLoading: false,

  fetchBalance: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/orders/wallet");
      set({ balance: res.data.data?.balance ?? 0, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/orders/wallet/transactions");
      set({ transactions: res.data.data || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
