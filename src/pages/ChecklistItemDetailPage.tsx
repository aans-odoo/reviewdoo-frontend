import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ArrowLeft, Pencil, Trash2, Plus, X } from "lucide-react";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

const SEVERITIES = ["critical", "major", "minor", "suggestion"];
const CATEGORIES = [
  "security", "performance", "readability", "architecture",
  "testing", "error-handling", "accessibility", "other",
];

interface Reference {
  id: string;
  url: string;
  commentBody?: string;
  authorUsername?: string;
  platform?: string;
  createdAt?: string;
}

interface ChecklistItemDetail {
  id: string;
  description: string;
  severity: string;
  category: string;
  languages: string[];
  filePatterns: string[];
  source: string;
  references: Reference[];
  createdAt: string;
  updatedAt: string;
}

export function ChecklistItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ChecklistItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editSeverity, setEditSeverity] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLanguages, setEditLanguages] = useState("");
  const [editFilePatterns, setEditFilePatterns] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [newRefUrl, setNewRefUrl] = useState("");
  const [addingRef, setAddingRef] = useState(false);

  const [deleteRefTarget, setDeleteRefTarget] = useState<Reference | null>(null);
  const [deletingRef, setDeletingRef] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/checklist-items/${id}`);
      const data = res.data.item ?? res.data;
      setItem(data);
      setError("");
    } catch {
      setError("Failed to load checklist item");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const startEdit = () => {
    if (!item) return;
    setEditDescription(item.description);
    setEditSeverity(item.severity);
    setEditCategory(item.category);
    setEditLanguages(item.languages.join(", "));
    setEditFilePatterns(item.filePatterns.join(", "));
    setEditing(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/checklist-items/${id}`, {
        description: editDescription,
        severity: editSeverity,
        category: editCategory,
        languages: editLanguages.split(",").map((l) => l.trim()).filter(Boolean),
        filePatterns: editFilePatterns.split(",").map((p) => p.trim()).filter(Boolean),
      });
      setEditing(false);
      await fetchItem();
    } catch {
      setError("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/checklist-items/${id}`);
      navigate("/checklist-items");
    } catch {
      setError("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddRef = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRefUrl.trim()) return;
    setAddingRef(true);
    try {
      await api.post(`/checklist-items/${id}/references`, { url: newRefUrl.trim() });
      setNewRefUrl("");
      await fetchItem();
    } catch {
      setError("Failed to add reference");
    } finally {
      setAddingRef(false);
    }
  };

  const handleDeleteRef = async () => {
    if (!deleteRefTarget) return;
    setDeletingRef(true);
    try {
      await api.delete(`/checklist-items/${id}/references/${deleteRefTarget.id}`);
      setDeleteRefTarget(null);
      await fetchItem();
    } catch {
      setError("Failed to remove reference");
    } finally {
      setDeletingRef(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-sm text-theme-text-muted">Loading...</div>;
  }

  if (error && !item) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/checklist-items")}>
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
        <Button variant="ghost" onClick={() => navigate("/checklist-items")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Checklist Items
        </Button>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
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
          <CardTitle>Checklist Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={editSeverity} onValueChange={setEditSeverity}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((s) => (
                        <SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}><span className="capitalize">{c}</span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-langs">Languages (comma-separated)</Label>
                <Input id="edit-langs" value={editLanguages} onChange={(e) => setEditLanguages(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-patterns">File Patterns (comma-separated)</Label>
                <Input id="edit-patterns" value={editFilePatterns} onChange={(e) => setEditFilePatterns(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
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
                  <p className="text-[13px] font-medium text-theme-text-muted">Source</p>
                  <p className="mt-1 capitalize text-theme-text">{item.source}</p>
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>References ({item.references?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddRef} className="flex gap-2">
            <Input
              placeholder="Add reference URL..."
              value={newRefUrl}
              onChange={(e) => setNewRefUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={addingRef} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              {addingRef ? "Adding..." : "Add"}
            </Button>
          </form>
          {item.references && item.references.length > 0 ? (
            <ul className="space-y-2">
              {item.references.map((ref) => (
                <li key={ref.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-theme-primary-light hover:text-theme-primary break-all"
                    >
                      {ref.url}
                    </a>
                    {ref.authorUsername && (
                      <p className="mt-0.5 text-xs text-theme-text-dim">
                        by {ref.authorUsername} on {ref.platform}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => setDeleteRefTarget(ref)}
                    aria-label="Remove reference"
                  >
                    <X className="h-4 w-4 text-theme-danger" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-theme-text-muted">No references yet.</p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Checklist Item"
        description="Are you sure you want to delete this checklist item? All references will also be removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <ConfirmDialog
        open={!!deleteRefTarget}
        onOpenChange={(open) => !open && setDeleteRefTarget(null)}
        title="Remove Reference"
        description="Are you sure you want to remove this reference?"
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDeleteRef}
        isLoading={deletingRef}
      />
    </div>
  );
}
