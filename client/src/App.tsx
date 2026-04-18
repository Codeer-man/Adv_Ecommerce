import { RouterProvider } from "react-router-dom";
import { router } from "./layout";
import { useBootStrapAuth } from "./feature/auth/useBootstrapAuth";

export default function App() {
  useBootStrapAuth();
  return <RouterProvider router={router} />;
}
