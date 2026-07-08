import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, CategoryItem } from "@/hooks/useCategories";
import { CategoryManageDialog } from "./CategoryManageDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Alert } from "@/components/shared/Alert";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  /** Render a leading "All" option (used by the list filter). */
  includeAll?: boolean;
  placeholder?: string;
  triggerClassName?: string;
  /** Disable the trigger (e.g. while a form is not ready). */
  disabled?: boolean;
  /**
   * Called after a category is created/renamed/deleted, so the parent can
   * refetch data that embeds category values (e.g. checklist table rows that
   * change when a category is renamed).
   */
  onCategoriesChanged?: () => void;
}

/**
 * Category dropdown backed by the admin-managed category table. Admins get
 * inline affordances to add a new category ("+ New category" row) and edit or
 * delete any existing one (pencil / X icons per row) without those controls
 * hijacking the normal select-to-filter behaviour.
 */
export function CategorySelect({
  value,
  onValueChange,
  includeAll,
  placeholder = "Select category",
  triggerClassName,
  disabled,
  onCategoriesChanged,
}: Props) {
  const { isAdmin } = useAuth();
  const { categories, refresh } = useCategories();

  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const afterChange = (renamed?: { from: string; to: string }) => {
    // If the currently selected value was just renamed, follow it so the
    // filter/selection (and the resulting table) don't go stale/empty.
    if (renamed && value === renamed.from) {
      onValueChange(renamed.to);
    }
    refresh();
    onCategoriesChanged?.();
  };

  const openCreate = () => {
    setEditTarget(null);
    setOpen(false);
    setDialogOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditTarget(category);
    setOpen(false);
    setDialogOpen(true);
  };

  const askDelete = (category: CategoryItem) => {
    setError("");
    setOpen(false);
    setDeleteTarget(category);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      // If the deleted category was the active filter, fall back to "All".
      if (value === deleteTarget.name && includeAll) {
        onValueChange("all");
      }
      setDeleteTarget(null);
      afterChange();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete category"));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Select
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger className={`capitalize ${triggerClassName ?? ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAll && <SelectItem value="all">All</SelectItem>}

          {categories.map((c) => {
            return (
              <div key={c.id} className="relative flex items-center">
                <SelectItem
                  value={c.name}
                  className={isAdmin ? "flex-1 pr-24 capitalize" : "flex-1 capitalize"}
                >
                  {c.name}
                </SelectItem>
                {isAdmin && (
                  <div className="absolute right-1 flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-label={`Edit ${c.name}`}
                      title={`Edit ${c.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded text-theme-text-dim hover:bg-theme-bg-hover hover:text-theme-text"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEdit(c);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${c.name}`}
                      title={`Delete ${c.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded text-theme-text-dim hover:bg-theme-bg-hover hover:text-theme-danger"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        askDelete(c);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isAdmin && (
            <>
              <SelectSeparator />
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-theme-primary hover:bg-theme-bg-hover"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  openCreate();
                }}
              >
                <Plus className="h-4 w-4" /> New category
              </button>
            </>
          )}
        </SelectContent>
      </Select>

      {error && (
        <Alert variant="error" className="mt-2" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      {isAdmin && (
        <>
          <CategoryManageDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            category={editTarget}
            onSaved={afterChange}
          />
          <ConfirmDialog
            open={!!deleteTarget}
            onOpenChange={(o) => !o && setDeleteTarget(null)}
            title="Delete Category"
            description={
              (deleteTarget?.checklistCount ?? 0) > 0
                ? `"${deleteTarget?.name}" is used by ${deleteTarget?.checklistCount} review checklist${
                    deleteTarget?.checklistCount === 1 ? "" : "s"
                  }. Deleting it will leave ${
                    deleteTarget?.checklistCount === 1 ? "that checklist" : "those checklists"
                  } without a category. Continue?`
                : `Delete "${deleteTarget?.name}"? This cannot be undone.`
            }
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={handleDelete}
            isLoading={deleting}
          />
        </>
      )}
    </>
  );
}
