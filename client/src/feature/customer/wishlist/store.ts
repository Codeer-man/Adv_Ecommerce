import { create } from "zustand";
import type { CustomerWishlistItem } from "./types";
import { getCustomerWishlist, removeCustomerWishlist } from "./api";
import { toast } from "sonner";

type CustomerWishlistStore = {
  items: CustomerWishlistItem[];
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setItems: (item: CustomerWishlistItem[]) => void;
  loadWishlist: () => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => void;
};

export const useCustomerWishlistStore = create<CustomerWishlistStore>(
  (set) => ({
    items: [],
    isOpen: false,
    setIsOpen: (value) => set({ isOpen: value }),
    setItems: (items) => set({ items }),
    clear: () => set({ items: [], isOpen: false }),
    loadWishlist: async () => {
      try {
        const response = await getCustomerWishlist();

        set({ items: response.items ?? [] });
      } catch {
        set({ items: [] });
      }
    },
    removeItem: async (productId) => {
      try {
        const response = await removeCustomerWishlist(productId);
        set({ items: response.items ?? [] });
        toast.success("Removed from the wishlist");
      } catch {
        toast.error("Failed to remove from the wishlist");
      }
    },
  }),
);
