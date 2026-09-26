import { apiGet } from "../../../lib/api";
import type { ProductCategory } from "../../admin/products/types";
import type {
  CustomerProduct,
  CustomerProductDetailsResponse,
  GetCustomerProductsParams,
} from "./types";

export async function getCustomerCategory() {
  return apiGet<ProductCategory[]>("/customer/categories");
}

export async function getCustomerProduct(params?: GetCustomerProductsParams) {
  const searchParams = new URLSearchParams();

  if (params?.category) {
    searchParams.set("category", params.category);
  }
  if (params?.brand) {
    searchParams.set("brand", params.brand);
  }
  if (params?.color) {
    searchParams.set("color", params.color);
  }
  if (params?.size) {
    searchParams.set("size", params.size);
  }
  if (params?.sort) {
    searchParams.set("sort", params.sort);
  }

  const queryString = searchParams.toString();

  const url = queryString
    ? `/customer/products?${queryString}`
    : "/customer/products";

  return apiGet<CustomerProduct[]>(url);
}

export async function getProductDetail(productId: string) {
  return apiGet<CustomerProductDetailsResponse>(
    `/customer/product/${productId}`,
  );
}
