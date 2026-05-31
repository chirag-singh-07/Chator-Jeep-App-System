import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DocumentType =
  | "aadhaarPhoto"
  | "panPhoto"
  | "drivingLicensePhoto"
  | "vehicleRcPhoto"
  | "bikeInsurancePhoto"
  | "profilePhoto"
  | "livePhoto";

export type DocumentInfo = {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  exists: boolean;
};

type RegistrationFormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  otp: string;
  vehicleType: "Bike" | "Cycle" | "Car";
  fuelType: "Petrol" | "EV";
  bikeNumber: string;
  aadhaarNumber: string;
  panNumber: string;
  drivingLicenseNumber: string;
  address: {
    buildingName: string;
    streetName: string;
    landmark: string;
    area: string;
    state: string;
    district: string;
    city: string;
    pincode: string;
  };
  payoutMethod: "UPI" | "BANK_ACCOUNT";
  upiId: string;
  bankDetails: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  termsAccepted: boolean;
};

type RegistrationState = {
  currentStep: number;
  formData: RegistrationFormData;
  documents: Partial<Record<DocumentType, DocumentInfo | null>>;
  hasHydrated: boolean;

  // Actions
  setStep: (step: number) => void;
  updateFormField: <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => void;
  updateAddressField: (field: keyof RegistrationFormData["address"], value: string) => void;
  updateBankField: (field: keyof RegistrationFormData["bankDetails"], value: string) => void;
  setDocument: (type: DocumentType, info: DocumentInfo | null) => void;
  clearDocument: (type: DocumentType) => void;
  clearAllData: () => void;
  markHydrated: () => void;
}

const defaultFormData: RegistrationFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  otp: "",
  vehicleType: "Bike",
  fuelType: "Petrol",
  bikeNumber: "",
  aadhaarNumber: "",
  panNumber: "",
  drivingLicenseNumber: "",
  address: {
    buildingName: "",
    streetName: "",
    landmark: "",
    area: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
  },
  payoutMethod: "UPI",
  upiId: "",
  bankDetails: {
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  },
  termsAccepted: false,
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: defaultFormData,
      documents: {},
      hasHydrated: false,

      markHydrated: () => set({ hasHydrated: true }),

      setStep: (step) => set({ currentStep: step }),

      updateFormField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),

      updateAddressField: (field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            address: { ...state.formData.address, [field]: value },
          },
        })),

      updateBankField: (field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            bankDetails: { ...state.formData.bankDetails, [field]: value },
          },
        })),

      setDocument: (type, info) =>
        set((state) => ({
          documents: { ...state.documents, [type]: info },
        })),

      clearDocument: (type) =>
        set((state) => ({
          documents: { ...state.documents, [type]: null },
        })),

      clearAllData: () =>
        set({
          currentStep: 1,
          formData: defaultFormData,
          documents: {},
        }),
    }),
    {
      name: "delivery-registration-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        documents: state.documents,
      }),
    }
  )
);