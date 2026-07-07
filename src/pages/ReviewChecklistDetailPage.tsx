import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReviewChecklistFormDialog } from "@/components/checklists/ReviewChecklistFormDialog";
import { Alert } from "@/components/shared/Alert";
import { Loading } from "@/components/shared/Loading";
import { Markdown } from "@/components/shared/Markdown";
import { useEmbeddingModel } from "@/hooks/useEmbeddingModel";
import { useAuth } from "@/hooks/useAuth";
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
  category: string | null;
  languages: string[];
  filePatterns: string[];
  references: Reference[];
  createdAt: string;
  updatedAt: string;
}

export function ReviewChecklistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { hasEmbeddingModel } = useEmbeddingModel(isAuthenticated);

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
    return <Loading />;
  }

  if (error && !item) {
    return (
      <div className="space-y-4">
        {isAuthenticated && (
          <Button variant="ghost" onClick={() => navigate("/review-checklists")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="space-y-6">
      {isAuthenticated && (
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
      )}

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <Card className="overflow-hidden">
        <CardContent className="px-0">
          <p className="text-xs font-medium uppercase tracking-wider text-theme-text-muted px-6 py-3 bg-theme-body/30">Review Checklist</p>

          <div className="px-6 pt-4">
            <Markdown className="text-base leading-relaxed text-theme-text px-4 py-8">
              {item.description}
            </Markdown>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-theme-border pt-6 pb-2 text-sm text-theme-text-muted">
              <div className="flex items-center gap-2">
                <span>Severity:</span>
                <Badge variant={item.severity === "critical" ? "red" : item.severity === "major" ? "orange" : "default"}>
                  {item.severity}
                </Badge>
              </div>

              <span className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <span>Category:</span>
                <span className="capitalize text-theme-text-dim">{item.category || "—"}</span>
              </div>

              <span className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <span>Languages:</span>
                <div className="flex flex-wrap gap-1">
                  {item.languages.length > 0 ? (
                    item.languages.map((lang) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </div>
              </div>

              <span className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <span>File Patterns:</span>
                <div className="flex flex-wrap gap-1">
                  {item.filePatterns.length > 0 ? (
                    item.filePatterns.map((pat) => (
                      <Badge key={pat} variant="outline">{pat}</Badge>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </div>
              </div>

              <span className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <span>Created:</span>
                <span className="text-theme-text-dim">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-theme-text-muted mb-3">References ({item.references?.length ?? 0})</p>
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
              No references yet.
              {isAuthenticated && (
                <> Use <span className="font-medium">Edit</span> to add some.</>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {isAuthenticated && (
        <>
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
        </>
      )}
    </div>
  );
}
