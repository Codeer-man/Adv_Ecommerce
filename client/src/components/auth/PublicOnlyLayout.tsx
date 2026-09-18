import { useAuth } from "@clerk/react";
import { useAuthStore } from "../../feature/auth/store";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import CommonLoader from "../common/loader";

export function PublicOnlyLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isBootstrapped, status } = useAuthStore();
  const location = useLocation();

  if (!isLoaded) null;

  if (isSignedIn && (!isBootstrapped || status === "loading")) {
    return <CommonLoader />;
  }

  if (
    isSignedIn &&
    (location.pathname === "/sign-in" || location.pathname === "/sign-up")
  ) {
    <Navigate to={"profile"} replace />;
  }

  return <Outlet />;
}
