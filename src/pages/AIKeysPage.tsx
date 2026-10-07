import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/shared/Alert";
import { Loading } from "@/components/shared/Loading";
import { KeyTable } from "@/components/aiKeys/KeyTable";
import { AddGeminiKeyDialog } from "@/components/aiKeys/AddGeminiKeyDialog";
import { IndexingPanel } from "@/components/aiKeys/IndexingPanel";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import {
  EMBEDDING_MODEL,
  MAX_KEYS_PER_USER,
  type KeyFailureReason,
  type KeyPoolListResponse,
  type PoolKeyView,
} from "@/lib/aiKeys";

/** Response of `POST /ai-keys/:id/recheck`. */
interface RecheckResponse {
  key: PoolKeyView;
  ok: boolean;
  reason?: KeyFailureReason;
}

/** Page-level feedback shown above the key lists (re-check outcome, add success). */
interface Feedback {
  variant: "success" | "error";
  message: string;
}

/**
 * AI Keys page: a short intro to the shared Gemini key pool and the caller's
 * own keys. Admins also
 * see every key with its owner and the Indexing panel.
 */
export function AIKeysPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<KeyPoolListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Refetches the pool without toggling the full-page loader, so tables stay
  // in place after add/remove/re-check.
  const fetchKeys = useCallback(async () => {
    try {
      const res = await api.get<KeyPoolListResponse>("/ai-keys");
      setData(res.data);
      setLoadError("");
    } catch (err: unknown) {
      setLoadError(getApiErrorMessage(err, "Failed to load AI keys"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  const handleAdded = (result: { key: PoolKeyView; hasActiveKey: boolean }) => {
    setData((prev) => (prev ? { ...prev, hasActiveKey: result.hasActiveKey } : prev));
    setFeedback({
      variant: "success",
      message: `Thanks! Your key ending in ${result.key.keyHint} is now in the team pool.`,
    });
    void fetchKeys();
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete<{ hasActiveKey: boolean }>(`/ai-keys/${id}`);
    } catch (err: unknown) {
      // KeyTable shows this message inside its confirm dialog.
      throw new Error(getApiErrorMessage(err, "Failed to remove key"));
    }
    setFeedback(null);
    await fetchKeys();
  };

  const handleRecheck = async (id: string) => {
    setFeedback(null);
    try {
      const res = await api.post<RecheckResponse>(`/ai-keys/${id}/recheck`);
      const { key, ok, reason } = res.data;
      setFeedback(
        ok
          ? { variant: "success", message: `Key ending in ${key.keyHint} works again and is back in the pool.` }
          : {
            variant: "error",
            message: `Key ending in ${key.keyHint} is still invalid: ${reason ?? "Unexpected response from Gemini"}.`,
          }
      );
    } catch (err: unknown) {
      setFeedback({ variant: "error", message: getApiErrorMessage(err, "Failed to re-check key") });
    }
    await fetchKeys();
  };

  const hasActiveKey = data?.hasActiveKey ?? false;
  const atLimit = (data?.myKeys.length ?? 0) >= MAX_KEYS_PER_USER;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">AI Keys</h2>
        <p className="max-w-2xl text-sm text-theme-text-muted">
          Keys added here are shared by the whole team and used to create embeddings with{" "}
          <code className="font-mono text-theme-text">{EMBEDDING_MODEL}</code>. They power semantic
          search and duplicate detection. Requests rotate across all keys, so each one adds capacity.
        </p>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {loadError && (
            <Alert variant="error" onDismiss={() => setLoadError("")}>{loadError}</Alert>
          )}

          {feedback && (
            <Alert variant={feedback.variant} onDismiss={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          )}

          {data && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {isAdmin ? (
                          <Users className="h-4 w-4 text-theme-text-muted" aria-hidden="true" />
                        ) : (
                          <KeyRound className="h-4 w-4 text-theme-text-muted" aria-hidden="true" />
                        )}
                        {isAdmin ? "All keys" : "Your contributions"}
                      </CardTitle>
                      {isAdmin &&
                        <CardDescription>Every key in the team pool, with its owner.</CardDescription>
                      }
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setAddOpen(true)}
                      disabled={atLimit}
                      title={atLimit ? `You can add up to ${MAX_KEYS_PER_USER} keys` : undefined}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Contribute a key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isAdmin ? (
                    <KeyTable
                      keys={data.allKeys ?? []}
                      showOwner
                      onRemove={handleRemove}
                      onRecheck={handleRecheck}
                      emptyMessage="No keys in the pool yet"
                    />
                  ) : (
                    <KeyTable
                      keys={data.myKeys}
                      onRemove={handleRemove}
                      onRecheck={handleRecheck}
                      emptyMessage="You haven't contributed a key yet"
                    />
                  )}
                </CardContent>
              </Card>

              {isAdmin && <IndexingPanel hasActiveKey={hasActiveKey} />}
            </>
          )}
        </>
      )}

      <AddGeminiKeyDialog open={addOpen} onOpenChange={setAddOpen} onAdded={handleAdded} />
    </div>
  );
}
