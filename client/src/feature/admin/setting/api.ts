import { apiGet, apiPost } from "../../../lib/api";
import type { AdminBannersResponse } from "./type";

export async function getAdminBanner() {
  return await apiGet<AdminBannersResponse>("/admin/settings/banners");
}

export async function uploadAdminBanner(formData: FormData) {
  return apiPost<AdminBannersResponse, FormData>(
    "/admin/settings/banners",
    formData,
  );
}
