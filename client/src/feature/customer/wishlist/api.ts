import { apiDelete, apiGet, apiPost } from "../../../lib/api";
import type {
  AddCustomerWishlistItemBody,
  CustomerWishlistResponse,
} from "./types";

export async function getCustomerWishlist() {
  return apiGet<CustomerWishlistResponse>("/customer/wishlist");
}

export async function addCustomerWishlist(body: AddCustomerWishlistItemBody) {
  return apiPost<CustomerWishlistResponse>("/customer/wishlist/items", body);
}

export async function removeCustomerWishlist(productId: string) {
  return apiDelete<CustomerWishlistResponse>(
    `/customer/wishlist/delete/${productId}`,
  );
}
