import { Lock } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EncryptedBadgeProps {
  /** Tooltip heading, also used as the accessible name. */
  title: string;
  /** Optional bullet points shown under the title. */
  details?: readonly string[];
  /** When set, renders a green pill with this text; otherwise just the lock icon. */
  label?: string;
  /** Badge color; also colors the icon in icon-only mode. */
  variant?: VariantProps<typeof badgeVariants>["variant"];
  className?: string;
}

/**
 * Lock badge that explains, on hover or focus, how a sensitive value is protected.
 * Rendered as a button so keyboard users can reach the tooltip.
 */
export function EncryptedBadge({ title, details, label, variant = "green", className }: EncryptedBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label ? `${label}. ${title}` : title}
          className={cn(
            badgeVariants({ variant }),
            "cursor-help focus-visible:ring-1 focus-visible:ring-current",
            label
              ? "gap-1 px-2.5 py-[5px] text-[10px] leading-[10px] font-medium"
              : "rounded border-0 bg-transparent p-0.5 hover:opacity-80",
            className
          )}
        >
          <Lock className={label ? "size-2.5" : "size-3"} aria-hidden="true" />
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-xs px-3 py-2.5">
        <p className={cn("text-[13px] font-medium text-theme-text", details?.length && "mb-1.5")}>{title}</p>
        {details && details.length > 0 && (
          <ul className="list-disc space-y-1 pl-4 text-theme-text-muted">
            {details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/** How a password is handled. Keep in sync with backend/src/utils/password.ts. */
const PASSWORD_HANDLING_BULLETS = [
  "Hashed with bcrypt before it is stored.",
  "Only the hash is kept; the password itself is never stored.",
] as const;

/** Icon-only lock badge for password fields. */
export function PasswordHandlingBadge() {
  return <EncryptedBadge title="How your password is handled" details={PASSWORD_HANDLING_BULLETS} variant="secondary" />;
}
