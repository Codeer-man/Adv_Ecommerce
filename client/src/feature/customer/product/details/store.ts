import { create } from "zustand";
import type { CustomerProductDetailsResponse, ProductSize } from "../types";
import { getProductDetail } from "../api";
import { getCoverImage } from "../product-list";

type CustomerProductDetailsStore = {
  loading: boolean;
  data: CustomerProductDetailsResponse | null;
  selectedImage: string;
  selectedColor: string;
  selectedSize: ProductSize | "";
  loadProduct: (productId: string) => Promise<void>;
  clear: () => void;
  setSelectedImage: (value: string) => void;
  setSelectedColor: (value: string) => void;
  setSelectedSize: (value: ProductSize | "") => void;
  addToCart?: (
    isLoaded: boolean,
    isBootstrapped: boolean,
    isSignedIn: boolean,
  ) => Promise<void>;
  toggleWishlist?: (
    isLoaded: boolean,
    isBootstrapped: boolean,
    isSignedIn: boolean,
    isWishlistActive: boolean,
  ) => Promise<void>;
};

const defaultState = {
  loading: true,
  data: null,
  selectedImage: "",
  selectedColor: "",
  selectedSize: "" as ProductSize | "",
};

export const useCustomerProductDetailStore =
  create<CustomerProductDetailsStore>((set, get) => ({
    ...defaultState,
    loadProduct: async (productId) => {
      if (!productId) {
        set({
          loading: false,
          data: null,
          selectedImage: "",
          selectedColor: "",
          selectedSize: "",
        });
      }
      set({
        loading: true,
        data: null,
        selectedImage: "",
        selectedColor: "",
        selectedSize: "",
      });

      try {
        const response = await getProductDetail(productId);
        const product = response.product ?? null;

        set({
          loading: false,
          data: response,
          selectedImage: product ? getCoverImage(product) : "",
          selectedColor: product?.colors?.[0] || "",
          selectedSize: product?.sizes?.[0] || "",
        });
      } catch (error) {
        set({
          loading: false,
          data: null,
          selectedImage: "",
          selectedColor: "",
          selectedSize: "",
        });
      }
    },
    clear: () => set(defaultState),

    setSelectedColor: (value) => set({ selectedColor: value }),
    setSelectedImage: (value) => set({ selectedImage: value }),
    setSelectedSize: (value) => set({ selectedSize: value }),
  }));
