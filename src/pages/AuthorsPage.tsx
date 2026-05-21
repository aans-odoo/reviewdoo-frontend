import { useState, useEffect, useCallback, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PipelineConfigBanner } from "@/components/pipeline/PipelineConfigBanner";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { Trash2, RefreshCw, Pause, Play } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Author {
  id: string;
  username: string;
  lastIngested: string | null;
  pollingPaused: boolean;
  commentCount?: number;
  _count?: { comments?: number; ingestionLogs?: number };
  ingestionLogCount?: number;
}

interface PollingStatus {
  authorId: string;
  username: string;
  lastIngested: string | null;
  pollingPaused: boolean;
  lastRunAt: string | null;
  lastRunStatus: string | null;
}

type AuthorRow = Author & {
  lastRunAt: string | null;
  lastRunStatus: string | null;
};

interface ToastState {
  variant?: "default" | "destructive";
  title: string;
  description?: React.ReactNode;
}

interface RefetchResponse {
  jobId: string;
}

interface AuthorListResponse {
  authors: Author[];
}

interface PollingStatusResponse {
  authors: PollingStatus[];
}

/**
 * Format an ISO timestamp as a short relative-time string ("3m ago", "2h ago",
 * "yesterday", "Mar 14"). Returns "—" when the timestamp is null.
 *
 * Kept inline (no date-fns dependency) because relative-time needs are minimal
 * and we don't want to add a runtime dependency for a single rendering helper.
 */
function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 0) {
    // Clock skew or future timestamp — show absolute date.
    return date.toLocaleDateString();
  }
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

/**
 * Coalesce per-author state into a single "polling status" chip:
 * - paused outranks everything (admin explicitly disabled polling)
 * - last run failed → failed (so admins notice broken authors)
 * - otherwise → active
 *
 * "Active" here is liberal: an author that has never polled yet still shows
 * Active because the scheduler will pick them up on the next tick.
 */
function pollingStatusLabel(row: AuthorRow): "Active" | "Paused" | "Failed" {
  if (row.pollingPaused) return "Paused";
  if (row.lastRunStatus === "failed") return "Failed";
  return "Active";
}

export function AuthorsPage() {
  const { isAdmin } = useAuth();
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AuthorRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Track per-row pending state so we can disable individual action buttons
  // without blocking the rest of the table.
  const [pendingAction, setPendingAction] = useState<Record<string, string | undefined>>({});

  // Toast state
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    setToastOpen(true);
  }, []);

  const setRowPending = (id: string, action: string | undefined) => {
    setPendingAction((prev) => ({ ...prev, [id]: action }));
  };

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      // Run author list and polling status in parallel — the polling status
      // endpoint is admin-only, but so is this whole page in practice; if the
      // call fails (e.g. for non-admins), we still surface the author list.
      const [authorsRes, statusRes] = await Promise.allSettled([
        api.get<AuthorListResponse>("/authors"),
        api.get<PollingStatusResponse>("/ingestion/polling/status"),
      ]);

      if (authorsRes.status === "rejected") {
        throw authorsRes.reason;
      }

      const authorList = authorsRes.value.data.authors ?? [];
      const statusByAuthorId = new Map<string, PollingStatus>();
      if (statusRes.status === "fulfilled") {
        for (const s of statusRes.value.data.authors ?? []) {
          statusByAuthorId.set(s.authorId, s);
        }
      }

      setAuthors(
        authorList.map((author) => {
          const polling = statusByAuthorId.get(author.id);
          return {
            ...author,
            lastRunAt: polling?.lastRunAt ?? null,
            lastRunStatus: polling?.lastRunStatus ?? null,
          };
        })
      );
      setError("");
    } catch {
      setError("Failed to load authors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      await api.post("/authors", { username: username.trim() });
      setUsername("");
      await fetchAuthors();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setCreateError(axErr.response?.data?.error?.message ?? "Failed to create author");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/authors/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchAuthors();
    } catch {
      setError("Failed to delete author");
    } finally {
      setDeleting(false);
    }
  };

  const handleRefetch = async (row: AuthorRow) => {
    setRowPending(row.id, "refetch");
    try {
      const res = await api.post<RefetchResponse>(`/authors/${row.id}/refetch`);
      const jobId = res.data.jobId;
      showToast({
        title: `Historical refetch started for ${row.username}`,
        description: jobId ? (
          <Link
            to={`/ingestion-logs/${jobId}`}
            className="text-theme-primary-light underline-offset-2 hover:underline"
          >
            View ingestion log {jobId} →
          </Link>
        ) : undefined,
      });
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      showToast({
        variant: "destructive",
        title: "Refetch failed",
        description: axErr.response?.data?.error?.message ?? "Could not start historical refetch",
      });
    } finally {
      setRowPending(row.id, undefined);
    }
  };

  const handleTogglePolling = async (row: AuthorRow) => {
    const action = row.pollingPaused ? "resume" : "pause";
    setRowPending(row.id, action);
    try {
      await api.post(`/authors/${row.id}/polling/${action}`);
      await fetchAuthors();
      showToast({
        title: row.pollingPaused
          ? `Polling resumed for ${row.username}`
          : `Polling paused for ${row.username}`,
      });
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      showToast({
        variant: "destructive",
        title: row.pollingPaused ? "Resume failed" : "Pause failed",
        description: axErr.response?.data?.error?.message ?? `Could not ${action} polling`,
      });
    } finally {
      setRowPending(row.id, undefined);
    }
  };

  const columns: Column<AuthorRow & Record<string, unknown>>[] = [
    { key: "username", header: "Username", sortable: true },
    {
      key: "savedChecklists",
      header: "Saved Checklists",
      render: (row) => (
        <span className="text-theme-text-dim">
          {row._count?.comments ?? row.commentCount ?? 0}
        </span>
      ),
    },
    {
      key: "lastIngested",
      header: "Last Ingested",
      render: (row) => (
        <span
          className="text-[13px] text-theme-text-dim"
          title={row.lastIngested ? new Date(row.lastIngested).toLocaleString() : undefined}
        >
          {relativeTime(row.lastIngested)}
        </span>
      ),
    },
    {
      key: "pollingStatus",
      header: "Polling",
      render: (row) => <StatusBadge status={pollingStatusLabel(row)} />,
    },
    {
      key: "lastRun",
      header: "Last Run",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className="text-[13px] text-theme-text-dim"
            title={row.lastRunAt ? new Date(row.lastRunAt).toLocaleString() : undefined}
          >
            {relativeTime(row.lastRunAt)}
          </span>
          {row.lastRunStatus && <StatusBadge status={row.lastRunStatus} />}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => {
        if (!isAdmin) return null;
        const pending = pendingAction[row.id];
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleRefetch(row)}
              disabled={pending !== undefined}
              aria-label={`Re-run historical fetch for ${row.username}`}
              title="Re-run historical fetch"
            >
              <RefreshCw
                className={`h-4 w-4 ${pending === "refetch" ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleTogglePolling(row)}
              disabled={pending !== undefined}
              aria-label={
                row.pollingPaused
                  ? `Resume polling for ${row.username}`
                  : `Pause polling for ${row.username}`
              }
              title={row.pollingPaused ? "Resume polling" : "Pause polling"}
            >
              {row.pollingPaused ? (
                <Play className="h-4 w-4 text-theme-success" />
              ) : (
                <Pause className="h-4 w-4 text-theme-accent-light" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDeleteTarget(row)}
              disabled={pending !== undefined}
              aria-label={`Delete ${row.username}`}
              title="Delete author"
            >
              <Trash2 className="h-4 w-4 text-theme-danger" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <ToastProvider swipeDirection="right">
      <div className="space-y-6">
        <PipelineConfigBanner />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Authors</h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Manage tracked GitHub authors and their ingestion status.
          </p>
        </div>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Add Author</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="author-username">GitHub Username</Label>
                  <Input
                    id="author-username"
                    placeholder="e.g. octocat"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? "Adding..." : "Add Author"}
                </Button>
              </form>
              {createError && <p className="mt-2 text-sm text-theme-danger">{createError}</p>}
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-theme-text-muted">Loading authors...</div>
        ) : (
          <DataTable
            columns={columns}
            data={authors as (AuthorRow & Record<string, unknown>)[]}
            keyExtractor={(row) => row.id}
            emptyMessage="No authors added yet"
          />
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Author"
          description={`Are you sure you want to delete "${deleteTarget?.username}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          isLoading={deleting}
        />
      </div>

      {toast && (
        <Toast open={toastOpen} onOpenChange={setToastOpen} variant={toast.variant}>
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
