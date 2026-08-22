import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/api";

export interface Address {
  id: string;
  _id?: string;
  type?: string;     // e.g. "Selected Location"
  label?: string;    // e.g. "Home", "Work"
  flat: string;      // Room/Flat/Building
  area: string;      // Area/Locality
  line1?: string;    // fallback for line1
  city?: string;     // city name
  address?: string;  // full string if available
  pincode?: string;
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
  addAddress: (address: Address) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => void;
  fetchAddresses: () => Promise<void>;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentAddress: null,
      savedAddresses: [],
      setCurrentAddress: (address) => set({ currentAddress: address }),
      addAddress: async (address) => {
        try {
          const apiData = {
            label: address.label || "Other",
            line1: `${address.flat ? address.flat + ", " : ""}${address.area}`,
            city: address.city || "Unknown",
            location: {
              type: "Point",
              coordinates: [address.coordinates.longitude, address.coordinates.latitude]
            }
          };
          const res = await api.post("/users/me/addresses", apiData);
          const backendAddr = res.data.data;
          const id = backendAddr._id || backendAddr.id || Math.random().toString(36).substr(2, 9);
          set((state) => ({
            savedAddresses: [...state.savedAddresses, { ...address, id, _id: id }]
          }));
        } catch (error) {
          console.error("Failed to add address to backend", error);
          const id = address.id || Math.random().toString(36).substr(2, 9);
          set((state) => ({
            savedAddresses: [...state.savedAddresses, { ...address, id }]
          }));
        }
      },
      removeAddress: async (id) => {
        try {
          await api.delete(`/users/me/addresses/${id}`);
          set((state) => ({
            savedAddresses: state.savedAddresses.filter((a) => a.id !== id && a._id !== id)
          }));
        } catch (error) {
          console.error("Failed to remove address from backend", error);
          set((state) => ({
            savedAddresses: state.savedAddresses.filter((a) => a.id !== id && a._id !== id)
          }));
        }
      },
      setDefaultAddress: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.map((a) => ({
          ...a,
          isDefault: (a.id === id || a._id === id)
        })),
        currentAddress: state.savedAddresses.find((a) => a.id === id || a._id === id) || state.currentAddress
      })),
      fetchAddresses: async () => {
        try {
          const res = await api.get("/users/me/addresses");
          const backendAddresses = res.data.data;
          if (backendAddresses && Array.isArray(backendAddresses)) {
             const mappedAddresses = backendAddresses.map((ba: any) => ({
                id: ba._id,
                _id: ba._id,
                label: ba.label,
                type: ba.label,
                flat: ba.line1?.split(",")[0] || "",
                area: ba.line1 || "",
                city: ba.city,
                coordinates: {
                   longitude: ba.location?.coordinates?.[0] || 0,
                   latitude: ba.location?.coordinates?.[1] || 0,
                },
             }));
             set({ savedAddresses: mappedAddresses });
          }
        } catch (error) {
          console.error("Failed to fetch addresses from backend", error);
        }
      },
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
