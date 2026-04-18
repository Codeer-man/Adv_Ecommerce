import type { AppUser } from "../../lib/type";
import { create } from "zustand";

type AuthStatus = "idle" | "loading" | "ready" | "error";

type AuthStore = {
  status: AuthStatus;
  isBootstrapped: boolean;
  user: AppUser | null;
  error: string | null;

  setLoading: () => void;
  setUser: (user: AppUser | null) => void;
  setError: (message: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: "idle",
  isBootstrapped: false,
  user: null,
  error: null,

  setLoading: () =>
    set({
      status: "loading",
      error: null,
    }),

  setUser: (user) =>
    set({
      status: "ready",
      user,
      error: null,
      isBootstrapped: true,
    }),

  setError: (message) =>
    set({
      status: "error",
      isBootstrapped: true,
      error: message,
    }),

  clearAuth: () =>
    set({
      status: "ready",
      user: null,
      error: null,
      isBootstrapped: true,
    }),
}));
