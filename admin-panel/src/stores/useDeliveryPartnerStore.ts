import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

export type PartnerStatus = "pending" | "approved" | "rejected" | "blocked";

export interface DeliveryPartner {
  _id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profilePhoto?: string;
  vehicleType: string;
  vehicleFuelType?: "Petrol" | "EV";
  bikeNumber?: string;
  drivingLicense?: string;
  documents?: {
    aadhaarPhoto?: string;
    panNumber?: string;
    panPhoto?: string;
    drivingLicenseNumber?: string;
    drivingLicensePhoto?: string;
    vehicleRcNumber?: string;
    vehicleRcPhoto?: string;
    bikeInsurancePhoto?: string;
    profilePhoto?: string;
    livePhoto?: string;
  };
  address?: {
    buildingName?: string;
    streetName?: string;
    landmark?: string;
    area?: string;
    state?: string;
    city?: string;
  };
  payoutMethod?: "UPI" | "BANK_ACCOUNT";
  upiId?: string;
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  termsAccepted?: boolean;
  status: PartnerStatus;
  adminRemarks?: string;
  createdAt: string;
}

interface DeliveryPartnerState {
  partners: DeliveryPartner[];
  isLoading: boolean;
  isCreating: boolean;
  fetchPartners: () => Promise<void>;
  updateStatus: (partnerId: string, status: PartnerStatus, remarks?: string) => Promise<void>;
  createPartner: (data: CreatePartnerInput) => Promise<{ success: boolean; partner?: DeliveryPartner }>;
  deletePartner: (partnerId: string) => Promise<void>;
  deleteBulkPartners: (partnerIds: string[]) => Promise<void>;
}

export interface CreatePartnerInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  profilePhoto?: string;
  vehicleType: "Bike" | "Cycle" | "Car";
  vehicleFuelType: "Petrol" | "EV";
  bikeNumber: string;
  drivingLicense: string;
  documents?: {
    aadhaarNumber?: string;
    aadhaarPhoto?: string;
    panNumber?: string;
    panPhoto?: string;
    drivingLicenseNumber?: string;
    drivingLicensePhoto?: string;
    vehicleRcNumber?: string;
    vehicleRcPhoto?: string;
    bikeInsurancePhoto?: string;
    profilePhoto?: string;
    livePhoto?: string;
  };
  address?: {
    buildingName?: string;
    streetName?: string;
    landmark?: string;
    area?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  };
  payoutMethod: "UPI" | "BANK_ACCOUNT";
  upiId?: string;
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  autoApprove?: boolean;
}

export const useDeliveryPartnerStore = create<DeliveryPartnerState>((set) => ({
  partners: [],
  isLoading: false,
  isCreating: false,

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

  createPartner: async (data: CreatePartnerInput) => {
    set({ isCreating: true });
    try {
      const response = await apiClient.post("/delivery/admin/partners/create", data);
      const partner = response.data;
      set((state) => ({
        partners: [partner, ...state.partners],
        isCreating: false,
      }));
      return { success: true, partner };
    } catch (error: any) {
      set({ isCreating: false });
      const responseData = error.response?.data;
      let message = responseData?.message || error.message || "Failed to create delivery partner";
      if (responseData?.errors) {
        const errorDetails = Object.entries(responseData.errors)
          .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        message = `${message} - ${errorDetails}`;
      }
      throw new Error(message);
    }
  },

  deletePartner: async (partnerId: string) => {
    try {
      await apiClient.delete(`/delivery/admin/partners/${partnerId}`);
      set((state) => ({
        partners: state.partners.filter((p) => p._id !== partnerId),
      }));
    } catch (error) {
      console.error("Failed to delete partner", error);
      throw error;
    }
  },

  deleteBulkPartners: async (partnerIds: string[]) => {
    try {
      // Loop over deletions since bulk delete API might not exist
      await Promise.all(
        partnerIds.map((id) => apiClient.delete(`/delivery/admin/partners/${id}`))
      );
      set((state) => ({
        partners: state.partners.filter((p) => !partnerIds.includes(p._id)),
      }));
    } catch (error) {
      console.error("Failed to delete partners in bulk", error);
      throw error;
    }
  },
}));
