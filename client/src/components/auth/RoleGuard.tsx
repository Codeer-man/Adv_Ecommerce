import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../feature/auth/store";
import type { UserRole } from "../../lib/type";

type RoleGuard = {
  allow: UserRole[];
};

export default function RoleGuard({ allow }: RoleGuard) {
  const { isBootstrapped, user, status } = useAuthStore();

  if (!isBootstrapped || status === "loading") return null;

  if (!user) {
    return <Navigate to={"sign-in"} replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={"/"} replace />;
  }

  return <Outlet />;
}
