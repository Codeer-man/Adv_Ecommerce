import { apiGet, apiPost } from "../../lib/api";
import type { syncResponse, meResponse } from "./types";

export function syncUser() {
  return apiPost<syncResponse>("/auth/sync");
}

export function meUser() {
  return apiGet<meResponse>("/auth/me");
}
