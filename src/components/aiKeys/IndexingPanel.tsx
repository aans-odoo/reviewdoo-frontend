import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/shared/Alert";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import type { IndexerStatus } from "@/lib/aiKeys";

/** How often the panel re-reads indexer status while a run is in progress. */
const POLL_INTERVAL_MS = 3000;

interface IndexingPanelProps {
  /** Whether the Key_Pool has at least one Active key (Req 9.8). */
  hasActiveKey: boolean;
}

const STOP_REASON_NOTES: Partial<Record<NonNullable<IndexerStatus["lastRun"]>["stopReason"], string>> = {
  no_active_key: "The last run stopped early because no active Gemini key was available.",
  keys_busy: "The last run paused because all keys were busy. It will retry shortly.",
};

function formatEndTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Admin panel showing Background Indexer progress (Req 9.7) with a
 * "Re-index now" trigger (Req 9.1) that is disabled without an Active key
 * (Req 9.8) or while a run is already in progress.
 */
export function IndexingPanel({ hasActiveKey }: IndexingPanelProps) {
  const [status, setStatus] = useState<IndexerStatus | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get<IndexerStatus>("/ai-keys/indexer");
      setStatus(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load indexing status"));
    }
  }, []);

  // Load on mount, and again when the pool gains or loses its Active key
  // (adding a key triggers a run on the backend).
  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus, hasActiveKey]);

  const running = status?.running ?? false;

  // Poll every 3 s while a run is in progress; stop once it ends or on unmount.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      void fetchStatus();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [running, fetchStatus]);

  const handleReindex = async () => {
    setError("");
    setStarting(true);
    try {
      const res = await api.post<IndexerStatus>("/ai-keys/indexer/run");
      setStatus(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to start indexing"));
    } finally {
      setStarting(false);
    }
  };

  const lastRun = status?.lastRun ?? null;
  const stopNote = lastRun ? STOP_REASON_NOTES[lastRun.stopReason] : undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-base">
              <Database className="mr-2 inline h-4 w-4 text-theme-text-muted" />
              Indexing
            </CardTitle>
            <CardDescription>
              Embeddings for semantic search and duplicate detection are generated in the background.
            </CardDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReindex}
            disabled={!hasActiveKey || running || starting}
            title={!hasActiveKey ? "Add a Gemini key to enable indexing" : undefined}
          >
            {starting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Re-index now
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="error" onDismiss={() => setError("")}>{error}</Alert>
        )}

        {status ? (
          <div className="space-y-2 text-sm" aria-live="polite">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-theme-text">
                {status.indexed} of {status.total} checklists indexed
              </span>
              {running && (
                <span className="flex items-center gap-1 text-xs text-theme-text-dim">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Indexing…
                </span>
              )}
            </div>
            <p className="text-theme-text-muted">
              {lastRun ? (
                <>
                  Last run ended {formatEndTime(lastRun.endedAt)}
                  {" · "}
                  {lastRun.failed} failed
                </>
              ) : (
                "No indexing run has finished yet."
              )}
            </p>
            {stopNote && <p className="text-xs text-theme-text-dim">{stopNote}</p>}
          </div>
        ) : (
          !error && (
            <p className="flex items-center gap-1 text-sm text-theme-text-dim">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading status…
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
