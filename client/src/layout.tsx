import { createBrowserRouter } from "react-router-dom";
import { PublicOnlyLayout } from "./components/auth/PublicOnlyLayout";
import StoreHome from "./pages/customer/home";
import ProtectedLayout from "./components/auth/ProtectedLayout";
import CustomerProfile from "./pages/customer/Profile";
import CustomerLayout from "./layout/CustomerLayout";
import { SignInPage } from "./pages/auth/Sign-in";
import { SignUpPage } from "./pages/auth/Sign-up";
import RoleGuard from "./components/auth/RoleGuard";
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Product";
import AdminOrders from "./pages/admin/Order";
import AdminSetting from "./pages/admin/Settingg";
import AdminCoupon from "./pages/admin/Coupon";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <StoreHome />,
      },
      {
        element: <PublicOnlyLayout />,
        children: [
          {
            path: "sign-in",
            element: <SignInPage />,
          },
          {
            path: "sign-up",
            element: <SignUpPage />,
          },
        ],
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "profile",
            element: <CustomerProfile />,
          },
        ],
      },
    ],
  },

  //admin
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <RoleGuard allow={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboard />,
              },
              {
                path: "products",
                element: <AdminProducts />,
              },
              {
                path: "coupons",
                element: <AdminCoupon />,
              },
              {
                path: "orders",
                element: <AdminOrders />,
              },
              {
                path: "settings",
                element: <AdminSetting />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
