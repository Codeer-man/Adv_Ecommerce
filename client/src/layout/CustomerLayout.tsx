import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/customer/common/desktop-navbar";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomerNavbar />
      <main className="mx-auto max-w-7xl px-a py-8">
        <Outlet />
      </main>
    </div>
  );
}
