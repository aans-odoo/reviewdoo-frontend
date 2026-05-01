import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen relative flex-col bg-theme-body p-2 gap-2">
      {/* Full-width navbar */}
      <Header />

      {/* Sidebar + Content below */}
      <div className="flex flex-1 gap-2 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto rounded-md border border-border bg-theme-bg-card min-w-0">
          <div className="p-6 md:px-8 md:py-16 max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
