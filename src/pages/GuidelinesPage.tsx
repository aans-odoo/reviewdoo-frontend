import { useState, useEffect, useRef, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Plus, Pencil, Trash2, Search, X, Check, LoaderCircle, Sparkles, BookOpen } from "lucide-react";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

const SEVERITIES = ["critical", "major", "minor", "suggestion"];

interface Tag {
  id: string;
  name: string;
  _count?: { guidelines: number };
}

interface Guideline {
  id: string;
  content: string;
  severity: string;
  tags: Tag[];
  createdAt: string;
}

export function GuidelinesPage() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTagId, setFilterTagId] = useState<string | null>(null);

  // Create guideline
  const [createOpen, setCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newSeverity, setNewSeverity] = useState("minor");
  const [newTagIds, setNewTagIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Edit guideline
  const [editTarget, setEditTarget] = useState<Guideline | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSeverity, setEditSeverity] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete guideline
  const [deleteTarget, setDeleteTarget] = useState<Guideline | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"none" | "semantic">("none");
  const [searchResults, setSearchResults] = useState<Guideline[]>([]);
  const [searching, setSearching] = useState(false);

  // Tag edit/delete
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [savingTag, setSavingTag] = useState(false);
  const [deleteTagTarget, setDeleteTagTarget] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState(false);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const params = filterTagId ? { tagId: filterTagId } : {};
      const res = await api.get("/guidelines", { params });
      setGuidelines(res.data.guidelines ?? []);
      setError("");
    } catch {
      setError("Failed to load guidelines");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await api.get("/tags");
      setTags(res.data.tags ?? []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (searchMode === "none") {
      fetchGuidelines();
    }
  }, [filterTagId, searchMode]);

  const handleCreateGuideline = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/guidelines", {
        content: newContent,
        severity: newSeverity,
        tagIds: newTagIds,
      });
      setNewContent("");
      setNewSeverity("minor");
      setNewTagIds([]);
      await fetchGuidelines();
      await fetchTags();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to create guideline");
    } finally {
      setCreateOpen(false);
      setCreating(false);
    }
  };

  const openEdit = (g: Guideline) => {
    setEditTarget(g);
    setEditContent(g.content);
    setEditSeverity(g.severity);
    setEditTagIds(g.tags.map((t) => t.id));
  };

  const handleEditGuideline = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      await api.put(`/guidelines/${editTarget.id}`, {
        content: editContent,
        severity: editSeverity,
        tagIds: editTagIds,
      });
      setEditTarget(null);
      await fetchGuidelines();
      await fetchTags();
    } catch {
      setError("Failed to update guideline");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuideline = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/guidelines/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchGuidelines();
      await fetchTags();
    } catch {
      setError("Failed to delete guideline");
    } finally {
      setDeleting(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.post("/guidelines/semantic-search", {
        query: searchQuery,
        tagId: filterTagId ?? undefined,
      });
      setSearchResults(res.data.results ?? []);
      setSearchMode("semantic");
      setError("");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Semantic search failed");
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchMode("none");
    setSearchResults([]);
  };

  const openEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
  };

  const handleEditTag = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editTagName.trim()) return;
    setSavingTag(true);
    try {
      await api.put(`/tags/${editingTag.id}`, { name: editTagName.trim() });
      setEditingTag(null);
      await fetchTags();
      await fetchGuidelines();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to update tag");
    } finally {
      setSavingTag(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteTagTarget) return;
    setDeletingTag(true);
    try {
      await api.delete(`/tags/${deleteTagTarget.id}`);
      setDeleteTagTarget(null);
      if (filterTagId === deleteTagTarget.id) {
        setFilterTagId(null);
      }
      await fetchTags();
      await fetchGuidelines();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to delete tag");
    } finally {
      setDeletingTag(false);
    }
  };

  const displayedGuidelines = searchMode === "semantic" ? searchResults : guidelines;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Guidelines</h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Manage guidelines and classify them with tags.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Guideline
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Input
                placeholder="Semantic search guidelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
                className="pr-20"
              />
              <div className="absolute top-[50%] right-1 translate-y-[-50%]">
                <div className="relative">
                  <Button
                    className="rounded-sm"
                    variant="ghost"
                    onClick={handleSemanticSearch}
                    disabled={searching}
                    title="Semantic search"
                  >
                    {searching
                      ? <LoaderCircle className="h-4 w-4 text-theme-accent animate-spin" />
                      : <Search className="h-4 w-4" />
                    }
                  </Button>
                  {!searching && <Sparkles className="absolute w-3 h-3 text-theme-accent top-1 right-3" />}
                </div>
              </div>
            </div>
            {searchMode === "semantic" && (
              <Button variant="ghost" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
          {/* Tag filter chips */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center transition-all">
              <button
                onClick={() => setFilterTagId(null)}
                className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium transition-colors ${filterTagId === null
                  ? "bg-theme-primary text-white"
                  : "bg-theme-bg-hover text-theme-text-muted hover:bg-theme-bg-hover/80"
                  }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group relative inline-flex items-center"
                >
                  <button
                    onClick={() => setFilterTagId(tag.id === filterTagId ? null : tag.id)}
                    className={`inline-flex items-center rounded-full px-3 py-2 group-hover:pr-16 text-xs font-medium transition-colors ${filterTagId === tag.id
                      ? "bg-theme-primary text-white"
                      : "bg-theme-bg-hover text-theme-text-muted hover:bg-theme-bg-hover/80"
                      }`}
                  >
                    {tag.name}
                    {tag._count && (
                      <span className="ml-1 opacity-70">({tag._count.guidelines})</span>
                    )}
                  </button>
                  {/* Hover actions */}
                  <div className="absolute top-[50%] translate-y-[-50%] right-1 hidden group-hover:flex gap-0.5 bg-theme-bg-elevated border border-border rounded-md shadow-lg py-0.5 px-1">
                    <button
                      onClick={() => openEditTag(tag)}
                      className="p-1 hover:bg-theme-bg-hover rounded transition-colors"
                      title="Edit tag"
                    >
                      <Pencil className="h-3 w-3 text-theme-text-muted" />
                    </button>
                    <button
                      onClick={() => setDeleteTagTarget(tag)}
                      className="p-1 hover:bg-theme-bg-hover rounded transition-colors"
                      title="Delete tag"
                    >
                      <X className="h-3 w-3 text-theme-danger" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
          {error}
        </div>
      )}

      {/* Guidelines list */}
      {loading && searchMode === "none" ? (
        <div className="py-40">
          <LoaderCircle className="animate-spin text-theme-accent mx-auto" />
        </div>
      ) : displayedGuidelines.length === 0 ? (
        <div className="py-40 flex flex-col items-center gap-2 text-theme-text-muted">
          <BookOpen />
          <p className="text-sm">{searchMode === "semantic" ? "No results found." : "No guidelines yet."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchMode === "semantic" && (
            <p className="text-sm text-theme-text-muted">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
            </p>
          )}
          {displayedGuidelines.map((g) => (
            <Card key={g.id}>
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm text-theme-text">{g.content}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={g.severity === "critical" ? "red" : "default"}
                    >
                      {g.severity}
                    </Badge>
                    {g.tags?.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                {searchMode === "none" && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(g)}
                      aria-label="Edit guideline"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteTarget(g)}
                      aria-label="Delete guideline"
                    >
                      <Trash2 className="h-4 w-4 text-theme-danger" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Guideline Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Guideline</DialogTitle>
            <DialogDescription>Add a new guideline with optional tags.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGuideline} className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="g-content">Guideline</Label>
              <Textarea
                id="g-content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                placeholder="Enter the guideline..."
              />
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={newSeverity} onValueChange={setNewSeverity}>
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
              <TagCombobox
                tags={tags}
                selectedIds={newTagIds}
                onChange={setNewTagIds}
                onTagCreated={fetchTags}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Guideline Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guideline</DialogTitle>
            <DialogDescription>Update the guideline.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditGuideline} className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="eg-content">Guideline</Label>
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
              <TagCombobox
                tags={tags}
                selectedIds={editTagIds}
                onChange={setEditTagIds}
                onTagCreated={fetchTags}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>
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
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Guideline"
        description="Delete this guideline? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteGuideline}
        isLoading={deleting}
      />

      {/* Edit Tag Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>Update the tag name.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTag} className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">Tag Name</Label>
              <Input
                id="edit-tag-name"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                required
                placeholder="Enter tag name..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingTag(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingTag || !editTagName.trim()}>
                {savingTag ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Confirmation */}
      <ConfirmDialog
        open={!!deleteTagTarget}
        onOpenChange={(open) => !open && setDeleteTagTarget(null)}
        title="Delete Tag"
        description={
          deleteTagTarget?._count?.guidelines
            ? `Delete "${deleteTagTarget.name}"? This will remove the tag from ${deleteTagTarget._count.guidelines} guideline${deleteTagTarget._count.guidelines !== 1 ? 's' : ''}. Are you sure?`
            : `Delete "${deleteTagTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteTag}
        isLoading={deletingTag}
      />
    </div>
  );
}

/* ─── Tag Combobox ─── */

function TagCombobox({
  tags,
  selectedIds,
  onChange,
  onTagCreated,
}: {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onTagCreated: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedIds.includes(t.id)
  );

  const exactMatch = tags.some(
    (t) => t.name.toLowerCase() === query.trim().toLowerCase()
  );

  const handleSelect = (tagId: string) => {
    onChange([...selectedIds, tagId]);
    setQuery("");
  };

  const handleRemove = (tagId: string) => {
    onChange(selectedIds.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!query.trim() || creatingTag) return;
    setCreatingTag(true);
    try {
      const res = await api.post("/tags", { name: query.trim() });
      const newTag = res.data.tag;
      await onTagCreated();
      onChange([...selectedIds, newTag.id]);
      setQuery("");
    } catch {
      // silent
    } finally {
      setCreatingTag(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));

  return (
    <div ref={containerRef} className="relative">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="gap-1 pr-1">
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-theme-bg-hover"
              aria-label={`Remove ${tag.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Input */}
      <Input
        ref={inputRef}
        placeholder="Search or create tags..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (!exactMatch && query.trim()) {
              handleCreateTag();
            } else if (filtered.length > 0) {
              handleSelect(filtered[0].id);
            }
          }
        }}
      />

      {/* Dropdown */}
      {open && (query || filtered.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-theme-bg-card shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-theme-text hover:bg-theme-bg-hover text-left"
              onClick={() => handleSelect(tag.id)}
            >
              <Check className="h-3.5 w-3.5 opacity-0" />
              {tag.name}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-theme-primary hover:bg-theme-bg-hover text-left font-medium"
              onClick={handleCreateTag}
              disabled={creatingTag}
            >
              <Plus className="h-3.5 w-3.5" />
              {creatingTag ? "Creating..." : `Create "${query.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
