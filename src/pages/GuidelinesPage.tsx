import { useState, useEffect, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import { Alert } from "@/components/shared/Alert";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Plus, Pencil, Trash2, Search, X, LoaderCircle, Sparkles, Download, Upload } from "lucide-react";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect, MultiSelectOption } from "@/components/shared/MultiSelect";
import { SimilarityWarningDialog, SimilarItem } from "@/components/shared/SimilarityWarningDialog";
import { EmbeddingModelBanner } from "@/components/shared/EmbeddingModelBanner";
import { Loading } from "@/components/shared/Loading";
import { Markdown } from "@/components/shared/Markdown";
import { MarkdownHint } from "@/components/shared/MarkdownHint";
import { useEmbeddingModel } from "@/hooks/useEmbeddingModel";
import { useAuth } from "@/hooks/useAuth";
import { findSimilarGuidelines, aboveThreshold } from "@/lib/similarity";
import { getApiErrorMessage } from "@/lib/errors";

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
  similarityScore?: number;
}

export function GuidelinesPage() {
  const navigate = useNavigate();
  const { hasEmbeddingModel } = useEmbeddingModel();
  const { isAdmin } = useAuth();
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTagId, setFilterTagId] = useState<string | null>(null);

  // Similarity / duplicate warning
  const [similar, setSimilar] = useState<SimilarItem[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [pendingSave, setPendingSave] = useState<(() => Promise<void>) | null>(null);

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
  const [searchType, setSearchType] = useState<"text" | "semantic">("text");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedType, setAppliedType] = useState<"text" | "semantic">("text");
  const [searchResults, setSearchResults] = useState<Guideline[]>([]);
  const [searching, setSearching] = useState(false);

  const searchActive = appliedQuery.trim().length > 0;
  const semanticActive = appliedType === "semantic" && searchActive;

  // Tag edit/delete
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [savingTag, setSavingTag] = useState(false);
  const [deleteTagTarget, setDeleteTagTarget] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState(false);

  // Import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: Array<{ index: number; content: string; error: string }>; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterTagId) params.tagId = filterTagId;
      if (appliedType === "text" && appliedQuery.trim()) params.search = appliedQuery.trim();
      const res = await api.get("/guidelines", { params });
      setGuidelines(res.data.guidelines ?? []);
      setError("");
    } catch {
      setError("Failed to load guidelines");
    } finally {
      setLoading(false);
    }
  };

  /** Re-run whichever view is currently active (list/text search or semantic). */
  const refresh = async () => {
    if (semanticActive) {
      await runSemanticSearch(appliedQuery);
    } else {
      await fetchGuidelines();
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
    if (!semanticActive) {
      fetchGuidelines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTagId, appliedType, appliedQuery]);

  const doCreateGuideline = async () => {
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
      setShowSimilar(false);
      setCreateOpen(false);
      await refresh();
      await fetchTags();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create guideline"));
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGuideline = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const matches = aboveThreshold(await findSimilarGuidelines(newContent));
      if (matches.length > 0) {
        setSimilar(matches.map((m) => ({ id: m.id, text: m.content, score: m.similarityScore })));
        setPendingSave(() => doCreateGuideline);
        setShowSimilar(true);
        setCreating(false);
        return;
      }
      await doCreateGuideline();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create guideline"));
      setCreating(false);
    }
  };

  const openEdit = (g: Guideline) => {
    setEditTarget(g);
    setEditContent(g.content);
    setEditSeverity(g.severity);
    setEditTagIds(g.tags.map((t) => t.id));
  };

  const doEditGuideline = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await api.put(`/guidelines/${editTarget.id}`, {
        content: editContent,
        severity: editSeverity,
        tagIds: editTagIds,
      });
      setShowSimilar(false);
      setEditTarget(null);
      await refresh();
      await fetchTags();
    } catch {
      setError("Failed to update guideline");
    } finally {
      setSaving(false);
    }
  };

  const handleEditGuideline = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      const matches = aboveThreshold(await findSimilarGuidelines(editContent, editTarget.id));
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

  const handleDeleteGuideline = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/guidelines/${deleteTarget.id}`);
      setDeleteTarget(null);
      await refresh();
      await fetchTags();
    } catch {
      setError("Failed to delete guideline");
    } finally {
      setDeleting(false);
    }
  };

  const runSemanticSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await api.post("/guidelines/semantic-search", {
        query,
      });
      setSearchResults(res.data.results ?? []);
      setError("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Semantic search failed"));
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    setAppliedType(searchType);
    setAppliedQuery(searchQuery);
    if (searchType === "semantic") {
      if (q) {
        await runSemanticSearch(q);
      } else {
        setSearchResults([]);
      }
    }
    // Text search is handled by the list effect reacting to appliedQuery.
  };

  const clearSearch = () => {
    setSearchQuery("");
    setAppliedQuery("");
    setSearchResults([]);
  };

  const openEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
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

  const handleEditTag = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editTagName.trim()) return;
    setSavingTag(true);
    try {
      await api.put(`/tags/${editingTag.id}`, { name: editTagName.trim() });
      setEditingTag(null);
      await fetchTags();
      await refresh();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update tag"));
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
      await refresh();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete tag"));
    } finally {
      setDeletingTag(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/guidelines/export");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guidelines-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export guidelines");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const guidelines = parsed.guidelines ?? parsed;

      if (!Array.isArray(guidelines)) {
        setError("Invalid import file: expected a JSON with a 'guidelines' array");
        return;
      }

      const res = await api.post("/guidelines/import", { guidelines, skipDuplicates: true });
      setImportResult(res.data);
      await refresh();
      await fetchTags();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to import guidelines"));
    } finally {
      setImporting(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredSearchResults = filterTagId
    ? searchResults.filter((g) => g.tags?.some((t) => t.id === filterTagId))
    : searchResults;

  const displayedGuidelines = semanticActive ? filteredSearchResults : guidelines;

  // When semantic search is active, derive per-tag counts from the unfiltered
  // search results so the chip counts always reflect what the user can actually
  // see. Tags with zero matches in the current results are hidden.
  const searchResultTagCounts = (() => {
    if (!semanticActive) return null;
    const counts = new Map<string, number>();
    for (const g of searchResults) {
      for (const t of g.tags ?? []) {
        counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
      }
    }
    return counts;
  })();

  const visibleTags = searchResultTagCounts
    ? tags.filter(
        (t) =>
          (searchResultTagCounts.get(t.id) ?? 0) > 0 || t.id === filterTagId,
      )
    : tags;

  // Disable mutating / conflicting actions while a long-running op is in flight.
  const isBusy = searching || importing;

  const guidelineColumns: Column<Guideline & Record<string, unknown>>[] = [
    {
      key: "content",
      header: "Guideline",
      className: "max-w-md align-top",
      render: (row) => (
        <div
          className="cursor-pointer transition-colors hover:text-theme-primary-light"
          onClick={() => navigate(`/guidelines/${row.id}`)}
        >
          <Markdown className="max-w-md">{row.content}</Markdown>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (row) => (
        <Badge variant={row.severity === "critical" ? "red" : row.severity === "major" ? "orange" : "default"}>
          {row.severity}
        </Badge>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags?.map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  if (semanticActive) {
    guidelineColumns.push({
      key: "similarityScore",
      header: "Match",
      render: (row) =>
        row.similarityScore != null ? (
          <Badge variant="orange">{Math.round((row.similarityScore as number) * 100)}%</Badge>
        ) : null,
    });
  }

  guidelineColumns.push({
    key: "actions",
    header: "",
    className: "w-24 text-right",
    render: (row) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => openEdit(row as Guideline)}
          disabled={isBusy || !hasEmbeddingModel}
          title={hasEmbeddingModel ? "Edit" : "Configure an embedding model first"}
          aria-label="Edit guideline"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setDeleteTarget(row as Guideline)}
          disabled={isBusy}
          aria-label="Delete guideline"
        >
          <Trash2 className="h-4 w-4 text-theme-danger" />
        </Button>
      </div>
    ),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Guidelines</h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Manage guidelines and classify them with tags.
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={handleExport} disabled={isBusy}>
                <Upload className="h-4 w-4" /> Export
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
              >
                {importing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {importing ? "Importing..." : "Import"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
            </>
          )}
          <Button onClick={() => setCreateOpen(true)} disabled={isBusy || !hasEmbeddingModel} title={hasEmbeddingModel ? undefined : "Configure an embedding model first"}>
            <Plus className="h-4 w-4" /> New Guideline
          </Button>
        </div>
      </div>

      {!hasEmbeddingModel && <EmbeddingModelBanner entity="guidelines" searchType={searchType} />}

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Select value={searchType} onValueChange={(v) => setSearchType(v as "text" | "semantic")}>
              <SelectTrigger className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="semantic">Semantic</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full">
              <Input
                placeholder={searchType === "semantic" ? "Semantic search guidelines..." : "Search guidelines by text..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pr-20"
              />
              <div className="absolute top-[50%] right-1 translate-y-[-50%]">
                <div className="relative">
                  <Button
                    className="rounded-sm"
                    variant="ghost"
                    onClick={handleSearch}
                    disabled={searching || (searchType === "semantic" && !hasEmbeddingModel)}
                    title={
                      searchType === "semantic" && !hasEmbeddingModel
                        ? "An active embedding model is required for semantic search"
                        : searchType === "semantic"
                          ? "Semantic search"
                          : "Text search"
                    }
                  >
                    {searching
                      ? <LoaderCircle className="h-4 w-4 text-theme-accent animate-spin" />
                      : <Search className="h-4 w-4" />
                    }
                  </Button>
                  {searchType === "semantic" && !searching && <Sparkles className="absolute w-3 h-3 text-theme-accent top-1 right-3" />}
                </div>
              </div>
            </div>
            {searchActive && (
              <Button variant="ghost" onClick={clearSearch} disabled={isBusy}>
                Clear
              </Button>
            )}
          </div>
          {/* Tag filter chips */}
          {visibleTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center transition-all">
              <button
                onClick={() => setFilterTagId(null)}
                disabled={isBusy}
                className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${filterTagId === null
                  ? "bg-theme-primary text-white"
                  : "bg-theme-bg-hover text-theme-text-muted hover:bg-theme-bg-hover/80"
                  }`}
              >
                All
              </button>
              {visibleTags.map((tag) => {
                const count = searchResultTagCounts
                  ? searchResultTagCounts.get(tag.id) ?? 0
                  : tag._count?.guidelines;
                return (
                <div
                  key={tag.id}
                  className="group relative inline-flex items-center"
                >
                  <button
                    onClick={() => setFilterTagId(tag.id === filterTagId ? null : tag.id)}
                    disabled={isBusy}
                    className={`inline-flex items-center rounded-full px-3 py-2 group-hover:pr-16 group-focus-within:pr-16 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:group-hover:pr-3 ${filterTagId === tag.id
                      ? "bg-theme-primary text-white"
                      : "bg-theme-bg-hover text-theme-text-muted hover:bg-theme-bg-hover/80"
                      }`}
                  >
                    {tag.name}
                    {count !== undefined && (
                      <span className="ml-1 opacity-70">({count})</span>
                    )}
                  </button>
                  {/* Edit / delete actions — revealed on hover or keyboard focus
                      so they're reachable without a mouse. */}
                  {!isBusy && (
                    <div className="absolute top-[50%] translate-y-[-50%] right-1 hidden group-hover:flex group-focus-within:flex gap-0.5 bg-theme-bg-elevated border border-border rounded-md shadow-lg py-0.5 px-1">
                      <button
                        onClick={() => openEditTag(tag)}
                        className="p-1 hover:bg-theme-bg-hover rounded transition-colors"
                        title={`Edit tag ${tag.name}`}
                        aria-label={`Edit tag ${tag.name}`}
                      >
                        <Pencil className="h-3 w-3 text-theme-text-muted" />
                      </button>
                      <button
                        onClick={() => setDeleteTagTarget(tag)}
                        className="p-1 hover:bg-theme-bg-hover rounded transition-colors"
                        title={`Delete tag ${tag.name}`}
                        aria-label={`Delete tag ${tag.name}`}
                      >
                        <X className="h-3 w-3 text-theme-danger" />
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="error" onDismiss={() => setError("")}>{error}</Alert>
      )}

      {importResult && (
        <Alert variant="success" onDismiss={() => setImportResult(null)}>
          <p>
            Import complete: {importResult.imported} imported, {importResult.skipped} skipped (duplicates)
            {importResult.errors.length > 0 && `, ${importResult.errors.length} failed`}
          </p>
          {importResult.errors.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-xs">
              {importResult.errors.slice(0, 5).map((e, i) => (
                <li key={i}>#{e.index}: {e.content}... — {e.error}</li>
              ))}
              {importResult.errors.length > 5 && <li>...and {importResult.errors.length - 5} more</li>}
            </ul>
          )}
        </Alert>
      )}

      {/* Guidelines list */}
      {loading || searching ? (
        <Loading />
      ) : (
        <div className="space-y-3">
          {searchActive && (
            <p className="text-sm text-theme-text-muted">
              {displayedGuidelines.length} result{displayedGuidelines.length !== 1 ? "s" : ""} found
              {semanticActive && filterTagId && searchResults.length !== filteredSearchResults.length
                ? ` (filtered from ${searchResults.length})`
                : ""}
            </p>
          )}
          <DataTable
            key={`${appliedType}-${appliedQuery}-${filterTagId ?? "all"}`}
            columns={guidelineColumns}
            data={displayedGuidelines as (Guideline & Record<string, unknown>)[]}
            keyExtractor={(row) => row.id}
            pageSize={10}
            emptyMessage={searchActive ? "No results found." : "No guidelines yet."}
          />
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
              <div className="flex items-center justify-between">
                <Label htmlFor="g-content">Guideline</Label>
                <MarkdownHint />
              </div>
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
              <MultiSelect
                options={tags.map((t) => ({ value: t.id, label: t.name }))}
                selected={newTagIds}
                onChange={setNewTagIds}
                placeholder="Select or create tags..."
                onCreate={handleCreateTagOption}
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

      <SimilarityWarningDialog
        open={showSimilar}
        onOpenChange={setShowSimilar}
        items={similar}
        heading="Similar guideline already exists"
        description="One or more existing guidelines look very similar. Are you sure you want to save this one anyway?"
        onConfirm={() => { if (pendingSave) pendingSave(); }}
        confirmLabel="Save anyway"
        busy={creating || saving}
      />
    </div>
  );
}


