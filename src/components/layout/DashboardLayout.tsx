import { useLogoHandoff } from "@/hooks/useLogoHandoff";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout() {
  const { headerRef, showSidebarLogo } = useLogoHandoff();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setNavigationOpen(false), [pathname]);
  return (
    <div className="flex min-h-screen relative flex-col bg-theme-body p-2 gap-2">
      {/* Full-width navbar */}
      <Header headerRef={headerRef} showLogo={!showSidebarLogo} />

      {/* Sidebar + Content below */}
      <Button variant="outline" className="self-start md:hidden" aria-expanded={navigationOpen} aria-controls="dashboard-navigation" onClick={() => setNavigationOpen((open) => !open)}>
        <Menu className="h-4 w-4" aria-hidden="true" /> Navigation
      </Button>
      <div className="flex flex-col md:flex-row flex-1 gap-2 min-h-0">
        <div id="dashboard-navigation" className={`${navigationOpen ? "block" : "hidden"} md:contents [&>aside]:max-md:static [&>aside]:max-md:h-auto [&>aside]:max-md:w-full`}>
          <Sidebar showLogo={showSidebarLogo} />
        </div>
        <main className="flex-1 overflow-y-auto rounded-md border border-border bg-theme-bg-card min-w-0">
          <div className="p-4 sm:p-6 md:px-8 md:py-16 max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
