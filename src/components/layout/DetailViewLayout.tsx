import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "./DashboardLayout";
import { Header } from "./Header";
import { Loading } from "@/components/shared/Loading";

/**
 * Layout for publicly shareable detail views (a single guideline / checklist).
 *
 * Authenticated users get the full dashboard chrome (header + sidebar) so the
 * page feels like the rest of the app. Anonymous visitors get a minimal public
 * shell — just the branded header and the content — so a shared link works for
 * anyone without exposing navigation into the authenticated app.
 */
export function DetailViewLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  if (isAuthenticated) {
    // DashboardLayout renders its own <Outlet />.
    return <DashboardLayout />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-2 bg-theme-body p-2">
      <Header />
      <main className="flex-1 overflow-y-auto rounded-md border border-border bg-theme-bg-card">
        <div className="mx-auto w-full max-w-[1200px] p-6 md:px-8 md:py-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
