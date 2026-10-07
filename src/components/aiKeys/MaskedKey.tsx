import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaskedKeyProps {
  /** Last 4 characters of the key, as returned by the API. */
  hint: string;
  /** Show a small key icon before the masked value. */
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Displays a stored API key as a masked pill, e.g. `•••• aUc1`.
 * Only the hint (last 4 characters) ever reaches the client; the dots are
 * decorative. Screen readers hear "Key ending in aUc1".
 */
export function MaskedKey({ hint, showIcon = true, size = "md", className }: MaskedKeyProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-theme-bg-elevated font-mono text-theme-text",
        size === "sm" ? "px-3 pb-0.5 pt-1 text-xs" : "px-3.5 py-1 text-[13px]",
        className
      )}
    >
      {showIcon && (
        <KeyRound
          className={cn("shrink-0 text-theme-text-dim", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
          aria-hidden="true"
        />
      )}
      <span className="sr-only">Key ending in </span>
      <span aria-hidden="true" className="tracking-[0.2em] text-theme-text-dim">
        ••••
      </span>
      <span className="font-medium">{hint}</span>
    </span>
  );
}
