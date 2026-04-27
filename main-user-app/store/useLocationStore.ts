import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Address {
  id: string;
  type?: string;     // e.g. "Selected Location"
  label?: string;    // e.g. "Home", "Work"
  flat: string;      // Room/Flat/Building
  area: string;      // Area/Locality
  line1?: string;    // fallback for line1
  city?: string;     // city name
  address?: string;  // full string if available
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault?: boolean;
}

interface LocationState {
  currentAddress: Address | null;
  savedAddresses: Address[];
  setCurrentAddress: (address: Address) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentAddress: null,
      savedAddresses: [],
      setCurrentAddress: (address) => set({ currentAddress: address }),
      addAddress: (address) => set((state) => ({
        savedAddresses: [...state.savedAddresses, { ...address, id: Math.random().toString(36).substr(2, 9) }]
      })),
      removeAddress: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.filter((a) => a.id !== id)
      })),
      setDefaultAddress: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.map((a) => ({
          ...a,
          isDefault: a.id === id
        })),
        currentAddress: state.savedAddresses.find((a) => a.id === id) || state.currentAddress
      })),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
