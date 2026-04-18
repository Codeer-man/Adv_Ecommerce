import { useAuth } from "@clerk/react";
import { useAuthStore } from "../../feature/auth/store";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isBootstrapped, status } = useAuthStore();
  const location = useLocation();

  if (!isLoaded && (!isBootstrapped || status === "loading")) null;

  if (!isSignedIn) {
    return (
      <Navigate
        to={"sign-in"}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
