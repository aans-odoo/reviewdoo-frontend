import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink } from "lucide-react";

export interface SimilarItem {
  id: string;
  text: string;
  score: number;
  /** Optional link to view the existing item. */
  href?: string;
}

interface SimilarityWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SimilarItem[];
  heading: string;
  description: string;
  /** Proceed with the create/update anyway. */
  onConfirm: () => void;
  confirmLabel: string;
  busy?: boolean;
  /** Optional per-item action (e.g. attach references to the existing item). */
  onAttach?: (item: SimilarItem) => void;
  attachLabel?: string;
}

export function SimilarityWarningDialog({
  open,
  onOpenChange,
  items,
  heading,
  description,
  onConfirm,
  confirmLabel,
  busy = false,
  onAttach,
  attachLabel,
}: SimilarityWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-theme-accent" />
            {heading}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-72 space-y-2 overflow-y-auto px-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-border bg-theme-bg-elevated px-3 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-theme-text">
                  {item.text.length > 160 ? item.text.slice(0, 160) + "…" : item.text}
                </p>
                <Badge variant="orange" className="shrink-0">
                  {Math.round(item.score * 100)}% match
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-3">
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-theme-primary-light hover:text-theme-primary"
                  >
                    <ExternalLink className="h-3 w-3" /> View
                  </a>
                )}
                {onAttach && attachLabel && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onAttach(item)}
                    className="text-xs font-medium text-theme-primary-light hover:text-theme-primary disabled:opacity-50"
                  >
                    {attachLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
