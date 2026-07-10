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
import { ContributionInfo, Contributor } from "@/components/shared/ContributionInfo";
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
  scope?: string;
  category: string | null;
  languages: string[];
  filePatterns: string[];
  references: Reference[];
  createdAt: string;
  updatedAt: string;
  createdBy?: Contributor | null;
  updatedBy?: Contributor | null;
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
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setDeleteError(null);
    try {
      await api.delete(`/review-checklists/${id}`);
      navigate("/review-checklists");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
        "Failed to delete review checklist";
      setDeleteError(msg);
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
      {isAuthenticated
        ? (
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/review-checklists")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Review Checklists
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                title="Configure an embedding model first"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        )
        : <br />
      }

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <Card className="overflow-hidden">
        <CardContent className="px-0">
          <div className="flex items-center justify-between px-6 py-3 bg-theme-body/30">
            <p className="text-xs font-medium uppercase tracking-wider text-theme-text-muted">Review Checklist</p>
            <ContributionInfo
              createdBy={item.createdBy}
              updatedBy={item.updatedBy}
              createdAt={item.createdAt}
              updatedAt={item.updatedAt}
              tooltipSide="left"
            />
          </div>

          <div className="px-6 pt-4">
            <Markdown className="text-base leading-relaxed text-theme-text px-4 py-8">
              {item.description}
            </Markdown>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-theme-border pt-6 pb-2 text-sm text-theme-text-muted">
              {[
                item.severity && (
                  <div key="severity" className="flex items-center gap-2">
                    <span>Severity:</span>
                    <Badge variant={item.severity === "critical" ? "red" : item.severity === "major" ? "orange" : "default"}>
                      {item.severity}
                    </Badge>
                  </div>
                ),
                item.scope && (
                  <div key="scope" className="flex items-center gap-2">
                    <span>Scope:</span>
                    <Badge variant="outline">{item.scope.replace(/_/g, " ")}</Badge>
                  </div>
                ),
                item.category && (
                  <div key="category" className="flex items-center gap-2">
                    <span>Category:</span>
                    <span className="capitalize text-theme-text-dim">{item.category}</span>
                  </div>
                ),
                item.languages.length > 0 && (
                  <div key="languages" className="flex items-center gap-2">
                    <span>Languages:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.languages.map((lang) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                ),
                item.filePatterns.length > 0 && (
                  <div key="filePatterns" className="flex items-center gap-2">
                    <span>File Patterns:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.filePatterns.map((pat) => (
                        <Badge key={pat} variant="outline">{pat}</Badge>
                      ))}
                    </div>
                  </div>
                ),
              ]
                .filter(Boolean)
                .flatMap((el, i, arr) =>
                  i < arr.length - 1
                    ? [el, <span key={`sep-${i}`} className="w-px h-6 bg-border" />]
                    : [el]
                )}
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
              scope: item.scope,
              category: item.category,
              languages: item.languages,
              filePatterns: item.filePatterns,
              references: item.references ?? [],
            }}
            onSaved={fetchItem}
          />

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={(open) => {
              setDeleteOpen(open);
              if (!open) setDeleteError(null);
            }}
            title="Delete Review Checklist"
            description="Are you sure you want to delete this review checklist? All references will also be removed."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={handleDelete}
            isLoading={deleting}
            error={deleteError}
          />
        </>
      )}
    </div>
  );
}
