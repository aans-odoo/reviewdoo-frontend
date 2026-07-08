import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Alert } from "@/components/shared/Alert";
import { Loading } from "@/components/shared/Loading";
import { Markdown } from "@/components/shared/Markdown";
import { MarkdownHint } from "@/components/shared/MarkdownHint";
import { ContributionInfo, Contributor } from "@/components/shared/ContributionInfo";
import { MultiSelect, MultiSelectOption } from "@/components/shared/MultiSelect";
import { SimilarityWarningDialog, SimilarItem } from "@/components/shared/SimilarityWarningDialog";
import { useEmbeddingModel } from "@/hooks/useEmbeddingModel";
import { useAuth } from "@/hooks/useAuth";
import { findSimilarGuidelines, aboveThreshold } from "@/lib/similarity";
import { getApiErrorMessage } from "@/lib/errors";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";

const SEVERITIES = ["critical", "major", "minor", "suggestion"];

interface Tag {
  id: string;
  name: string;
}

interface GuidelineDetail {
  id: string;
  content: string;
  severity: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  createdBy?: Contributor | null;
  updatedBy?: Contributor | null;
}

export function GuidelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { hasEmbeddingModel } = useEmbeddingModel(isAuthenticated);

  const [item, setItem] = useState<GuidelineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Authenticated-only state: tags list, edit + delete dialogs, similarity.
  const [tags, setTags] = useState<Tag[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editSeverity, setEditSeverity] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [similar, setSimilar] = useState<SimilarItem[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [pendingSave, setPendingSave] = useState<(() => Promise<void>) | null>(null);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/guidelines/${id}`);
      const data = res.data.guideline ?? res.data;
      setItem(data);
      setError("");
    } catch {
      setError("Failed to load guideline");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await api.get("/tags");
      setTags(res.data.tags ?? []);
    } catch {
      // silent — tags are only needed for editing
    }
  };

  useEffect(() => {
    if (id) fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) fetchTags();
  }, [isAuthenticated]);

  const openEdit = () => {
    if (!item) return;
    setEditContent(item.content);
    setEditSeverity(item.severity);
    setEditTagIds(item.tags.map((t) => t.id));
    setEditOpen(true);
  };

  const doEditGuideline = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await api.put(`/guidelines/${item.id}`, {
        content: editContent,
        severity: editSeverity,
        tagIds: editTagIds,
      });
      setShowSimilar(false);
      setEditOpen(false);
      await fetchItem();
      await fetchTags();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update guideline"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditGuideline = async (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    try {
      const matches = aboveThreshold(await findSimilarGuidelines(editContent, item.id));
      if (matches.length > 0) {
        setSimilar(matches.map((m) => ({ id: m.id, text: m.content, score: m.similarityScore })));
        setPendingSave(() => doEditGuideline);
        setShowSimilar(true);
        setSaving(false);
        return;
      }
      await doEditGuideline();
    } catch {
      setError("Failed to update guideline");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await api.delete(`/guidelines/${item.id}`);
      navigate("/guidelines");
    } catch {
      setError("Failed to delete guideline");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateTagOption = async (name: string): Promise<MultiSelectOption | void> => {
    try {
      const res = await api.post("/tags", { name });
      const newTag = res.data.tag;
      await fetchTags();
      return { value: newTag.id, label: newTag.name };
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create tag"));
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !item) {
    return (
      <div className="space-y-4">
        {isAuthenticated && (
          <Button variant="ghost" onClick={() => navigate("/guidelines")}>
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
          <Button variant="ghost" onClick={() => navigate("/guidelines")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Guidelines
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={openEdit}
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

      {error && <Alert variant="error" onDismiss={() => setError("")}>{error}</Alert>}

      <Card className="overflow-hidden">
        <CardContent className="px-0">
          <div className="flex items-center justify-between px-6 py-3 bg-theme-body/30">
            <p className="text-xs font-medium uppercase tracking-wider text-theme-text-muted">Guideline</p>
            <ContributionInfo
              createdBy={item.createdBy}
              updatedBy={item.updatedBy}
              createdAt={item.createdAt}
              updatedAt={item.updatedAt}
            />
          </div>

          <div className="px-6 pt-4">
            <Markdown className="text-base leading-relaxed text-theme-text px-4 py-8">
              {item.content}
            </Markdown>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-theme-border pt-6 pb-2 text-sm text-theme-text-muted">
              <div className="flex items-center gap-2">
                <span>Severity:</span>
                <Badge
                  variant={item.severity === "critical" ? "red" : item.severity === "major" ? "orange" : "default"}
                >
                  {item.severity}
                </Badge>
              </div>

              <span className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <span>Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {item.tags.length > 0 ? (
                    item.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAuthenticated && (
        <>
          {/* Edit Guideline Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Guideline</DialogTitle>
                <DialogDescription>Update the guideline.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditGuideline} className="space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="eg-content">Guideline</Label>
                    <MarkdownHint />
                  </div>
                  <Textarea
                    id="eg-content"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={editSeverity} onValueChange={setEditSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="capitalize">{s}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <MultiSelect
                    options={tags.map((t) => ({ value: t.id, label: t.name }))}
                    selected={editTagIds}
                    onChange={setEditTagIds}
                    placeholder="Select or create tags..."
                    onCreate={handleCreateTagOption}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete Guideline"
            description="Delete this guideline? This action cannot be undone."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={handleDelete}
            isLoading={deleting}
          />

          <SimilarityWarningDialog
            open={showSimilar}
            onOpenChange={setShowSimilar}
            items={similar}
            heading="Similar guideline already exists"
            description="One or more existing guidelines look very similar. Are you sure you want to save this one anyway?"
            onConfirm={() => { if (pendingSave) pendingSave(); }}
            confirmLabel="Save anyway"
            busy={saving}
          />
        </>
      )}
    </div>
  );
}
