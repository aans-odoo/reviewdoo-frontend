import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PipelineConfigBanner } from "@/components/pipeline/PipelineConfigBanner";
import { ExternalLink, ArrowUpToLine, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface RejectedComment {
  id: string;
  externalCommentId: string;
  commentKind: string;
  body: string;
  contentHash: string;
  commentAuthorUsername: string;
  prAuthorUsername: string | null;
  prUrl: string;
  commentUrl: string;
  verdictReason: string;
  verdictConfidence: number;
  gateVersion: string;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  data: RejectedComment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface PromoteResponse {
  rejectedCommentId: string;
  reviewChecklistId?: string;
  referenceId?: string;
  action: "created" | "merged" | "reference_already_exists" | string;
}

const PAGE_SIZE = 20;

/**
 * Verdict reasons surfaced as one-click chip filters. Order roughly mirrors the
 * order admins see them in practice (deterministic rules first, then the AI
 * gate's `pr_specific_nit`). The full list of supported reasons is wider than
 * this - the chip cloud is the curated "common" subset; admins can also type
 * any reason via free-text query if needed.
 */
const VERDICT_REASON_CHIPS = [
  "bot_author",
  "self_comment_by_pr_author",
  "too_short",
  "approval_only",
  "acknowledgement_reply",
  "question_only",
  "pr_specific_nit",
] as const;

const COMMENT_KINDS = [
  "pr_review_body",
  "review_comment",
  "issue_comment",
  "review_thread_reply",
] as const;

/**
 * Coarse colour bucket for verdict reasons. We can't list every reason
 * individually so we group by "where the rejection came from":
 * - author/identity rules → red
 * - content / low-value rules → orange
 * - AI gate verdicts → blue
 */
function reasonBadgeVariant(
  reason: string,
): "red" | "orange" | "blue" | "default" {
  if (
    reason === "bot_author" ||
    reason === "self_comment_by_pr_author" ||
    reason === "untracked_pr_author"
  ) {
    return "red";
  }
  if (
    reason === "too_short" ||
    reason === "approval_only" ||
    reason === "acknowledgement_reply" ||
    reason === "question_only" ||
    reason === "empty_after_normalization"
  ) {
    return "orange";
  }
  if (
    reason === "pr_specific_nit" ||
    reason === "question" ||
    reason === "acknowledgement"
  ) {
    return "blue";
  }
  return "default";
}

function truncate(text: string, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function humanReason(reason: string): string {
  return reason.replace(/_/g, " ");
}

interface ToastState {
  variant?: "default" | "destructive";
  title: string;
  description?: React.ReactNode;
}

export function RejectedCommentsPage() {
  const [items, setItems] = useState<RejectedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [verdictReason, setVerdictReason] = useState<string>("");
  const [commentAuthorUsername, setCommentAuthorUsername] = useState("");
  const [prAuthorUsername, setPrAuthorUsername] = useState("");
  const [commentKind, setCommentKind] = useState<string>("");

  // Action state
  const [promoteTarget, setPromoteTarget] = useState<RejectedComment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RejectedComment | null>(null);
  const [actionPending, setActionPending] = useState(false);

  // Toast state
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    setToastOpen(true);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (verdictReason) params.verdictReason = verdictReason;
      if (commentAuthorUsername.trim())
        params.commentAuthorUsername = commentAuthorUsername.trim();
      if (prAuthorUsername.trim())
        params.prAuthorUsername = prAuthorUsername.trim();
      if (commentKind) params.commentKind = commentKind;

      const res = await api.get<ListResponse>("/rejected-comments", { params });
      setItems(res.data.data ?? []);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
      setTotalItems(res.data.pagination?.total ?? 0);
      setError("");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to load rejected comments");
    } finally {
      setLoading(false);
    }
  }, [page, verdictReason, commentAuthorUsername, prAuthorUsername, commentKind]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const clearFilters = () => {
    setVerdictReason("");
    setCommentAuthorUsername("");
    setPrAuthorUsername("");
    setCommentKind("");
    setPage(1);
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    const target = promoteTarget;
    setActionPending(true);
    try {
      const res = await api.post<PromoteResponse>(
        `/rejected-comments/${target.id}/promote`,
      );
      // Optimistically remove the row.
      setItems((prev) => prev.filter((r) => r.id !== target.id));
      setTotalItems((n) => Math.max(0, n - 1));
      setPromoteTarget(null);

      const checklistId = res.data.reviewChecklistId;
      const action = res.data.action;
      const verb =
        action === "merged" || action === "reference_already_exists"
          ? "Merged into Review Checklist"
          : "Promoted to Review Checklist";
      showToast({
        title: verb,
        description: checklistId ? (
          <Link
            to={`/review-checklists/${checklistId}`}
            className="text-theme-primary-light underline-offset-2 hover:underline"
          >
            View checklist →
          </Link>
        ) : undefined,
      });
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      showToast({
        variant: "destructive",
        title: "Promote failed",
        description: axErr.response?.data?.error?.message ?? "Pipeline error during promotion",
      });
    } finally {
      setActionPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setActionPending(true);
    try {
      await api.delete(`/rejected-comments/${target.id}`);
      setItems((prev) => prev.filter((r) => r.id !== target.id));
      setTotalItems((n) => Math.max(0, n - 1));
      setDeleteTarget(null);
      showToast({ title: "Deleted" });
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      showToast({
        variant: "destructive",
        title: "Delete failed",
        description: axErr.response?.data?.error?.message ?? "Could not delete rejected comment",
      });
    } finally {
      setActionPending(false);
    }
  };

  const columns: Column<RejectedComment & Record<string, unknown>>[] = [
    {
      key: "body",
      header: "Body",
      className: "max-w-[28rem]",
      render: (row) => (
        <span className="text-sm text-theme-text" title={row.body}>
          {truncate(row.body, 100)}
        </span>
      ),
    },
    {
      key: "verdictReason",
      header: "Reason",
      render: (row) => (
        <Badge variant={reasonBadgeVariant(row.verdictReason)}>
          {humanReason(row.verdictReason)}
        </Badge>
      ),
    },
    {
      key: "commentAuthorUsername",
      header: "Comment Author",
      render: (row) => (
        <span className="text-theme-text-muted">{row.commentAuthorUsername}</span>
      ),
    },
    {
      key: "prAuthorUsername",
      header: "PR Author",
      render: (row) => (
        <span className="text-theme-text-muted">{row.prAuthorUsername ?? "-"}</span>
      ),
    },
    {
      key: "gateVersion",
      header: "Gate Version",
      render: (row) => (
        <span className="text-[12px] text-theme-text-dim">{row.gateVersion}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="View comment on GitHub"
            title="View comment on GitHub"
          >
            <a href={row.commentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-theme-success"
            aria-label="Promote to checklist"
            title="Promote to checklist"
            onClick={() => setPromoteTarget(row)}
          >
            <ArrowUpToLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Delete rejected comment"
            title="Delete"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4 text-theme-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ToastProvider swipeDirection="right">
      <div className="space-y-6">
        <PipelineConfigBanner />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">
            Rejected Comments
          </h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Inspect comments the qualification gate discarded. Promote useful ones
            into checklists or delete them to clear noise.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label className="text-[12px] uppercase tracking-[0.5px] text-theme-text-dim">
                Verdict Reason
              </Label>
              <div className="flex flex-wrap gap-2">
                <ReasonChip
                  active={verdictReason === ""}
                  onClick={() => {
                    setVerdictReason("");
                    setPage(1);
                  }}
                >
                  All
                </ReasonChip>
                {VERDICT_REASON_CHIPS.map((reason) => (
                  <ReasonChip
                    key={reason}
                    active={verdictReason === reason}
                    onClick={() => {
                      setVerdictReason(verdictReason === reason ? "" : reason);
                      setPage(1);
                    }}
                  >
                    {humanReason(reason)}
                  </ReasonChip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="rc-comment-author">Comment Author</Label>
                <Input
                  id="rc-comment-author"
                  placeholder="Search by reviewer..."
                  value={commentAuthorUsername}
                  onChange={(e) => {
                    setCommentAuthorUsername(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="rc-pr-author">PR Author</Label>
                <Input
                  id="rc-pr-author"
                  placeholder="Search by tracked PR author..."
                  value={prAuthorUsername}
                  onChange={(e) => {
                    setPrAuthorUsername(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Comment Kind</Label>
                <Select
                  value={commentKind || "all"}
                  onValueChange={(v) => {
                    setCommentKind(v === "all" ? "" : v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {COMMENT_KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        <span className="capitalize">{k.replace(/_/g, " ")}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-theme-text-muted">
            Loading rejected comments...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={items as (RejectedComment & Record<string, unknown>)[]}
              keyExtractor={(row) => row.id}
              serverSide
              pageSize={PAGE_SIZE}
              currentPage={page}
              totalItems={totalItems}
              emptyMessage="No rejected comments match these filters"
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}

        <ConfirmDialog
          open={!!promoteTarget}
          onOpenChange={(open) => !open && !actionPending && setPromoteTarget(null)}
          title="Promote rejected comment"
          description="Promote this rejected comment to a Review Checklist? The pipeline will run extract → embed → dedup → persist. This action cannot be undone."
          confirmLabel="Promote"
          onConfirm={handlePromote}
          isLoading={actionPending}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && !actionPending && setDeleteTarget(null)}
          title="Delete rejected comment"
          description="Delete this rejected comment? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          isLoading={actionPending}
        />
      </div>

      {toast && (
        <Toast
          open={toastOpen}
          onOpenChange={setToastOpen}
          variant={toast.variant}
        >
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}

interface ReasonChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ReasonChip({ active, onClick, children }: ReasonChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "bg-theme-primary/15 text-theme-primary-light border-theme-primary/40"
          : "bg-theme-bg-elevated text-theme-text-muted border-border hover:bg-theme-bg-hover hover:text-theme-text",
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
