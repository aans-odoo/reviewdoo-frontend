import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DetailViewLayout } from "@/components/layout/DetailViewLayout";
import { Loading } from "@/components/shared/Loading";
import { TooltipProvider } from "@/components/ui/tooltip";

// Route-level code splitting: each page is loaded on demand so the initial
// bundle stays small and heavy public pages (About, How to Use) don't ship
// with the login screen. Named exports are adapted to lazy's default-export
// contract via the `.then` mappers below.
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const AccountSetupPage = lazy(() => import("@/pages/AccountSetupPage").then((m) => ({ default: m.AccountSetupPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const ReviewChecklistsPage = lazy(() => import("@/pages/ReviewChecklistsPage").then((m) => ({ default: m.ReviewChecklistsPage })));
const ReviewChecklistDetailPage = lazy(() => import("@/pages/ReviewChecklistDetailPage").then((m) => ({ default: m.ReviewChecklistDetailPage })));
const GuidelinesPage = lazy(() => import("@/pages/GuidelinesPage").then((m) => ({ default: m.GuidelinesPage })));
const GuidelineDetailPage = lazy(() => import("@/pages/GuidelineDetailPage").then((m) => ({ default: m.GuidelineDetailPage })));
const AIModelConfigPage = lazy(() => import("@/pages/AIModelConfigPage").then((m) => ({ default: m.AIModelConfigPage })));
const McpConfigPage = lazy(() => import("@/pages/McpConfigPage").then((m) => ({ default: m.McpConfigPage })));
const UserManagementPage = lazy(() => import("@/pages/UserManagementPage").then((m) => ({ default: m.UserManagementPage })));
const McpClientsPage = lazy(() => import("@/pages/McpClientsPage").then((m) => ({ default: m.McpClientsPage })));
const SmtpConfigPage = lazy(() => import("@/pages/SmtpConfigPage").then((m) => ({ default: m.SmtpConfigPage })));
const DesignShowcasePage = lazy(() => import("@/pages/DesignShowcasePage").then((m) => ({ default: m.DesignShowcasePage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const HowToUsePage = lazy(() => import("@/pages/HowToUsePage").then((m) => ({ default: m.HowToUsePage })));

export default function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <Suspense fallback={<Loading className="min-h-screen" />}>
        <Routes>
        <Route path="/design/v2" element={<DesignShowcasePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<AccountSetupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-to-use" element={<HowToUsePage />} />

        {/* Publicly shareable detail views. The layout adapts: authenticated
            users see the full dashboard chrome, anonymous visitors get a
            minimal read-only shell. Controls (back/edit/delete) are hidden for
            anonymous users inside each page. */}
        <Route element={<DetailViewLayout />}>
          <Route path="/review-checklists/:id" element={<ReviewChecklistDetailPage />} />
          <Route path="/guidelines/:id" element={<GuidelineDetailPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/guidelines" replace />} />
            <Route path="/review-checklists" element={<ReviewChecklistsPage />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route path="/ai-config" element={<AIModelConfigPage />} />
            <Route path="/mcp-config" element={<McpConfigPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/mcp-clients" element={<McpClientsPage />} />
              <Route path="/smtp-config" element={<SmtpConfigPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Suspense>
    </TooltipProvider>
  );
}
