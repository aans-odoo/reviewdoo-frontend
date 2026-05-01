import { useState, useEffect, useCallback } from "react";
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
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface IngestionLog {
  id: string;
  status: string;
  source: string;
  authorId: string;
  author?: { username: string; platform: string };
  commentsFetched: number;
  commentsTotal: number;
  startedAt: string;
  completedAt: string | null;
  error?: string;
}

interface Author {
  id: string;
  username: string;
  platform: string;
}

const STATUSES = ["pending", "running", "completed", "failed", "paused"];

export function IngestionLogsPage() {
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

  useEffect(() => { fetchAuthors(); }, []);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

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
      render: (row) => row.author ? <span className="text-theme-text">{row.author.username} <span className="text-theme-text-dim">({row.author.platform})</span></span> : <span className="text-theme-text-dim">—</span>,
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
  ];

  return (
    <div className="space-y-6">
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
                  {authors.map((a) => (<SelectItem key={a.id} value={a.id}>{a.username} ({a.platform})</SelectItem>))}
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
            emptyMessage="No ingestion logs found"
          />
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
