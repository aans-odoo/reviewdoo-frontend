import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Trash2 } from "lucide-react";
import api from "@/lib/api";

interface Author {
  id: string;
  username: string;
  _count?: { comments?: number; ingestionLogs?: number };
  commentCount?: number;
  ingestionLogCount?: number;
}

export function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/authors");
      setAuthors(res.data.authors ?? res.data);
      setError("");
    } catch {
      setError("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAuthors(); }, []);

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

  const columns: Column<Author & Record<string, unknown>>[] = [
    { key: "username", header: "Username", sortable: true },
    {
      key: "commentCount",
      header: "Comments",
      render: (row) => <span className="text-theme-text-dim">{row._count?.comments ?? row.commentCount ?? 0}</span>,
    },
    {
      key: "ingestionLogCount",
      header: "Ingestion Logs",
      render: (row) => <span className="text-theme-text-dim">{row._count?.ingestionLogs ?? row.ingestionLogCount ?? 0}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(row)} aria-label={`Delete ${row.username}`}>
          <Trash2 className="h-4 w-4 text-theme-danger" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Authors</h2>
        <p className="mt-1 text-sm text-theme-text-muted">Manage tracked GitHub authors and their ingestion status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Author</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="author-username">GitHub Username</Label>
              <Input id="author-username" placeholder="e.g. octocat" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <Button type="submit" disabled={creating}>{creating ? "Adding..." : "Add Author"}</Button>
          </form>
          {createError && <p className="mt-2 text-sm text-theme-danger">{createError}</p>}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-theme-text-muted">Loading authors...</div>
      ) : (
        <DataTable
          columns={columns}
          data={authors as (Author & Record<string, unknown>)[]}
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
  );
}
