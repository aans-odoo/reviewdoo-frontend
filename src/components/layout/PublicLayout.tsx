import { useLogoHandoff } from "@/hooks/useLogoHandoff";
import { Outlet } from "react-router-dom";
import { PublicSidebar } from "./PublicSidebar";
import { Header } from "./Header";

/**
 * Layout for pages accessible to both authenticated and anonymous users.
 * Shows the full sidebar navigation (with admin items hidden for non-admin
 * users and login-required items redirecting to login for anonymous visitors).
 */
export function PublicLayout() {
  const { headerRef, showSidebarLogo } = useLogoHandoff();
  return (
    <div className="flex min-h-screen relative flex-col bg-theme-body p-2 gap-2">
      <Header headerRef={headerRef} showLogo={!showSidebarLogo} />
      <div className="flex flex-1 gap-2 min-h-0">
        <PublicSidebar showLogo={showSidebarLogo} />
        <main className="flex-1 overflow-y-auto rounded-md border border-border bg-theme-bg-card min-w-0">
          <div className="p-6 md:px-8 md:py-16 max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
