import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Restaurant } from "./useMenuStore";

interface FavoritesState {
  favorites: Restaurant[];
  addFavorite: (restaurant: Restaurant) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (restaurant) =>
        set((state) => {
          if (state.favorites.some((r) => r._id === restaurant._id)) return state;
          return { favorites: [...state.favorites, restaurant] };
        }),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((r) => r._id !== id),
        })),
      isFavorite: (id) => get().favorites.some((r) => r._id === id),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
