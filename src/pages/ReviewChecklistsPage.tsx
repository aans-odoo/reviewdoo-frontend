import { useState, useEffect, useCallback } from "react";
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
import { DataTable, Column } from "@/components/shared/DataTable";
import { ReviewChecklistFormDialog, ChecklistInitial } from "@/components/checklists/ReviewChecklistFormDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmbeddingModelBanner } from "@/components/shared/EmbeddingModelBanner";
import { useEmbeddingModel } from "@/hooks/useEmbeddingModel";
import { Plus, Search, Sparkles, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";

interface ReviewChecklist {
  id: string;
  description: string;
  severity: string;
  category: string;
  languages: string[];
  filePatterns: string[];
  _count?: { references?: number };
  referenceCount?: number;
  similarityScore?: number;
}

interface PaginatedResponse {
  items: ReviewChecklist[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const SEVERITIES = ["critical", "major", "minor", "suggestion"];
const CATEGORIES = [
  "security", "performance", "readability", "architecture",
  "testing", "error-handling", "accessibility", "other",
];

export function ReviewChecklistsPage() {
  const navigate = useNavigate();
  const { hasEmbeddingModel } = useEmbeddingModel();
  const [items, setItems] = useState<ReviewChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [languageFilter, setLanguageFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"text" | "semantic">("text");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedMode, setAppliedMode] = useState<"text" | "semantic">("text");

  const [createOpen, setCreateOpen] = useState(false);
  const [editInitial, setEditInitial] = useState<ChecklistInitial | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReviewChecklist | null>(null);
  const [deleting, setDeleting] = useState(false);

  const semanticActive = appliedMode === "semantic" && appliedQuery.trim().length > 0;

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, pageSize };
      if (languageFilter) params.language = languageFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (severityFilter) params.severity = severityFilter;
      if (appliedMode === "text" && appliedQuery.trim()) params.search = appliedQuery.trim();

      const res = await api.get("/review-checklists", { params });
      const data: PaginatedResponse = res.data;
      setItems(data.items ?? []);
      setTotalItems(data.total ?? 0);
      setError("");
    } catch {
      setError("Failed to load review checklists");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, languageFilter, categoryFilter, severityFilter, appliedMode, appliedQuery]);

  const fetchSemantic = useCallback(async (query: string) => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await api.post("/review-checklists/semantic-search", {
        query,
        limit: 50,
      });
      const data = res.data.results ?? res.data.items ?? res.data;
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Semantic search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Text/list mode refetches when filters, page, or the applied text query
  // change. Semantic results are fetched explicitly via handleSearch and then
  // filtered client-side, so we skip the list fetch while semantic is active.
  useEffect(() => {
    if (!semanticActive) fetchItems();
  }, [fetchItems, semanticActive]);

  const handleSearch = async () => {
    setPage(1);
    setAppliedMode(searchMode);
    setAppliedQuery(searchQuery);
    if (searchMode === "semantic" && searchQuery.trim()) {
      await fetchSemantic(searchQuery);
    }
    // Text search is handled by the list effect reacting to appliedQuery.
  };

  /** Re-run whichever view is currently active. */
  const refresh = useCallback(() => {
    if (semanticActive) {
      fetchSemantic(appliedQuery);
    } else {
      fetchItems();
    }
  }, [semanticActive, appliedQuery, fetchSemantic, fetchItems]);

  const openEdit = async (checklistId: string) => {
    try {
      const res = await api.get(`/review-checklists/${checklistId}`);
      const data = res.data.item ?? res.data;
      setEditInitial({
        id: data.id,
        description: data.description,
        severity: data.severity,
        category: data.category,
        languages: data.languages ?? [],
        filePatterns: data.filePatterns ?? [],
        references: data.references ?? [],
      });
      setEditOpen(true);
    } catch {
      setError("Failed to load review checklist");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/review-checklists/${deleteTarget.id}`);
      setDeleteTarget(null);
      refresh();
    } catch {
      setError("Failed to delete review checklist");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setLanguageFilter("");
    setCategoryFilter("");
    setSeverityFilter("");
    setSearchQuery("");
    setAppliedQuery("");
    setAppliedMode("text");
    setPage(1);
  };

  const hasActiveFilters =
    !!languageFilter || !!categoryFilter || !!severityFilter || appliedQuery.trim().length > 0;

  // While semantic search is active, apply the structured filters client-side
  // so they stay meaningful against the similarity-ranked results.
  const displayItems = semanticActive
    ? items.filter(
        (it) =>
          (!languageFilter ||
            (it.languages ?? []).some((l) =>
              l.toLowerCase().includes(languageFilter.toLowerCase())
            )) &&
          (!categoryFilter || it.category === categoryFilter) &&
          (!severityFilter || it.severity === severityFilter)
      )
    : items;

  const columns: Column<ReviewChecklist & Record<string, unknown>>[] = [
    {
      key: "description",
      header: "Description",
      className: "max-w-xs",
      render: (row) => (
        <button
          className="text-left text-sm text-theme-text hover:text-theme-primary-light transition-colors"
          onClick={() => navigate(`/review-checklists/${row.id}`)}
        >
          {row.description.length > 100
            ? row.description.slice(0, 100) + "..."
            : row.description}
        </button>
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
      key: "category",
      header: "Category",
      sortable: true,
      render: (row) => <span className="capitalize text-theme-text-muted">{row.category}</span>,
    },
    {
      key: "languages",
      header: "Languages",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.languages ?? []).map((lang) => (
            <Badge key={lang} variant="outline" className="text-xs">
              {lang}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "referenceCount",
      header: "References",
      render: (row) => <span className="text-theme-text-dim">{row._count?.references ?? row.referenceCount ?? 0}</span>,
    },
  ];

  if (semanticActive) {
    columns.push({
      key: "similarityScore",
      header: "Match",
      render: (row) =>
        row.similarityScore != null ? (
          <Badge variant="orange">{Math.round((row.similarityScore as number) * 100)}%</Badge>
        ) : null,
    });
  }

  columns.push({
    key: "actions",
    header: "",
    className: "w-24 text-right",
    render: (row) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => openEdit(row.id)}
          disabled={!hasEmbeddingModel}
          title={hasEmbeddingModel ? "Edit" : "Configure an embedding model first"}
          aria-label="Edit checklist"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setDeleteTarget(row as ReviewChecklist)}
          aria-label="Delete checklist"
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
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Review Checklists</h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Manage your review checklists.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={!hasEmbeddingModel}
          title={hasEmbeddingModel ? undefined : "Configure an embedding model first"}
        >
          <Plus className="mr-1 h-4 w-4" />
          Create Review Checklist
        </Button>
      </div>

      {!hasEmbeddingModel && <EmbeddingModelBanner action="add or search review checklists" />}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Select value={searchMode} onValueChange={(v) => setSearchMode(v as "text" | "semantic")}>
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
                placeholder={searchMode === "semantic" ? "Semantic search checklists..." : "Search checklists by text..."}
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
                    disabled={loading || (searchMode === "semantic" && !hasEmbeddingModel)}
                    title={searchMode === "semantic" ? "Semantic search" : "Text search"}
                  >
                    {loading
                      ? <LoaderCircle className="h-4 w-4 text-theme-accent animate-spin" />
                      : <Search className="h-4 w-4" />}
                  </Button>
                  {searchMode === "semantic" && !loading && (
                    <Sparkles className="absolute w-3 h-3 text-theme-accent top-1 right-3" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Input
                placeholder="e.g. typescript"
                value={languageFilter}
                onChange={(e) => { setLanguageFilter(e.target.value); setPage(1); }}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter || "all"} onValueChange={(v) => { setCategoryFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}><span className="capitalize">{c}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severityFilter || "all"} onValueChange={(v) => { setSeverityFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-theme-text-muted">Loading...</div>
      ) : (
        <>
          {semanticActive && (
            <p className="text-sm text-theme-text-muted">
              {displayItems.length} result{displayItems.length !== 1 ? "s" : ""} ranked by similarity
            </p>
          )}
          <DataTable
            columns={columns}
            data={displayItems as (ReviewChecklist & Record<string, unknown>)[]}
            keyExtractor={(row) => row.id}
            serverSide={!semanticActive}
            pageSize={pageSize}
            {...(semanticActive
              ? {}
              : { currentPage: page, totalItems, onPageChange: setPage })}
            emptyMessage="No review checklists found"
          />
        </>
      )}

      <ReviewChecklistFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        hasEmbeddingModel={hasEmbeddingModel}
        onSaved={() => { setPage(1); fetchItems(); }}
      />

      {editInitial && (
        <ReviewChecklistFormDialog
          open={editOpen}
          onOpenChange={(open) => { setEditOpen(open); if (!open) setEditInitial(null); }}
          mode="edit"
          initial={editInitial}
          hasEmbeddingModel={hasEmbeddingModel}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
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
