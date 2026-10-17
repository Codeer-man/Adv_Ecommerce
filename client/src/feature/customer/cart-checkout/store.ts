import { create } from "zustand";
import type {
  AddCustomerCartItemBody,
  AppliedPromo,
  CheckoutAddressOption,
  CustomerCartItemIdentifier,
  CustomerCartResponse,
  GuestCartItem,
  SyncCustomerCartBody,
} from "./types";

import { toast } from "sonner";
import {
  addCustomerCartItem,
  applyCustomerPromo,
  decreaseCustomerCartItem,
  getCheckoutData,
  increaseCustomerCartItem,
  removeCartItem,
  syncCustomerCartItem,
} from "./api";

type AddCartItemInput = AddCustomerCartItemBody & {
  title: string;
  brand: string;
  image: string;
  finalPrice: number;
};

type RazorpayArgs = {
  isSignedIn: boolean;
  name: string;
  email: string;
  onSuccess: () => void;
};

type PointsArgs = {
  isSignedIn: boolean;
  onSuccess: () => void;
};

type CustomerCartAndCheckoutStore = {
  cart: CustomerCartResponse;
  isOpen: boolean;
  loading: boolean;
  addresses: CheckoutAddressOption[];
  selectedAddressId: string;
  promoInput: string;
  appliedPromo: AppliedPromo | null;
  points: number;
  promoLoading: boolean;
  checkoutLoading: boolean;
  pointsCheckoutLoading: boolean;
  setOpen: (value: boolean) => void;
  setCart: (cart: CustomerCartResponse) => void;
  loadCart: (isSignedIn: boolean) => Promise<void>;
  addItem: (item: AddCartItemInput, isSignedIn: boolean) => Promise<void>;
  increase: (
    item: CustomerCartItemIdentifier,
    isSignedIn: boolean,
  ) => Promise<void>;
  decrease: (
    item: CustomerCartItemIdentifier,
    isSignedIn: boolean,
  ) => Promise<void>;
  remove: (
    item: CustomerCartItemIdentifier,
    isSignedIn: boolean,
  ) => Promise<void>;
  setPromoInput: (value: string) => void;
  clearPromo: () => void;
  applyPromo: () => Promise<void>;
  startRazorpayCheckout?: (args: RazorpayArgs) => Promise<void>;
  startPointsCheckout?: (args: PointsArgs) => Promise<void>;
  clear: () => void;
};

const emptyCart: CustomerCartResponse = {
  items: [],
  totalQuantity: 0,
};

const defaultUiState = {
  loading: false,
  addresses: [] as CheckoutAddressOption[],
  selectedAddressId: "",
  promoInput: "",
  appliedPromo: null as AppliedPromo | null,
  points: 0,
  promoLoading: false,
  checkoutLoading: false,
  pointsCheckoutLoading: false,
};

const GUEST_CART_KEY = "guest_cart_item";

function readGuestItem(): GuestCartItem[] {
  if (typeof window === undefined) return [];
  try {
    const item = JSON.parse(
      window.localStorage.getItem(GUEST_CART_KEY) || "[]",
    );
    return Array.isArray(item)
      ? item.filter(
          (currentItem) =>
            currentItem.productId && Number(currentItem.quantity) > 0,
        )
      : [];
  } catch (error) {
    return [];
  }
}

function writeGuestItems(items: GuestCartItem[]) {
  if (typeof window === undefined) return;

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function clearGuesItem() {
  if (typeof window === undefined) return;
  localStorage.removeItem(GUEST_CART_KEY);
}

function getGuestResponse(): CustomerCartResponse {
  const items = readGuestItem();

  return {
    items: items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function getGuestPayload(): SyncCustomerCartBody {
  return {
    items: readGuestItem().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    })),
  };
}

function isSameItem(
  item: CustomerCartItemIdentifier,
  target: CustomerCartItemIdentifier,
) {
  return (
    item.productId === target.productId &&
    (item.color || "") === (target.color || "") &&
    (item.size || "") === (target.size || "")
  );
}

function addGuestItem(item: Omit<GuestCartItem, "quantity">) {
  const items = readGuestItem();
  const index = items.findIndex((cartItem) => isSameItem(cartItem, item));

  if (index >= 0) {
    items[index] = {
      ...items[index],
      quantity: items[index].quantity + 1,
    };
  } else {
    items.push({
      ...item,
      quantity: 1,
    });
  }

  writeGuestItems(items);

  return getGuestResponse();
}

function increaseGuestItem(item: CustomerCartItemIdentifier) {
  const items = readGuestItem().map((cartItem) =>
    isSameItem(cartItem, item)
      ? { ...cartItem, quantity: cartItem.quantity + 1 }
      : cartItem,
  );

  writeGuestItems(items);

  return getGuestResponse();
}

function decreaseGuestItem(item: CustomerCartItemIdentifier) {
  const items = readGuestItem()
    .map((cartItem) =>
      isSameItem(cartItem, item)
        ? { ...cartItem, quantity: cartItem.quantity - 1 }
        : cartItem,
    )
    .filter((cartItem) => cartItem.quantity > 0);

  writeGuestItems(items);

  return getGuestResponse();
}

function removeGuestItem(item: CustomerCartItemIdentifier) {
  const items = readGuestItem().filter(
    (cartItem) => !isSameItem(cartItem, item),
  );

  writeGuestItems(items);
  return getGuestResponse();
}

export const userCustomerCartAndCheckoutStore =
  create<CustomerCartAndCheckoutStore>((set, get) => ({
    cart: emptyCart,
    isOpen: false,
    ...defaultUiState,
    setOpen: (value) => set({ isOpen: value }),
    setCart: (value) => set({ cart: value }),
    loadCart: async (isSignedIn) => {
      try {
        set({ loading: true });
        if (isSignedIn) {
          const guestPayload = getGuestPayload();

          if (guestPayload.items.length) {
            const syncedCart = await syncCustomerCartItem(guestPayload);

            clearGuesItem();
            set({ cart: syncedCart ?? emptyCart });
          }

          const response = await getCheckoutData();
          const cart = response?.cart ?? emptyCart;
          const addresses = response?.addresses?.items ?? [];
          const defaultAddress =
            addresses.find((item) => item.isDefault) || addresses[0] || null;

          set({
            loading: false,
            cart,
            addresses,
            selectedAddressId: defaultAddress?._id ?? "",
            points: response?.points ?? 0,
          });

          return;
        }

        set({
          loading: false,
          cart: getGuestResponse(),
          addresses: [],
          selectedAddressId: "",
          points: 0,
        });
      } catch {
        set({
          loading: false,
          cart: isSignedIn ? emptyCart : getGuestResponse(),
        });
      }
    },
    addItem: async (item, isSignedIn) => {
      try {
        if (isSignedIn) {
          const response = await addCustomerCartItem({
            productId: item.productId,
            color: item.color,
            quantity: item.quantity,
            size: item.size,
          });

          set({ cart: response ?? emptyCart });
        } else {
          set({
            cart: addGuestItem({
              productId: item.productId,
              title: item.title,
              brand: item.brand,
              color: item.color,
              image: item.image,
              finalPrice: item.finalPrice,
              size: item.size,
            }),
          });
        }
        toast.success("Added to cart");
      } catch (error) {
        toast.error("Failed to add in cart");
      }
    },
    increase: async (item, isSignedIn) => {
      try {
        const response = isSignedIn
          ? await increaseCustomerCartItem(item)
          : increaseGuestItem(item);

        set({ cart: response ?? emptyCart });
        toast.success("cart updated");
      } catch (error) {
        toast.error("failed to update cart");
      }
    },
    decrease: async (item, isSignedIn) => {
      try {
        const response = isSignedIn
          ? await decreaseCustomerCartItem(item)
          : decreaseGuestItem(item);

        set({ cart: response ?? emptyCart });
        toast.success("cart updated");
      } catch (error) {
        toast.error("failed to update cart");
      }
    },
    remove: async (item, isSignedIn) => {
      try {
        const response = isSignedIn
          ? await removeCartItem(item)
          : removeGuestItem(item);

        set({ cart: response ?? emptyCart });
        toast.success("cart removed");
      } catch (error) {
        toast.error("failed to remove cart");
      }
    },
    setPromoInput: (value) => set({ promoInput: value }),
    clearPromo: () => set({ promoInput: "", appliedPromo: null }),
    applyPromo: async () => {
      const { promoInput, cart } = get();

      const subTotal = cart.items.reduce(
        (sum, item) => sum + item.finalPrice * item.quantity,
        0,
      );

      if (!promoInput.trim()) {
        set({ appliedPromo: null });
        return;
      }

      try {
        set({ promoLoading: true });
        const response = await applyCustomerPromo({
          orderValue: subTotal,
          code: promoInput,
        });

        if (!response.code) {
          set({ appliedPromo: null, promoLoading: false });
          return;
        }

        set({
          appliedPromo: response,
          promoInput: response.code,
          promoLoading: false,
        });
      } catch (error) {
        set({ appliedPromo: null, promoLoading: false });
      }
    },
    clear: () =>
      set({
        cart: emptyCart,
        isOpen: false,
        ...defaultUiState,
      }),
  }));
