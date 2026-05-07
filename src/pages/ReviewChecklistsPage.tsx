import { useState, useEffect, FormEvent, useCallback } from "react";
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
import { DataTable, Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Plus, Search } from "lucide-react";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

interface ReviewChecklist {
  id: string;
  description: string;
  severity: string;
  category: string;
  languages: string[];
  filePatterns: string[];
  source: string;
  _count?: { references?: number };
  referenceCount?: number;
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
const SOURCES = ["extracted", "manual"];

export function ReviewChecklistsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ReviewChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [languageFilter, setLanguageFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"text" | "semantic">("text");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSeverity, setNewSeverity] = useState("minor");
  const [newCategory, setNewCategory] = useState("other");
  const [newLanguages, setNewLanguages] = useState("");
  const [newFilePatterns, setNewFilePatterns] = useState("");
  const [newReferences, setNewReferences] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, pageSize };
      if (languageFilter) params.language = languageFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (severityFilter) params.severity = severityFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (searchQuery && searchMode === "text") params.search = searchQuery;

      const res = await api.get("/review-checklists", { params });
      const data: PaginatedResponse = res.data;
      setItems(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalItems(data.total ?? 0);
      setError("");
    } catch {
      setError("Failed to load review checklists");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, languageFilter, categoryFilter, severityFilter, sourceFilter, searchQuery, searchMode]);

  const fetchSemantic = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const res = await api.post("/review-checklists/semantic-search", {
        query: searchQuery,
        limit: pageSize,
      });
      const data = res.data.results ?? res.data.items ?? res.data;
      setItems(Array.isArray(data) ? data : []);
      setTotalPages(1);
      setTotalItems(Array.isArray(data) ? data.length : 0);
      setError("");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Semantic search failed");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (searchMode === "semantic" && searchQuery.trim()) {
      fetchSemantic();
    } else {
      fetchItems();
    }
  }, [fetchItems, fetchSemantic, searchMode, searchQuery]);

  const handleSearch = () => {
    setPage(1);
    if (searchMode === "semantic" && searchQuery.trim()) {
      fetchSemantic();
    } else {
      fetchItems();
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const languages = newLanguages.split(",").map((l) => l.trim()).filter(Boolean);
      const filePatterns = newFilePatterns.split(",").map((p) => p.trim()).filter(Boolean);
      const references = newReferences.split("\n").map((r) => r.trim()).filter(Boolean).map((url) => ({ url }));

      await api.post("/review-checklists", {
        description: newDescription,
        severity: newSeverity,
        category: newCategory,
        languages,
        filePatterns,
        references: references.length > 0 ? references : undefined,
      });
      setCreateOpen(false);
      resetCreateForm();
      setPage(1);
      await fetchItems();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setCreateError(axErr.response?.data?.error?.message ?? "Failed to create item");
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setNewDescription("");
    setNewSeverity("minor");
    setNewCategory("other");
    setNewLanguages("");
    setNewFilePatterns("");
    setNewReferences("");
    setCreateError("");
  };

  const clearFilters = () => {
    setLanguageFilter("");
    setCategoryFilter("");
    setSeverityFilter("");
    setSourceFilter("");
    setSearchQuery("");
    setPage(1);
  };

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
      key: "source",
      header: "Source",
      sortable: true,
      render: (row) => <span className="capitalize text-theme-text-muted">{row.source}</span>,
    },
    {
      key: "referenceCount",
      header: "References",
      render: (row) => <span className="text-theme-text-dim">{row._count?.references ?? row.referenceCount ?? 0}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Review Checklists</h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Manage your review checklists extracted from PR comments.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Create Review Checklist
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <Label>Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={searchMode === "semantic" ? "Semantic search..." : "Text search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Search Mode</Label>
              <Select value={searchMode} onValueChange={(v) => setSearchMode(v as "text" | "semantic")}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
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
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === "all" ? "" : v); setPage(1); }}>
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
              <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v === "all" ? "" : v); setPage(1); }}>
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
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
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
          <DataTable
            columns={columns}
            data={items as (ReviewChecklist & Record<string, unknown>)[]}
            keyExtractor={(row) => row.id}
            serverSide
            pageSize={pageSize}
            currentPage={page}
            totalItems={totalItems}
            emptyMessage="No review checklists found"
          />
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Review Checklist</DialogTitle>
            <DialogDescription>Add a new review checklist manually.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 p-5">
            {createError && (
              <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
                {createError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="ci-description">Description</Label>
              <Textarea
                id="ci-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
                placeholder="Describe the review checklist..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={newSeverity} onValueChange={setNewSeverity}>
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
                <Select value={newCategory} onValueChange={setNewCategory}>
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
              <Label htmlFor="ci-languages">Languages (comma-separated)</Label>
              <Input id="ci-languages" placeholder="e.g. typescript, javascript" value={newLanguages} onChange={(e) => setNewLanguages(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci-patterns">File Patterns (comma-separated)</Label>
              <Input id="ci-patterns" placeholder="e.g. *.ts, src/**/*.tsx" value={newFilePatterns} onChange={(e) => setNewFilePatterns(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ci-references">References (one URL per line)</Label>
              <Textarea
                id="ci-references"
                className="min-h-[60px]"
                value={newReferences}
                onChange={(e) => setNewReferences(e.target.value)}
                placeholder="https://example.com/pr/123#comment-1"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
