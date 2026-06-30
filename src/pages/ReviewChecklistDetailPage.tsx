import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReviewChecklistFormDialog } from "@/components/checklists/ReviewChecklistFormDialog";
import { useEmbeddingModel } from "@/hooks/useEmbeddingModel";
import { ArrowLeft, Pencil, Trash2, Link as LinkIcon } from "lucide-react";
import api from "@/lib/api";

interface Reference {
  id: string;
  url: string;
  description?: string;
  createdAt?: string;
}

interface ReviewChecklistDetail {
  id: string;
  description: string;
  severity: string;
  category: string;
  languages: string[];
  filePatterns: string[];
  references: Reference[];
  createdAt: string;
  updatedAt: string;
}

export function ReviewChecklistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasEmbeddingModel } = useEmbeddingModel();

  const [item, setItem] = useState<ReviewChecklistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/review-checklists/${id}`);
      const data = res.data.item ?? res.data;
      setItem(data);
      setError("");
    } catch {
      setError("Failed to load review checklist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/review-checklists/${id}`);
      navigate("/review-checklists");
    } catch {
      setError("Failed to delete review checklist");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-sm text-theme-text-muted">Loading...</div>;
  }

  if (error && !item) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/review-checklists")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{error}</div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/review-checklists")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Review Checklists
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            disabled={!hasEmbeddingModel}
            title={hasEmbeddingModel ? undefined : "Configure an embedding model first"}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Review Checklist Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-[13px] font-medium text-theme-text-muted">Description</p>
              <p className="mt-1 text-theme-text">{item.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Severity</p>
                <Badge variant={item.severity === "critical" ? "red" : item.severity === "major" ? "orange" : "default"} className="mt-1">
                  {item.severity}
                </Badge>
              </div>
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Category</p>
                <p className="mt-1 capitalize text-theme-text">{item.category}</p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-theme-text-muted">Created</p>
                <p className="mt-1 text-sm text-theme-text-dim">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-theme-text-muted">Languages</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.languages.length > 0 ? (
                  item.languages.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-theme-text-muted">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-theme-text-muted">File Patterns</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.filePatterns.length > 0 ? (
                  item.filePatterns.map((pat) => (
                    <Badge key={pat} variant="outline">{pat}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-theme-text-muted">None</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>References ({item.references?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {item.references && item.references.length > 0 ? (
            <ul className="space-y-2">
              {item.references.map((ref) => (
                <li key={ref.id} className="flex items-center gap-2 rounded-sm border border-border px-3 py-2">
                  <LinkIcon className="h-3.5 w-3.5 shrink-0 text-theme-text-dim" />
                  <div className="min-w-0 flex-1">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-theme-primary-light hover:text-theme-primary break-all"
                    >
                      {ref.url}
                    </a>
                    {ref.description && (
                      <p className="mt-0.5 text-xs text-theme-text-dim">{ref.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-theme-text-muted">
              No references yet. Use <span className="font-medium">Edit</span> to add some.
            </p>
          )}
        </CardContent>
      </Card>

      <ReviewChecklistFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        hasEmbeddingModel={hasEmbeddingModel}
        initial={{
          id: item.id,
          description: item.description,
          severity: item.severity,
          category: item.category,
          languages: item.languages,
          filePatterns: item.filePatterns,
          references: item.references ?? [],
        }}
        onSaved={fetchItem}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Review Checklist"
        description="Are you sure you want to delete this review checklist? All references will also be removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
