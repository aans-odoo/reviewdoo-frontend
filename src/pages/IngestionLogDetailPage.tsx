import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

// Mirrors backend EventKind union
// (@see backend/src/services/ingestionEventService.ts).
const EVENT_KINDS = [
  "page_fetched",
  "comment_seen",
  "comment_qualified",
  "comment_rejected",
  "dedup_matched",
  "checklist_created",
  "reference_added",
  "reference_already_exists",
  "rejected_already_exists",
  "rejected_already_exists_updated",
  "processing_failed",
  "rate_limited",
  "paused",
  "resumed",
  "edit_applied",
  "delete_applied",
  "edit_for_unknown_comment",
  "promoted_from_rejected",
  "polling_run_started",
  "polling_run_completed",
  "polling_skipped",
] as const;

type EventKind = (typeof EVENT_KINDS)[number];

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "purple"
  | "green"
  | "orange"
  | "blue"
  | "red";

// Group kinds into visual families so the timeline scans easily at a glance.
const KIND_VARIANT: Record<EventKind, BadgeVariant> = {
  // Run lifecycle / informational
  page_fetched: "blue",
  polling_run_started: "blue",
  polling_run_completed: "blue",
  polling_skipped: "outline",
  // Qualification gate
  comment_seen: "default",
  comment_qualified: "green",
  comment_rejected: "orange",
  // Persistence outcomes
  checklist_created: "purple",
  reference_added: "purple",
  reference_already_exists: "outline",
  rejected_already_exists: "outline",
  rejected_already_exists_updated: "outline",
  dedup_matched: "purple",
  // Edits / deletes
  edit_applied: "default",
  delete_applied: "default",
  edit_for_unknown_comment: "outline",
  promoted_from_rejected: "green",
  // State changes
  paused: "orange",
  resumed: "green",
  // Failures
  processing_failed: "red",
  rate_limited: "red",
};

interface IngestionLogDetail {
  id: string;
  status: string;
  source: string;
  authorId: string;
  author?: { username: string };
  commentsFetched: number;
  commentsTotal: number;
  pauseRequested?: boolean;
  startedAt: string;
  completedAt: string | null;
  error?: string | null;
}

interface IngestionEvent {
  id: string;
  ingestionLogId: string;
  kind: string;
  externalCommentId: string | null;
  commentKind: string | null;
  verdict: string | null;
  verdictReason: string | null;
  verdictConfidence: number | null;
  reviewChecklistId: string | null;
  referenceId: string | null;
  errorDetails: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

interface EventsResponse {
  data: IngestionEvent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatRelative(value: string): string {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return value;
  const diffMs = Date.now() - then;
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  if (sec < 60) return diffMs >= 0 ? `${sec}s ago` : `in ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return diffMs >= 0 ? `${min}m ago` : `in ${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return diffMs >= 0 ? `${hr}h ago` : `in ${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 30) return diffMs >= 0 ? `${day}d ago` : `in ${day}d`;
  return new Date(value).toLocaleDateString();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function metaPreview(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null;
  const keys = Object.keys(meta);
  if (keys.length === 0) return null;
  try {
    const stringified = JSON.stringify(meta);
    return stringified.length > 240 ? `${stringified.slice(0, 237)}...` : stringified;
  } catch {
    return null;
  }
}

export function IngestionLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [log, setLog] = useState<IngestionLogDetail | null>(null);
  const [logError, setLogError] = useState("");
  const [logLoading, setLogLoading] = useState(true);

  const [events, setEvents] = useState<IngestionEvent[]>([]);
  const [eventsError, setEventsError] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 50;

  const [kindFilter, setKindFilter] = useState<string>("");

  const [pauseActionPending, setPauseActionPending] = useState(false);
  const [pauseActionError, setPauseActionError] = useState("");

  const fetchLog = useCallback(async () => {
    if (!id) return;
    try {
      setLogLoading(true);
      const res = await api.get(`/ingestion-logs/${id}`);
      setLog(res.data.log ?? res.data);
      setLogError("");
    } catch {
      setLogError("Failed to load ingestion log");
    } finally {
      setLogLoading(false);
    }
  }, [id]);

  const fetchEvents = useCallback(async () => {
    if (!id) return;
    try {
      setEventsLoading(true);
      const params: Record<string, string | number> = { page, pageSize };
      if (kindFilter) params.kind = kindFilter;
      const res = await api.get<EventsResponse>(
        `/ingestion-logs/${id}/events`,
        { params },
      );
      setEvents(res.data.data ?? []);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
      setTotalItems(res.data.pagination?.total ?? 0);
      setEventsError("");
    } catch {
      setEventsError("Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  }, [id, page, pageSize, kindFilter]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Silent background refreshers used by the auto-refresh poller — they skip
  // the loading spinners so the page doesn't flicker every 5s.
  const refreshLog = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/ingestion-logs/${id}`);
      setLog(res.data.log ?? res.data);
      setLogError("");
    } catch {
      /* Keep the last good view on a transient poll failure. */
    }
  }, [id]);

  const refreshEvents = useCallback(async () => {
    if (!id) return;
    try {
      const params: Record<string, string | number> = { page, pageSize };
      if (kindFilter) params.kind = kindFilter;
      const res = await api.get<EventsResponse>(
        `/ingestion-logs/${id}/events`,
        { params },
      );
      setEvents(res.data.data ?? []);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
      setTotalItems(res.data.pagination?.total ?? 0);
      setEventsError("");
    } catch {
      /* Keep the last good view on a transient poll failure. */
    }
  }, [id, page, pageSize, kindFilter]);

  // Auto-refresh the log header + event timeline every 5s so a live run
  // streams in without a manual reload. Pauses while the tab is hidden.
  useEffect(() => {
    const REFRESH_MS = 5000;
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshLog();
        refreshEvents();
      }
    }, REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, [refreshLog, refreshEvents]);

  const handlePause = useCallback(async () => {
    if (!id) return;
    setPauseActionPending(true);
    setPauseActionError("");
    try {
      await api.post(`/ingestion-logs/${id}/pause`);
      await fetchLog();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setPauseActionError(
        axErr.response?.data?.error?.message ?? "Failed to pause the fetch",
      );
    } finally {
      setPauseActionPending(false);
    }
  }, [id, fetchLog]);

  const handleResume = useCallback(async () => {
    if (!id) return;
    setPauseActionPending(true);
    setPauseActionError("");
    try {
      await api.post(`/ingestion-logs/${id}/resume`);
      await fetchLog();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setPauseActionError(
        axErr.response?.data?.error?.message ?? "Failed to resume the fetch",
      );
    } finally {
      setPauseActionPending(false);
    }
  }, [id, fetchLog]);

  // Historical runs are the only pausable source. Show Pause while it's
  // actively working (running/pending and not already pausing), Resume while
  // paused. A `pauseRequested` flag with status still running means "pausing…".
  const isHistorical = log?.source === "historical";
  const isPausing = Boolean(log?.pauseRequested) && log?.status !== "paused";
  const canPause =
    isHistorical && (log?.status === "running" || log?.status === "pending") && !isPausing;
  const canResume = isHistorical && log?.status === "paused";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/ingestion-logs")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Ingestion Logs
        </Button>

        {isAdmin && isHistorical && (canPause || canResume || isPausing) && (
          <div className="flex items-center gap-2">
            {isPausing && (
              <span className="text-[13px] text-theme-text-muted">Pausing…</span>
            )}
            {canPause && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                disabled={pauseActionPending}
              >
                <Pause className="mr-2 h-4 w-4" /> Pause fetch
              </Button>
            )}
            {canResume && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResume}
                disabled={pauseActionPending}
              >
                <Play className="mr-2 h-4 w-4" /> Resume fetch
              </Button>
            )}
          </div>
        )}
      </div>

      {pauseActionError && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
          {pauseActionError}
        </div>
      )}

      {logError && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
          {logError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ingestion Log</CardTitle>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <div className="py-4 text-center text-sm text-theme-text-muted">Loading...</div>
          ) : log ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Status</p>
                <div className="mt-1"><StatusBadge status={log.status} /></div>
              </div>
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Source</p>
                <p className="mt-1 capitalize text-theme-text">{log.source}</p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Author</p>
                <p className="mt-1 text-theme-text">
                  {log.author?.username ?? <span className="text-theme-text-dim">—</span>}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Comments</p>
                <p className="mt-1 text-theme-text-dim">
                  {log.commentsFetched ?? 0} / {log.commentsTotal ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Started</p>
                <p className="mt-1 text-[13px] text-theme-text-dim">{formatDateTime(log.startedAt)}</p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Completed</p>
                <p className="mt-1 text-[13px] text-theme-text-dim">{formatDateTime(log.completedAt)}</p>
              </div>
              {log.error && (
                <div className="col-span-full">
                  <p className="text-[13px] font-medium text-theme-text-muted">Error</p>
                  <p className="mt-1 text-sm text-theme-danger break-words">{log.error}</p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Timeline {totalItems > 0 ? `(${totalItems})` : null}</CardTitle>
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Kind</Label>
              <Select
                value={kindFilter || "all"}
                onValueChange={(v) => {
                  setKindFilter(v === "all" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All kinds</SelectItem>
                  {EVENT_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventsError && (
            <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
              {eventsError}
            </div>
          )}

          {eventsLoading ? (
            <div className="py-8 text-center text-sm text-theme-text-muted">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-sm text-theme-text-muted">
              {kindFilter ? "No events for this kind yet." : "No events recorded for this log."}
            </div>
          ) : (
            <ol className="relative border-l border-border pl-6">
              {events.map((evt) => (
                <EventRow key={evt.id} event={evt} />
              ))}
            </ol>
          )}

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventRow({ event }: { event: IngestionEvent }) {
  const variant: BadgeVariant =
    KIND_VARIANT[event.kind as EventKind] ?? "default";

  return (
    <li className="mb-6 ml-2">
      <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border border-border bg-theme-bg-card" />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={variant}>{event.kind}</Badge>
        <span
          className="text-[12px] text-theme-text-dim"
          title={formatDateTime(event.createdAt)}
        >
          {formatRelative(event.createdAt)}
        </span>
        {event.commentKind && (
          <span className="text-[12px] text-theme-text-muted">{event.commentKind}</span>
        )}
        {event.verdict && (
          <Badge
            variant={
              event.verdict === "save"
                ? "green"
                : event.verdict === "merge"
                ? "purple"
                : event.verdict === "discard"
                ? "orange"
                : "default"
            }
          >
            verdict: {event.verdict}
          </Badge>
        )}
      </div>
      <EventDetail event={event} />
    </li>
  );
}

function EventDetail({ event }: { event: IngestionEvent }) {
  const lines: { label: string; value: React.ReactNode }[] = [];

  if (event.externalCommentId) {
    lines.push({ label: "External comment", value: event.externalCommentId });
  }
  if (event.verdictReason) {
    lines.push({ label: "Reason", value: event.verdictReason });
  }
  if (typeof event.verdictConfidence === "number") {
    lines.push({
      label: "Confidence",
      value: event.verdictConfidence.toFixed(2),
    });
  }
  if (event.reviewChecklistId) {
    lines.push({
      label: "Review checklist",
      value: (
        <a
          href={`/review-checklists/${event.reviewChecklistId}`}
          className="text-theme-primary-light hover:text-theme-primary"
        >
          {event.reviewChecklistId}
        </a>
      ),
    });
  }
  if (event.referenceId) {
    lines.push({ label: "Reference", value: event.referenceId });
  }
  if (event.errorDetails) {
    lines.push({
      label: "Error",
      value: <span className="text-theme-danger break-words">{event.errorDetails}</span>,
    });
  }

  // Surface a couple of high-signal meta keys explicitly when present.
  if (isRecord(event.meta)) {
    const sim = event.meta.similarity ?? event.meta.distance;
    if (typeof sim === "number") {
      lines.push({ label: "Similarity", value: sim.toFixed(3) });
    }
    if (typeof event.meta.page === "number") {
      lines.push({ label: "Page", value: event.meta.page });
    }
    if (typeof event.meta.prUrl === "string") {
      lines.push({
        label: "PR",
        value: (
          <a
            href={event.meta.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-primary-light hover:text-theme-primary break-all"
          >
            {event.meta.prUrl}
          </a>
        ),
      });
    }
  }

  const rawMeta = metaPreview(event.meta);

  if (lines.length === 0 && !rawMeta) return null;

  return (
    <div className="mt-1.5 space-y-0.5 text-[13px] text-theme-text-muted">
      {lines.map((line, idx) => (
        <div key={idx} className="flex flex-wrap gap-x-2">
          <span className="text-theme-text-dim">{line.label}:</span>
          <span className="text-theme-text break-all">{line.value}</span>
        </div>
      ))}
      {rawMeta && lines.length === 0 && (
        <pre className="mt-1 max-w-full overflow-x-auto rounded-sm bg-theme-bg-elevated px-2 py-1 text-[12px] text-theme-text-dim">
          {rawMeta}
        </pre>
      )}
    </div>
  );
}
