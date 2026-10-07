import { useState } from "react";
import { Loader2, RotateCw, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MaskedKey } from "@/components/aiKeys/MaskedKey";
import type {
  GeminiErrorCategory,
  PoolKeyAdminView,
  PoolKeyView,
} from "@/lib/aiKeys";

/** Human-readable labels for the last recorded Gemini error category. */
const ERROR_CATEGORY_LABELS: Record<GeminiErrorCategory, string> = {
  rate_limited: "Rate limited",
  key_rejected: "Key rejected",
  upstream_unavailable: "Gemini unavailable",
  network: "Network error",
  unexpected_response: "Unexpected response",
};

type KeyRow = (PoolKeyView | PoolKeyAdminView) & Record<string, unknown>;

interface KeyTableProps {
  keys: (PoolKeyView | PoolKeyAdminView)[];
  /** Show the Owner column (admin "All keys" table only). */
  showOwner?: boolean;
  /** Remove a key. Rejections are shown inside the confirm dialog. */
  onRemove: (id: string) => Promise<void>;
  /**
   * Re-check an invalid key. The caller is responsible for surfacing
   * results/errors (e.g. via a toast); the table only tracks busy state.
   */
  onRecheck: (id: string) => Promise<void>;
  emptyMessage?: string;
}

function hasOwner(key: PoolKeyView | PoolKeyAdminView): key is PoolKeyAdminView {
  return "owner" in key && key.owner != null;
}

function formatDateTime(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isCoolingDown(coolingDownUntil: string | null): boolean {
  return coolingDownUntil != null && new Date(coolingDownUntil).getTime() > Date.now();
}

function initials(name: string, email: string): string {
  if (name.trim()) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.charAt(0).toUpperCase();
}

/**
 * Table of Gemini pool keys. Keys are identified only by their hint; the only
 * actions are "Remove" (every row) and "Re-check" (invalid keys only). There is
 * deliberately no edit action: a key is changed by removing it and adding a new one.
 */
export function KeyTable({
  keys,
  showOwner = false,
  onRemove,
  onRecheck,
  emptyMessage = "No keys yet",
}: KeyTableProps) {
  const [pendingRemove, setPendingRemove] = useState<PoolKeyView | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, "remove" | "recheck">>({});

  const setRowBusy = (id: string, action: "remove" | "recheck" | null) => {
    setBusy((prev) => {
      const next = { ...prev };
      if (action) next[id] = action;
      else delete next[id];
      return next;
    });
  };

  const openRemoveDialog = (key: PoolKeyView) => {
    setRemoveError(null);
    setPendingRemove(key);
  };

  const handleConfirmRemove = async () => {
    if (!pendingRemove) return;
    const id = pendingRemove.id;
    setRowBusy(id, "remove");
    setRemoveError(null);
    try {
      await onRemove(id);
      setPendingRemove(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove key");
    } finally {
      setRowBusy(id, null);
    }
  };

  const handleRecheck = async (id: string) => {
    setRowBusy(id, "recheck");
    try {
      await onRecheck(id);
    } catch {
      // Errors are surfaced by the caller; swallow here to avoid an unhandled rejection.
    } finally {
      setRowBusy(id, null);
    }
  };

  const columns: Column<KeyRow>[] = [
    {
      key: "keyHint",
      header: "Key",
      render: (row) => (
        <div className="flex items-center gap-2">
          <MaskedKey hint={row.keyHint} size="sm" />
          {row.carriedOver && <Badge variant="purple">Carried over</Badge>}
        </div>
      ),
    },
    ...(showOwner
      ? [
          {
            key: "owner",
            header: "Owner",
            render: (row: KeyRow) => {
              if (!hasOwner(row)) return <span className="text-theme-text-muted">—</span>;
              const { name, email, avatarUrl } = row.owner;
              return (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                    <AvatarFallback className="text-[10px]">{initials(name, email)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-theme-text">{name || email}</span>
                    {name && <span className="text-xs text-theme-text-muted">{email}</span>}
                  </div>
                </div>
              );
            },
          } satisfies Column<KeyRow>,
        ]
      : []),
    {
      key: "createdAt",
      header: "Added",
      render: (row) => (
        <span className="whitespace-nowrap text-theme-text-muted">{formatDateTime(row.createdAt)}</span>
      ),
    },
    {
      key: "lastUsedAt",
      header: "Last used",
      render: (row) => (
        <span className="whitespace-nowrap text-theme-text-muted">{formatDateTime(row.lastUsedAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {row.status === "active" ? (
            <StatusBadge status="Active" />
          ) : (
            <StatusBadge
              status="Invalid"
              className="bg-theme-danger/15 text-theme-danger border-theme-danger/30"
            />
          )}
          {isCoolingDown(row.coolingDownUntil) && (
            <Badge variant="orange" title={`Until ${formatDateTime(row.coolingDownUntil)}`}>
              Cooling down
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "lastErrorCategory",
      header: "Last error",
      render: (row) =>
        row.lastErrorCategory ? (
          <span
            className="text-theme-text"
            title={row.lastErrorAt ? formatDateTime(row.lastErrorAt) : undefined}
          >
            {ERROR_CATEGORY_LABELS[row.lastErrorCategory] ?? row.lastErrorCategory}
          </span>
        ) : (
          <span className="text-theme-text-muted">—</span>
        ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      render: (row) => {
        const rowBusy = busy[row.id];
        return (
          <div className="flex items-center justify-end gap-2">
            {row.status === "invalid" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRecheck(row.id)}
                disabled={rowBusy != null}
                aria-label={`Re-check key ending in ${row.keyHint}`}
              >
                {rowBusy === "recheck" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                )}
                {rowBusy === "recheck" ? "Checking…" : "Re-check"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-theme-danger hover:text-theme-danger"
              onClick={() => openRemoveDialog(row)}
              disabled={rowBusy != null}
              aria-label={`Remove key ending in ${row.keyHint}`}
            >
              {rowBusy === "remove" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const isRemoving = pendingRemove != null && busy[pendingRemove.id] === "remove";

  return (
    <>
      <DataTable
        columns={columns}
        data={keys as KeyRow[]}
        keyExtractor={(row) => row.id}
        emptyMessage={emptyMessage}
      />
      <ConfirmDialog
        open={pendingRemove != null}
        onOpenChange={(open) => {
          if (!open && !isRemoving) {
            setPendingRemove(null);
            setRemoveError(null);
          }
        }}
        title="Remove this key?"
        description={
          pendingRemove
            ? `The key ending in ${pendingRemove.keyHint} will be deleted from the database and removed from the team pool. This cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleConfirmRemove}
        isLoading={isRemoving}
        error={removeError}
      />
    </>
  );
}
