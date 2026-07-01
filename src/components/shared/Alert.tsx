import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "warning" | "info";

const variantStyles: Record<AlertVariant, string> = {
  error: "bg-theme-danger/10 border-theme-danger/25 text-theme-danger",
  success: "bg-theme-success/10 border-theme-success/25 text-theme-success",
  warning: "bg-theme-accent/10 border-theme-accent/30 text-theme-accent-light",
  info: "bg-theme-info/10 border-theme-info/25 text-theme-info",
};

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  /** When provided, renders a dismiss button that calls this handler. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * Inline status banner used across the app for form/page level errors and
 * confirmations. Replaces the copy-pasted `<div class="rounded-sm bg-…">`
 * markup so colours, spacing, and the dismiss affordance stay consistent.
 *
 * Errors announce assertively (`role="alert"`); other variants use a polite
 * `role="status"` so screen readers aren't interrupted for success/info.
 */
export function Alert({ variant = "error", children, onDismiss, className }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start justify-between gap-2 rounded-sm border px-3 py-2 text-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
