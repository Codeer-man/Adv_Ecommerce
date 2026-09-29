import { apiDelete, apiGet, apiPatch, apiPost } from "../../../lib/api";
import type {
  CustomerAddressFormValues,
  CustomerAddressResponse,
} from "./types";

export async function getCustomerAddress() {
  return apiGet<CustomerAddressResponse>("/customer/addresses");
}

export async function createCustomerAddress(body: CustomerAddressFormValues) {
  return apiPost<CustomerAddressResponse, CustomerAddressFormValues>(
    "/customer/addresses",
    body,
  );
}
export async function updateCustomerAddress(
  addressId: string,
  body: CustomerAddressFormValues,
) {
  return apiPatch<CustomerAddressResponse, CustomerAddressFormValues>(
    `/customer/addresses/${addressId}`,
    body,
  );
}

export async function deleteCustomerAddress(addressId: string) {
  return apiDelete<CustomerAddressResponse>(`/customer/addresses/${addressId}`);
}
