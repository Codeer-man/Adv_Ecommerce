import axios, { type AxiosRequestConfig } from "axios";
import { env } from "./env";
import type { ApiEnvelope } from "./type";

let tokenGetter: (() => Promise<string | null>) | null = null;

export function setApiTokenGetter(getToken: () => Promise<string | null>) {
  tokenGetter = getToken;
}

const api = axios.create({
  baseURL: env.backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
  if (!tokenGetter) return config;

  const token = await tokenGetter();

  if (token) {
    config.headers = config.headers || null;
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function getError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error[0]?.message ||
      error.message ||
      "request failted"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export async function getApi<T>(url: string, config?: AxiosRequestConfig) {
  try {
    const respones = await api.get<ApiEnvelope<T>>(url, config);

    if (respones.data.status === "error" || !respones.data.data) {
      throw new Error(respones.data.errors?.[0].message || "Request failed");
    }

    return respones.data.data;
  } catch (error) {
    throw new Error(getError(error));
  }
}
