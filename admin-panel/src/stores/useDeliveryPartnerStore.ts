import { create } from "zustand";
import { apiClient } from "@/lib/api";

export type PartnerStatus = "pending" | "approved" | "rejected" | "blocked";

export interface DeliveryPartner {
  _id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  vehicleType: string;
  status: PartnerStatus;
  adminRemarks?: string;
  createdAt: string;
}

interface DeliveryPartnerState {
  partners: DeliveryPartner[];
  isLoading: boolean;
  fetchPartners: () => Promise<void>;
  updateStatus: (partnerId: string, status: PartnerStatus, remarks?: string) => Promise<void>;
}

export const useDeliveryPartnerStore = create<DeliveryPartnerState>((set) => ({
  partners: [],
  isLoading: false,

  fetchPartners: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/delivery/admin/partners");
      set({ partners: response.data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  updateStatus: async (partnerId, status, remarks) => {
    try {
      await apiClient.patch(`/delivery/admin/partners/${partnerId}/status`, { status, remarks });
      set((state) => ({
        partners: state.partners.map((p) =>
          p._id === partnerId ? { ...p, status, adminRemarks: remarks } : p
        ),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}));
