import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownField } from "@/components/shared/MarkdownPreviewToggle";
import { ChipInput } from "@/components/shared/ChipInput";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { ReferenceInput, ReferenceDraft } from "@/components/shared/ReferenceInput";
import { CategorySelect } from "@/components/categories/CategorySelect";
import { SimilarityWarningDialog, SimilarItem } from "@/components/shared/SimilarityWarningDialog";
import { findSimilarChecklists, aboveThreshold } from "@/lib/similarity";
import {
  LANGUAGE_OPTIONS,
  SCOPE_USES_FILES,
  describeApplicability,
} from "@/lib/checklistApplicability";
import { validateVersionRange } from "@/lib/checklistVersions";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/shared/Alert";
import { cn } from "@/lib/utils";
import { FileCode, MessageSquare, GitCommit, Globe, Info, AlertTriangle, type LucideIcon } from "lucide-react";

const SEVERITIES = ["critical", "major", "minor", "suggestion"];

function arraysEqual(a: unknown[], b: unknown[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
  }
  return true;
}

// Scope drives how `get_review_checklists` matches this item to a diff, so it
// is the first thing a contributor picks. Order: file-based scopes first, then
// the file-independent contexts.
const SCOPE_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "code", label: "Code", icon: FileCode },
  { value: "comment", label: "Comment", icon: MessageSquare },
  { value: "commit_message", label: "Commit", icon: GitCommit },
  { value: "general", label: "General", icon: Globe },
];

export interface ChecklistInitial {
  id: string;
  description: string;
  severity: string;
  scope?: string;
  category: string | null;
  languages: string[];
  filePatterns: string[];
  minVersion?: string | null;
  maxVersion?: string | null;
  references: { id: string; url: string; description?: string }[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: ChecklistInitial;
  /** True when the key pool has an active key; otherwise the duplicate check is skipped silently. */
  similarityCheckEnabled: boolean;
  onSaved: () => void;
}

export function ReviewChecklistFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  similarityCheckEnabled,
  onSaved,
}: Props) {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [scope, setScope] = useState("general");
  const [category, setCategory] = useState("other");
  const [languages, setLanguages] = useState<string[]>([]);
  const [filePatterns, setFilePatterns] = useState<string[]>([]);
  const [versionMode, setVersionMode] = useState("all");
  const [fromVersion, setFromVersion] = useState("");
  const [toVersion, setToVersion] = useState("");
  const minVersion = versionMode === "from" || versionMode === "between" ? fromVersion.trim() : null;
  const maxVersion = versionMode === "to" || versionMode === "between" ? toVersion.trim() : null;
  const versionError = validateVersionRange({ minVersion, maxVersion });
  const versionInvalid = versionError !== null;
  const [references, setReferences] = useState<ReferenceDraft[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [similar, setSimilar] = useState<SimilarItem[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  // Small muted note shown when the duplicate check failed and we saved anyway.
  const [similarityNote, setSimilarityNote] = useState("");
  const [pulse, setPulse] = useState(false);

  // Reset fields whenever the dialog (re)opens or targets a different item.
  useEffect(() => {
    if (!open) return;
    setDescription(initial?.description ?? "");
    setSeverity(initial?.severity ?? "minor");
    setScope(initial?.scope ?? "general");
    setCategory(initial?.category ?? (mode === "create" ? "other" : ""));
    setLanguages(initial?.languages ?? []);
    setFilePatterns(initial?.filePatterns ?? []);
    setReferences(initial?.references ?? []);
    setVersionMode(initial?.minVersion != null ? (initial.maxVersion != null ? "between" : "from") : initial?.maxVersion != null ? "to" : "all");
    setFromVersion(initial?.minVersion?.toString() ?? "");
    setToVersion(initial?.maxVersion?.toString() ?? "");
    setError("");
    setShowSimilar(false);
    setSimilar([]);
    setSimilarityNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);

  const persist = async () => {
    // File scoping applies to `code` and `comment` items (comment/docstring
    // conventions can be language-specific); `commit_message` and `general`
    // always surface regardless of files, so we don't persist stale
    // langs/patterns for them.
    const usesFiles = SCOPE_USES_FILES.has(scope);
    const scopedLanguages = usesFiles ? languages : [];
    const scopedFilePatterns = usesFiles ? filePatterns : [];
    if (mode === "create") {
      await api.post("/review-checklists", {
        description,
        severity,
        scope,
        category: category || null,
        languages: scopedLanguages,
        filePatterns: scopedFilePatterns,
        minVersion,
        maxVersion,
        references: references.length > 0
          ? references.map((r) => ({ url: r.url, description: r.description }))
          : undefined,
      });
    } else if (initial) {
      await api.put(`/review-checklists/${initial.id}`, {
        description,
        severity,
        scope,
        category: category || null,
        languages: scopedLanguages,
        filePatterns: scopedFilePatterns,
        minVersion,
        maxVersion,
      });
      // Diff references against the originals.
      const original = initial.references;
      const toRemove = original.filter((o) => !references.some((r) => r.id === o.id));
      const toAdd = references.filter((r) => !r.id);
      for (const r of toRemove) {
        await api.delete(`/review-checklists/${initial.id}/references/${r.id}`);
      }
      for (const r of toAdd) {
        await api.post(`/review-checklists/${initial.id}/references`, {
          url: r.url,
          description: r.description,
        });
      }
    }
  };

  const doSave = async () => {
    setSaving(true);
    setError("");
    try {
      await persist();
      setShowSimilar(false);
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save review checklist"));
      setShowSimilar(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (versionInvalid) return;
    setSaving(true);
    setError("");
    setSimilarityNote("");
    // Without an active key the duplicate check is skipped silently (no
    // dialog, no notice) and the item is saved directly.
    if (similarityCheckEnabled) {
      let dupes: Awaited<ReturnType<typeof findSimilarChecklists>> = [];
      try {
        const matches = await findSimilarChecklists(description, mode === "edit" ? initial?.id : undefined);
        // Matches are sorted by descending score; keep those >= 0.70, at most 5.
        dupes = aboveThreshold(matches).slice(0, 5);
      } catch {
        // The duplicate check is best effort: note it and save anyway,
        // keeping every entered value.
        setSimilarityNote("Duplicate check skipped.");
      }
      if (dupes.length > 0) {
        setSimilar(
          dupes.map((m) => ({
            id: m.id,
            text: m.description,
            score: m.similarityScore,
            href: `/review-checklists/${m.id}`,
          }))
        );
        setShowSimilar(true);
        setSaving(false);
        return;
      }
    }
    await doSave();
  };

  // Attach the entered references to an existing (similar) checklist instead of
  // creating a duplicate. Only offered in create mode when references exist.
  const attachToExisting = async (item: SimilarItem) => {
    setSaving(true);
    setError("");
    try {
      const toAdd = references.filter((r) => !r.id);
      for (const r of toAdd) {
        await api.post(`/review-checklists/${item.id}/references`, {
          url: r.url,
          description: r.description,
        });
      }
      setShowSimilar(false);
      onOpenChange(false);
      onSaved();
      navigate(`/review-checklists/${item.id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to attach references"));
    } finally {
      setSaving(false);
    }
  };

  const canAttach = mode === "create" && references.filter((r) => !r.id).length > 0;

  const applicability = describeApplicability(scope, languages, filePatterns, versionInvalid ? null : minVersion, versionInvalid ? null : maxVersion);
  const codeMissingLanguage = scope === "code" && languages.length === 0;

  const baseCategory = initial?.category ?? (mode === "create" ? "other" : "");
  const baseDescription = initial?.description ?? "";
  const baseSeverity = initial?.severity ?? "minor";
  const baseScope = initial?.scope ?? "general";
  const baseLanguages = initial?.languages ?? [];
  const baseFilePatterns = initial?.filePatterns ?? [];
  const baseReferences = initial?.references ?? [];

  const dirty =
    minVersion !== (initial?.minVersion ?? null) ||
    maxVersion !== (initial?.maxVersion ?? null) ||
    description !== baseDescription ||
    severity !== baseSeverity ||
    scope !== baseScope ||
    category !== baseCategory ||
    !arraysEqual(languages, baseLanguages) ||
    !arraysEqual(filePatterns, baseFilePatterns) ||
    !arraysEqual(references, baseReferences);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "w-[600px] max-w-[95vw] max-h-[95vh] overflow-y-auto gap-0",
            pulse ? "translate-y-[-51%]" : ""
          )}
          onInteractOutside={(e) => {
            if (dirty) {
              e.preventDefault();
              setPulse(true);
              const currentDialogEl = document.querySelector<HTMLElement>("[role='dialog'][data-state='open']");
              const currentDialogCloseBtnEl = currentDialogEl?.querySelector<HTMLElement>("[data-label='Close Dialog']")
              if (currentDialogEl && currentDialogCloseBtnEl) {
                currentDialogCloseBtnEl.scrollIntoView({behavior: "smooth"})
                requestAnimationFrame(() => {
                  currentDialogCloseBtnEl.focus();
                });
              }
              setTimeout(() => setPulse(false), 1000);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">{mode === "create" ? "Create Review Checklist" : "Edit Review Checklist"} <span className={`text-xs font-normal inline-flex self-end justify-end text-yellow-500 transition-opacity ${pulse ? "opacity-1" : "opacity-0"}`}>Unsaved changes</span></DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new review checklist manually."
                : "Update this review checklist."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="relative min-w-0 space-y-4 p-5 pt-8">
            {error && (
              <Alert variant="error">{error}</Alert>
            )}
            <MarkdownField label="Description *" htmlFor="cf-description" value={description}>
              <Textarea
                id="cf-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the review checklist..."
              />
            </MarkdownField>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select value={severity} onValueChange={setSeverity}>
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
                <CategorySelect value={category} onValueChange={setCategory} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Where it applies *</Label>
              <div className="rounded-lg py-5 px-6 border space-y-6">
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {SCOPE_OPTIONS.map((s) => {
                      const Icon = s.icon;
                      const active = scope === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setScope(s.value)}
                          aria-pressed={active}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-xs font-medium transition-colors",
                            active
                              ? "border-theme-primary bg-theme-primary/10 text-theme-text"
                              : "border-border text-theme-text-muted hover:bg-theme-bg-hover"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {SCOPE_USES_FILES.has(scope) && (
                  <div className="grid grid-cols-5 gap-3">
                    <div className="flex flex-col justify-between gap-2 col-span-2">
                      <Label htmlFor="cf-languages">
                        Languages{scope === "code" && " *"}
                      </Label>
                      <MultiSelect
                        options={LANGUAGE_OPTIONS}
                        selected={languages}
                        onChange={setLanguages}
                        placeholder={scope === "code" ? "Select language(s)" : "Any language"}
                        containerClasses="h-full"
                        selectClasses="h-full"
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-2  col-span-3">
                      <Label htmlFor="cf-patterns">Only these files</Label>
                      <ChipInput
                        id="cf-patterns"
                        values={filePatterns}
                        onChange={setFilePatterns}
                        placeholder="e.g. *_plugin.js, interaction/**"
                        containerClasses="flex flex-col grow transition-all"
                        inputClasses="grow"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <datalist id="odoo-version-examples">
                    {["18.0", "19.0", "saas-19.1", "saas-19.2", "20.0", "master"].map(v => <option key={v} value={v} />)}
                  </datalist>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cf-version-mode">Version scope</Label>
                    <Select value={versionMode} onValueChange={setVersionMode}>
                      <SelectTrigger id="cf-version-mode"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All versions</SelectItem>
                        <SelectItem value="from">From a version</SelectItem>
                        <SelectItem value="to">Up to a version</SelectItem>
                        <SelectItem value="between">Between versions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {versionMode !== "all" && (
                    <>
                      <div className="flex gap-3 pl-8 relative before:absolute before:w-5 before:h-12 before:rounded-bl-sm before:border-l-2 before:border-b-2 before:border-border-light before:left-1 focus-within:before:border-primary/20 before:transition-all">
                        {(versionMode === "from" || versionMode === "between") && (
                          <div className="flex-1 space-y-1">
                            <Label htmlFor="cf-version-from">From (inclusive)</Label>
                            <Input id="cf-version-from" type="text" list="odoo-version-examples" required placeholder="e.g. 19.0" value={fromVersion} onChange={e => setFromVersion(e.target.value)} />
                          </div>
                        )}
                        {(versionMode === "to" || versionMode === "between") && (
                          <div className="flex-1 space-y-1">
                            <Label htmlFor="cf-version-to">Up to (inclusive)</Label>
                            <Input id="cf-version-to" type="text" list="odoo-version-examples" required placeholder="e.g. saas-19.2" value={toVersion} onChange={e => setToVersion(e.target.value)} />
                          </div>
                        )}
                      </div>
                      {versionInvalid && <p className="text-xs text-theme-danger bg-theme-danger/10 py-2 px-3 rounded-sm" role="status">{versionError}</p>}
                    </>
                  )}
                </div>

                {!versionInvalid &&
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-md px-3 py-2 text-xs !mt-6",
                      applicability.tone === "warn"
                        ? "bg-theme-cyan/5 text-theme-cyan/80"
                        : "bg-theme-success/10 text-theme-success"
                    )}
                  >
                    {applicability.tone === "warn" ? (
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{applicability.text}</span>
                  </div>
                }
              </div>
            </div>

            <div className="space-y-2">
              <Label>References</Label>
              <ReferenceInput values={references} onChange={setReferences} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !description.trim() || codeMissingLanguage || versionInvalid}>
                {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
            {similarityNote && (
              <p className="text-right text-xs text-theme-text-muted" role="status">
                {similarityNote}
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog >

      <SimilarityWarningDialog
        open={showSimilar}
        onOpenChange={setShowSimilar}
        items={similar}
        heading="Similar checklist already exists"
        description={
          canAttach
            ? "One or more existing checklists look very similar. You can attach your references to an existing one instead of creating a duplicate, or create a new checklist anyway."
            : "One or more existing checklists look very similar. Are you sure you want to save this one anyway?"
        }
        onConfirm={doSave}
        confirmLabel={mode === "create" ? "Create anyway" : "Save anyway"}
        busy={saving}
        onAttach={canAttach ? attachToExisting : undefined}
        attachLabel={canAttach ? "Attach references here" : undefined}
      />
    </>
  );
}
