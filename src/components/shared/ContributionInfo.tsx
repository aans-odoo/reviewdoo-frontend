import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface Contributor {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

function initials(c: Contributor): string {
  if (c.name?.trim()) {
    return c.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return c.email[0]?.toUpperCase() ?? "?";
}

function displayName(c: Contributor): string {
  return c.name?.trim() || c.email;
}

function formatDate(value?: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const SIZE = {
  sm: { avatar: "h-5 w-5", text: "text-[8px]" },
  md: { avatar: "h-6 w-6", text: "text-[9px]" },
} as const;

function Face({ person, size }: { person: Contributor; size: keyof typeof SIZE }) {
  return (
    <Avatar className={SIZE[size].avatar + " ring-0"}>
      {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt={displayName(person)} />}
      <AvatarFallback className={SIZE[size].text}>{initials(person)}</AvatarFallback>
    </Avatar>
  );
}

interface ContributionInfoProps {
  createdBy?: Contributor | null;
  updatedBy?: Contributor | null;
  createdAt?: string;
  updatedAt?: string;
  size?: keyof typeof SIZE;
  className?: string;
  tooltipSide?: "right" | "top" | "bottom" | "left" | undefined;
}

/**
 * Compact attribution for a knowledge-base record.
 *
 * Renders the contributor avatars together (overlapping to save space) and
 * exposes the full story through a hover tooltip:
 *   - "Created by X"
 *   - "Created by X and last edited by Y"  (only when someone else edited it)
 *
 * Kept intentionally quiet so it adds credibility and a sense of ownership
 * without crowding the content — used on both detail pages and list rows.
 */
export function ContributionInfo({
  createdBy,
  updatedBy,
  createdAt,
  updatedAt,
  size = "md",
  className,
  tooltipSide = "right"
}: ContributionInfoProps) {
  // Only surface the editor when the record was genuinely changed after
  // creation *and* by a different person than the original author.
  const wasEditedByOther =
    !!updatedBy &&
    !!updatedAt &&
    !!createdAt &&
    updatedBy.id !== createdBy?.id &&
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;

  // Nothing to attribute — fall back to a plain created date if we have one.
  if (!createdBy) {
    if (!createdAt) return null;
    return (
      <div className={"flex items-center gap-2 text-sm " + (className ?? "")}>
        <span className="text-theme-text-muted">
          Added <span className="text-theme-text-dim">{formatDate(createdAt)}</span>
        </span>
      </div>
    );
  }

  const tooltip = wasEditedByOther && updatedBy
    ? `Created by ${displayName(createdBy)} and last edited by ${displayName(updatedBy)}`
    : `Created by ${displayName(createdBy)}`;

  return (
    <div className={"flex items-center " + (className ?? "")}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-default items-center -space-x-2" aria-label={tooltip}>
            <Face person={createdBy} size={size} />
            {wasEditedByOther && updatedBy && <Face person={updatedBy} size={size} />}
          </div>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}
