import { apiDelete, apiGet, apiPatch, apiPost } from "../../../lib/api";
import type { AdminPromosResponse, PromoFormValues } from "./types";

export async function getAdminPromoCodes() {
  return apiGet<AdminPromosResponse>("/admin/promo");
}

export async function createAdminPromoCodes(body: PromoFormValues) {
  return apiPost<AdminPromosResponse, PromoFormValues>("/admin/promo", body);
}

export async function updateAdminPromoCodes(
  promoId: string,
  body: PromoFormValues,
) {
  return apiPatch<AdminPromosResponse, PromoFormValues>(
    `/admin/promo/${promoId}`,
    body,
  );
}

export async function deleteAdminPromoCodes(promoId: string) {
  return apiDelete<AdminPromosResponse>(`/admin/promo/${promoId}`);
}
