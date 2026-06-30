import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { PIPELINE_ENABLED } from "@/lib/features";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { AccountSetupPage } from "@/pages/AccountSetupPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ReviewChecklistsPage } from "@/pages/ReviewChecklistsPage";
import { ReviewChecklistDetailPage } from "@/pages/ReviewChecklistDetailPage";
import { GuidelinesPage } from "@/pages/GuidelinesPage";
import { AuthorsPage } from "@/pages/AuthorsPage";
import { IngestionLogsPage } from "@/pages/IngestionLogsPage";
import { IngestionLogDetailPage } from "@/pages/IngestionLogDetailPage";
import { AIModelConfigPage } from "@/pages/AIModelConfigPage";
import { PromptGeneratorPage } from "@/pages/PromptGeneratorPage";
import { McpConfigPage } from "@/pages/McpConfigPage";
import { UserManagementPage } from "@/pages/UserManagementPage";
import { SmtpConfigPage } from "@/pages/SmtpConfigPage";
import { DesignShowcasePage } from "@/pages/DesignShowcasePage";
import { AboutPage } from "@/pages/AboutPage";
import { ReviewChecklistPipelinePage } from "@/pages/ReviewChecklistPipelinePage";
import { IngestionGitHubConfigPage } from "@/pages/IngestionGitHubConfigPage";
import { IngestionAIConfigPage } from "@/pages/IngestionAIConfigPage";
import { RejectedCommentsPage } from "@/pages/RejectedCommentsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/design/v2" element={<DesignShowcasePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<AccountSetupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      {PIPELINE_ENABLED && (
        <Route path="/review-checklist-pipeline" element={<ReviewChecklistPipelinePage />} />
      )}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/guidelines" replace />} />
          <Route path="/review-checklists" element={<ReviewChecklistsPage />} />
          <Route path="/review-checklists/:id" element={<ReviewChecklistDetailPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          {PIPELINE_ENABLED && (
            <>
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/ingestion-logs" element={<IngestionLogsPage />} />
              <Route path="/ingestion-logs/:id" element={<IngestionLogDetailPage />} />
            </>
          )}
          <Route path="/ai-config" element={<AIModelConfigPage />} />
          <Route path="/prompt-generator" element={<PromptGeneratorPage />} />
          <Route path="/mcp-config" element={<McpConfigPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/smtp-config" element={<SmtpConfigPage />} />
            {PIPELINE_ENABLED && (
              <>
                <Route path="/ingestion/github-config" element={<IngestionGitHubConfigPage />} />
                <Route path="/ingestion/ai-config" element={<IngestionAIConfigPage />} />
                <Route path="/rejected-comments" element={<RejectedCommentsPage />} />
              </>
            )}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
