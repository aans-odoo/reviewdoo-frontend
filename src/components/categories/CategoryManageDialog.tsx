import { useState, useEffect, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/shared/Alert";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import type { CategoryItem } from "@/hooks/useCategories";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this category; otherwise it creates one. */
  category: CategoryItem | null;
  /**
   * Called after a successful save. For a rename, `renamed` carries the old and
   * new names so callers can migrate any selection/filter that used the old one.
   */
  onSaved: (renamed?: { from: string; to: string }) => void;
}

export function CategoryManageDialog({ open, onOpenChange, category, onSaved }: Props) {
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (isEdit && category) {
        const newName = name.trim();
        const oldName = category.name;
        await api.put(`/categories/${category.id}`, { name: newName });
        onOpenChange(false);
        onSaved(oldName !== newName ? { from: oldName, to: newName } : undefined);
      } else {
        await api.post("/categories", { name: name.trim() });
        onOpenChange(false);
        onSaved();
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename this category. Existing checklists using it will be updated automatically."
              : "Create a new review checklist category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. security"
              autoFocus
            />
            {isEdit && (
              <p className="text-xs text-theme-text-dim">
                Used by {category?.checklistCount ?? 0} review checklist
                {(category?.checklistCount ?? 0) === 1 ? "" : "s"}.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Saving…" : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
