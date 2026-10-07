import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** How a pooled key is handled. Keep in sync with what the backend enforces. */
export const KEY_HANDLING_BULLETS = [
  "Encrypted with AES-256-GCM before it is stored.",
  "Never shown again after saving — only the last 4 characters are displayed.",
  "Never written to logs and never returned by the API.",
  "Sent only to Google's Gemini API, in a request header.",
  "You can remove it at any time; removing deletes it from the database.",
] as const;

interface EncryptedBadgeProps {
  className?: string;
}

/**
 * Small "Encrypted" badge. Hover or focus it to see how the key is handled.
 * Rendered as a button so keyboard users can reach the tooltip.
 */
export function EncryptedBadge({ className }: EncryptedBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Encrypted. How your key is handled"
          className={cn(
            badgeVariants({ variant: "green" }),
            "cursor-help gap-1 px-2.5 py-[5px] text-[10px] leading-[10px] font-medium focus-visible:ring-2 focus-visible:ring-theme-success/50",
            className
          )}
        >
          <Lock className="h-2.5 w-2.5" aria-hidden="true" />
          Encrypted
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-xs px-3 py-2.5">
        <p className="mb-1.5 text-[13px] font-medium text-theme-text">How your key is handled</p>
        <ul className="list-disc space-y-1 pl-4 text-theme-text-muted">
          {KEY_HANDLING_BULLETS.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
