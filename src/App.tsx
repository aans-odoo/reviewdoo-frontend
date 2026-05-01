import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { AccountSetupPage } from "@/pages/AccountSetupPage";
import { ChecklistItemsPage } from "@/pages/ChecklistItemsPage";
import { ChecklistItemDetailPage } from "@/pages/ChecklistItemDetailPage";
import { GuidelinesPage } from "@/pages/GuidelinesPage";
import { AuthorsPage } from "@/pages/AuthorsPage";
import { IngestionLogsPage } from "@/pages/IngestionLogsPage";
import { AIModelConfigPage } from "@/pages/AIModelConfigPage";
import { PromptGeneratorPage } from "@/pages/PromptGeneratorPage";
import { UserManagementPage } from "@/pages/UserManagementPage";
import { SmtpConfigPage } from "@/pages/SmtpConfigPage";
import { DesignShowcasePage } from "@/pages/DesignShowcasePage";

export default function App() {
  return (
    <Routes>
      <Route path="/design/v2" element={<DesignShowcasePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<AccountSetupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/checklist-items" replace />} />
          <Route path="/checklist-items" element={<ChecklistItemsPage />} />
          <Route path="/checklist-items/:id" element={<ChecklistItemDetailPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/authors" element={<AuthorsPage />} />
          <Route path="/ingestion-logs" element={<IngestionLogsPage />} />
          <Route path="/ai-config" element={<AIModelConfigPage />} />
          <Route path="/prompt-generator" element={<PromptGeneratorPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/smtp-config" element={<SmtpConfigPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
