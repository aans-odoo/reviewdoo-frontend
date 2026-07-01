import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /** Optional label announced to screen readers (defaults to "Loading"). */
  label?: string;
  className?: string;
}

/**
 * Centered spinner used for in-content loading states, so every page shows the
 * same affordance instead of a mix of bare "Loading..." text and ad-hoc
 * spinners. Announces politely for assistive tech.
 */
export function Loading({ label = "Loading", className }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center py-20", className)} role="status" aria-live="polite">
      <LoaderCircle className="h-6 w-6 animate-spin text-theme-accent" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
