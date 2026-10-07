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
import { Textarea } from "@/components/ui/textarea";
import { MarkdownField } from "@/components/shared/MarkdownPreviewToggle";
import { ChipInput } from "@/components/shared/ChipInput";
import { MultiSelect, MultiSelectOption } from "@/components/shared/MultiSelect";
import { ReferenceInput, ReferenceDraft } from "@/components/shared/ReferenceInput";
import { CategorySelect } from "@/components/categories/CategorySelect";
import { SimilarityWarningDialog, SimilarItem } from "@/components/shared/SimilarityWarningDialog";
import { findSimilarChecklists, aboveThreshold } from "@/lib/similarity";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/shared/Alert";
import { cn } from "@/lib/utils";
import { FileCode, MessageSquare, GitCommit, Globe, Info, AlertTriangle, type LucideIcon } from "lucide-react";

const SEVERITIES = ["critical", "major", "minor", "suggestion"];

// Scope drives how `get_review_checklists` matches this item to a diff, so it
// is the first thing a contributor picks. Order: file-based scopes first, then
// the file-independent contexts.
const SCOPE_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "code", label: "Code", icon: FileCode },
  { value: "comment", label: "Comment", icon: MessageSquare },
  { value: "commit_message", label: "Commit", icon: GitCommit },
  { value: "general", label: "General", icon: Globe },
];

// `code` and `comment` are matched by these; `commit_message` and `general`
// ignore them (they always apply).
const SCOPE_USES_FILES = new Set(["code", "comment"]);

const LANGUAGE_OPTIONS: MultiSelectOption[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "xml", label: "XML" },
  { value: "css", label: "CSS" },
];

/**
 * Plain-English restatement of what a checklist will match, mirroring the
 * backend matcher. Shown live under the scope picker so contributors can
 * confirm their choices drive the right `get_review_checklists` results
 * without wading through static help text. `tone: "warn"` flags an accidental
 * catch-all (a file scope with nothing to narrow it).
 */
function describeApplicability(
  scope: string,
  languages: string[],
  filePatterns: string[]
): { text: string; tone: "info" | "warn" } {
  if (scope === "commit_message")
    return { text: "Always checked against the commit message.", tone: "info" };
  if (scope === "general")
    return { text: "Always applies to every change.", tone: "info" };

  const isComment = scope === "comment";
  const langLabels = languages.map(
    (l) => LANGUAGE_OPTIONS.find((o) => o.value === l)?.label ?? l
  );

  // `code` is matched by language, so a language is mandatory.
  if (!isComment && langLabels.length === 0) {
    return {
      text: "Select at least one language — code checklists are matched to a diff by language.",
      tone: "warn",
    };
  }

  // A file pattern narrows the language rule to a subset of those files (AND),
  // rather than widening the match.
  const base = langLabels.length ? `${langLabels.join(", ")} files` : "any changed file";
  const patPart = filePatterns.length ? ` matching ${filePatterns.join(", ")}` : "";
  const target = `${base}${patPart}`;

  return {
    text: isComment
      ? `Checked against comments in ${target}.`
      : `Applies to ${target}.`,
    tone: "info",
  };
}

export interface ChecklistInitial {
  id: string;
  description: string;
  severity: string;
  scope?: string;
  category: string | null;
  languages: string[];
  filePatterns: string[];
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
  const [scope, setScope] = useState("code");
  const [category, setCategory] = useState("other");
  const [languages, setLanguages] = useState<string[]>([]);
  const [filePatterns, setFilePatterns] = useState<string[]>([]);
  const [references, setReferences] = useState<ReferenceDraft[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [similar, setSimilar] = useState<SimilarItem[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  // Small muted note shown when the duplicate check failed and we saved anyway.
  const [similarityNote, setSimilarityNote] = useState("");

  // Reset fields whenever the dialog (re)opens or targets a different item.
  useEffect(() => {
    if (!open) return;
    setDescription(initial?.description ?? "");
    setSeverity(initial?.severity ?? "minor");
    setScope(initial?.scope ?? "code");
    setCategory(initial?.category ?? (mode === "create" ? "other" : ""));
    setLanguages(initial?.languages ?? []);
    setFilePatterns(initial?.filePatterns ?? []);
    setReferences(initial?.references ?? []);
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

  const applicability = describeApplicability(scope, languages, filePatterns);
  const codeMissingLanguage = scope === "code" && languages.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[600px] max-w-[95vw] max-h-[95vh] overflow-y-auto gap-0">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create Review Checklist" : "Edit Review Checklist"}</DialogTitle>
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
              <div className="rounded-lg py-5 px-6 border space-y-2">
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
                  <div className="grid grid-cols-5 gap-3 pt-3">
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

                <div
                  className={cn(
                    "flex items-start gap-2 rounded-md px-3 py-2 text-xs",
                    applicability.tone === "warn"
                      ? "bg-theme-cyan/5 text-theme-cyan/80"
                      : "bg-theme-bg-elevated text-theme-text-muted"
                  )}
                >
                  {applicability.tone === "warn" ? (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{applicability.text}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>References</Label>
              <ReferenceInput values={references} onChange={setReferences} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !description.trim() || codeMissingLanguage}>
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
      </Dialog>

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
