import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PipelineConfigBanner } from "@/components/pipeline/PipelineConfigBanner";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface IngestionLog {
  id: string;
  status: string;
  source: string;
  authorId: string;
  author?: { username: string };
  commentsFetched: number;
  commentsTotal: number;
  startedAt: string;
  completedAt: string | null;
  error?: string;
}

interface Author {
  id: string;
  username: string;
}

const STATUSES = ["pending", "running", "completed", "failed", "paused"];

export function IngestionLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [statusFilter, setStatusFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);

  const fetchAuthors = async () => {
    try {
      const res = await api.get("/authors");
      setAuthors(res.data.authors ?? res.data);
    } catch { /* Non-critical */ }
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, pageSize };
      if (statusFilter) params.status = statusFilter;
      if (authorFilter) params.authorId = authorFilter;

      const res = await api.get("/ingestion-logs", { params });
      const data = res.data;
      setLogs(data.data ?? data.logs ?? data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1);
      setTotalItems(data.pagination?.total ?? data.total ?? 0);
      setError("");
    } catch {
      setError("Failed to load ingestion logs");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, authorFilter]);

  // Silent background refresh used by the auto-refresh poller. Unlike
  // `fetchLogs` it never toggles the loading spinner, so the table doesn't
  // flicker every 5s.
  const refreshLogs = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page, pageSize };
      if (statusFilter) params.status = statusFilter;
      if (authorFilter) params.authorId = authorFilter;

      const res = await api.get("/ingestion-logs", { params });
      const data = res.data;
      setLogs(data.data ?? data.logs ?? data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1);
      setTotalItems(data.pagination?.total ?? data.total ?? 0);
      setError("");
    } catch {
      /* Keep the last good view on a transient poll failure. */
    }
  }, [page, pageSize, statusFilter, authorFilter]);

  useEffect(() => { fetchAuthors(); }, []);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Auto-refresh the list every 5s so in-flight runs update without a manual
  // reload. The poller pauses while the browser tab is hidden to avoid
  // needless background traffic.
  useEffect(() => {
    const REFRESH_MS = 5000;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshLogs();
      }
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refreshLogs]);

  const clearFilters = () => { setStatusFilter(""); setAuthorFilter(""); setPage(1); };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const columns: Column<IngestionLog & Record<string, unknown>>[] = [
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "source",
      header: "Source",
      render: (row) => <span className="capitalize text-theme-text-muted">{row.source}</span>,
    },
    {
      key: "author",
      header: "Author",
      render: (row) => row.author ? <span className="text-theme-text">{row.author.username}</span> : <span className="text-theme-text-dim">—</span>,
    },
    {
      key: "commentsFetched",
      header: "Comments",
      render: (row) => <span className="text-theme-text-dim">{row.commentsFetched ?? 0} / {row.commentsTotal ?? 0}</span>,
    },
    {
      key: "startedAt",
      header: "Started",
      render: (row) => <span className="text-[13px] text-theme-text-dim">{formatDate(row.startedAt)}</span>,
    },
    {
      key: "completedAt",
      header: "Completed",
      render: (row) => <span className="text-[13px] text-theme-text-dim">{formatDate(row.completedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/ingestion-logs/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PipelineConfigBanner />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Ingestion Logs</h2>
        <p className="mt-1 text-sm text-theme-text-muted">Monitor data ingestion activity and status.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {STATUSES.map((s) => (<SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Select value={authorFilter} onValueChange={(v) => { setAuthorFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-52"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {authors.map((a) => (<SelectItem key={a.id} value={a.id}>{a.username}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-theme-text-muted">Loading...</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={logs as (IngestionLog & Record<string, unknown>)[]}
            keyExtractor={(row) => row.id}
            serverSide
            pageSize={pageSize}
            currentPage={page}
            totalItems={totalItems}
            onPageChange={setPage}
            emptyMessage="No ingestion logs found"
          />
        </>
      )}
    </div>
  );
}
