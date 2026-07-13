import { useAuth } from "@clerk/react";
import { useAuthStore } from "../../feature/auth/store";
import { Navigate, Outlet } from "react-router-dom";
import CommonLoader from "../common/loader";

export function PublicOnlyLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isBootstrapped, status } = useAuthStore();

  if (!isLoaded) null;

  if (isSignedIn && (!isBootstrapped || status === "loading")) {
    return <CommonLoader />;
  }

  if (isSignedIn) {
    <Navigate to={"profile"} replace />;
  }

  return <Outlet />;
}
