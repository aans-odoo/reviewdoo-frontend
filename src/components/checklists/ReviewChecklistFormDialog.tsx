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
import { MarkdownHint } from "@/components/shared/MarkdownHint";
import { ChipInput } from "@/components/shared/ChipInput";
import { ReferenceInput, ReferenceDraft } from "@/components/shared/ReferenceInput";
import { EmbeddingModelBanner } from "@/components/shared/EmbeddingModelBanner";
import { SimilarityWarningDialog, SimilarItem } from "@/components/shared/SimilarityWarningDialog";
import { findSimilarChecklists, aboveThreshold } from "@/lib/similarity";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/shared/Alert";

const SEVERITIES = ["critical", "major", "minor", "suggestion"];
const CATEGORIES = [
  "security", "performance", "readability", "architecture",
  "testing", "error-handling", "accessibility", "other",
];

export interface ChecklistInitial {
  id: string;
  description: string;
  severity: string;
  category: string;
  languages: string[];
  filePatterns: string[];
  references: { id: string; url: string; description?: string }[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: ChecklistInitial;
  hasEmbeddingModel: boolean;
  onSaved: () => void;
}

export function ReviewChecklistFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  hasEmbeddingModel,
  onSaved,
}: Props) {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [category, setCategory] = useState("other");
  const [languages, setLanguages] = useState<string[]>([]);
  const [filePatterns, setFilePatterns] = useState<string[]>([]);
  const [references, setReferences] = useState<ReferenceDraft[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [similar, setSimilar] = useState<SimilarItem[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);

  // Reset fields whenever the dialog (re)opens or targets a different item.
  useEffect(() => {
    if (!open) return;
    setDescription(initial?.description ?? "");
    setSeverity(initial?.severity ?? "minor");
    setCategory(initial?.category ?? "other");
    setLanguages(initial?.languages ?? []);
    setFilePatterns(initial?.filePatterns ?? []);
    setReferences(initial?.references ?? []);
    setError("");
    setShowSimilar(false);
    setSimilar([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);

  const persist = async () => {
    if (mode === "create") {
      await api.post("/review-checklists", {
        description,
        severity,
        category,
        languages,
        filePatterns,
        references: references.length > 0
          ? references.map((r) => ({ url: r.url, description: r.description }))
          : undefined,
      });
    } else if (initial) {
      await api.put(`/review-checklists/${initial.id}`, {
        description,
        severity,
        category,
        languages,
        filePatterns,
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
    try {
      const matches = await findSimilarChecklists(description, mode === "edit" ? initial?.id : undefined);
      const dupes = aboveThreshold(matches);
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
      await doSave();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save review checklist"));
      setSaving(false);
    }
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create Review Checklist" : "Edit Review Checklist"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new review checklist manually."
                : "Update this review checklist."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="min-w-0 space-y-4 p-5">
            {!hasEmbeddingModel && <EmbeddingModelBanner entity="review checklists" searchType="text" />}
            {error && (
              <Alert variant="error">{error}</Alert>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cf-description">Description</Label>
                <MarkdownHint />
              </div>
              <Textarea
                id="cf-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the review checklist..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
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
                <Select value={category} onValueChange={setCategory}>
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
              <Label htmlFor="cf-languages">Languages</Label>
              <ChipInput
                id="cf-languages"
                values={languages}
                onChange={setLanguages}
                lowercase
                placeholder="e.g. typescript — press Enter to add"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-patterns">File Patterns</Label>
              <ChipInput
                id="cf-patterns"
                values={filePatterns}
                onChange={setFilePatterns}
                placeholder="e.g. *.ts — press Enter to add"
              />
            </div>
            <div className="space-y-2">
              <Label>References</Label>
              <ReferenceInput values={references} onChange={setReferences} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !hasEmbeddingModel || !description.trim()}>
                {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
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
