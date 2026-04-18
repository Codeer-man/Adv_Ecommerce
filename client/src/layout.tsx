import { createBrowserRouter } from "react-router-dom";
import { PublicOnlyLayout } from "./components/auth/PublicOnlyLayout";
import StoreHome from "./pages/custore/home";
import ProtectedLayout from "./components/auth/ProtectedLayout";
import CustomerProfile from "./pages/custore/Profile";
import CustomerLayout from "./layout/CustomerLayout";
import { SignInPage } from "./pages/auth/Sign-in";
import { SignUpPage } from "./pages/auth/Sign-up";

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
]);
