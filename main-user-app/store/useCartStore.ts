import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, "quantity">, restaurant: { id: string; name: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      totalAmount: 0,
      totalItems: 0,

      addItem: (item, restaurant) => {
        const { restaurantId, items } = get();

        // Check for restaurant conflict
        if (restaurantId && restaurantId !== restaurant.id) {
          Alert.alert(
            "Replace cart items?",
            "Your cart contains items from another restaurant. Do you want to clear the cart and add this item?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Replace",
                onPress: () => {
                  set({
                    items: [{ ...item, quantity: 1 }],
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                  });
                  get().recalculate();
                },
              },
            ]
          );
          return;
        }

        const existingItem = items.find((i) => i.id === item.id);
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
          });
        }
        get().recalculate();
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          const newRestaurantId = newItems.length === 0 ? null : state.restaurantId;
          const newRestaurantName = newItems.length === 0 ? null : state.restaurantName;
          return { items: newItems, restaurantId: newRestaurantId, restaurantName: newRestaurantName };
        });
        get().recalculate();
      },

      updateQuantity: (id, delta) => {
        const { items } = get();
        const newItems = items.map((i) => {
          if (i.id === id) {
            const newQty = Math.max(0, i.quantity + delta);
            return { ...i, quantity: newQty };
          }
          return i;
        }).filter(i => i.quantity > 0);

        const newRestaurantId = newItems.length === 0 ? null : get().restaurantId;
        const newRestaurantName = newItems.length === 0 ? null : get().restaurantName;

        set({ items: newItems, restaurantId: newRestaurantId, restaurantName: newRestaurantName });
        get().recalculate();
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null, totalAmount: 0, totalItems: 0 }),

      recalculate: () => {
        const { items } = get();
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ totalAmount, totalItems });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
