import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-a py-8">
        <Outlet />
      </main>
    </div>
  );
}
