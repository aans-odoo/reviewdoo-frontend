import { Link } from "react-router-dom";
import { Bot, UserRound } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import type { RangeValue } from "@/components/shared/RangeNavigator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  flagEmoji,
  type ActivityCategory,
  type ActivityEventDefinition,
  type ActivityLogItem,
} from "@/lib/activity";

type ActivityRow = ActivityLogItem & Record<string, unknown>;

interface ActivityTableProps {
  items: ActivityLogItem[];
  total: number;
  offset: number;
  limit: number;
  onRangeChange: (value: RangeValue) => void;
  /** Event definitions from the backend, used for labels and badge colors. */
  events: Map<string, ActivityEventDefinition>;
  emptyMessage?: string;
}

type BadgeVariant = "default" | "purple" | "green" | "orange" | "blue" | "red";

const CATEGORY_VARIANTS: Record<ActivityCategory, BadgeVariant> = {
  navigation: "default",
  auth: "blue",
  search: "purple",
  checklist: "green",
  mcp: "orange",
  system: "default",
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function initials(name: string, email: string): string {
  if (name.trim()) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.charAt(0).toUpperCase();
}

/** Short browser/OS label from a user agent; the full string is in the tooltip. */
function shortUserAgent(ua: string): string {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" :
    ua.split(/[\s/]/)[0] || "Unknown";
  const os =
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X|Macintosh/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" :
    null;
  return os ? `${browser} · ${os}` : browser;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-theme-text-muted">{children}</span>;
}

function ChecklistLink({ row, children }: { row: ActivityLogItem; children: React.ReactNode }) {
  if (row.targetType === "review_checklist" && row.targetId && row.event !== "checklist.delete") {
    return (
      <Link to={`/review-checklists/${row.targetId}`} className="text-theme-text hover:underline">
        {children}
      </Link>
    );
  }
  return <span className="text-theme-text">{children}</span>;
}

/**
 * Event-specific details. Add a case here for a nicer rendering of a new
 * event; anything without one falls back to its raw metadata.
 */
function EventDetails({ row }: { row: ActivityLogItem }) {
  const m = row.metadata ?? {};
  switch (row.event) {
    case "page.view":
      return <code className="font-mono text-xs text-theme-text">{str(m.path) ?? "—"}</code>;
    case "auth.login":
    case "auth.logout":
      return <Muted>—</Muted>;
    case "auth.login_failed":
      return (
        <div className="flex flex-col">
          <span className="text-theme-text">{str(m.email) ?? "—"}</span>
          {str(m.reason) && <Muted>{str(m.reason)}</Muted>}
        </div>
      );
    case "checklist.search":
    case "checklist.semantic_search":
      return (
        <div className="flex flex-col">
          <span className="text-theme-text">“{str(m.query) ?? ""}”</span>
          <Muted>{num(m.resultCount) ?? 0} results</Muted>
        </div>
      );
    case "checklist.create":
    case "checklist.delete":
      return (
        <span className="line-clamp-2 max-w-md">
          <ChecklistLink row={row}>{str(m.description) ?? row.targetId ?? "—"}</ChecklistLink>
        </span>
      );
    case "checklist.update": {
      const fields = Array.isArray(m.fields) ? (m.fields as string[]) : [];
      return (
        <div className="flex max-w-md flex-col">
          <span className="line-clamp-2">
            <ChecklistLink row={row}>{str(m.description) ?? row.targetId ?? "—"}</ChecklistLink>
          </span>
          {fields.length > 0 && <Muted>Changed: {fields.join(", ")}</Muted>}
        </div>
      );
    }
    case "checklist.import":
      return (
        <span className="text-theme-text">
          {num(m.imported) ?? 0} imported, {num(m.skipped) ?? 0} skipped
        </span>
      );
    case "checklist.export":
      return <span className="text-theme-text">{num(m.count) ?? 0} checklists</span>;
    case "mcp.tool_call": {
      const args = (m.args ?? {}) as Record<string, unknown>;
      const parts = [
        num(args.fileCount) != null ? `${args.fileCount} files` : null,
        str(args.version) ? `v${args.version}` : null,
        num(m.durationMs) != null ? `${m.durationMs} ms` : null,
      ].filter(Boolean);
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <code className="font-mono text-xs text-theme-text">{str(m.tool) ?? "—"}</code>
            {m.isError === true && <Badge variant="red">Error</Badge>}
          </div>
          {parts.length > 0 && <Muted>{parts.join(" · ")}</Muted>}
        </div>
      );
    }
    case "indexer.run":
      return (
        <div className="flex flex-col">
          <span className="text-theme-text">
            {num(m.indexed) ?? 0} indexed{num(m.failed) ? `, ${m.failed} failed` : ""}
          </span>
          <Muted>
            {str(m.stopReason) ?? "—"}
            {str(m.reason) ? ` · trigger: ${m.reason}` : ""}
          </Muted>
        </div>
      );
    default: {
      const entries = Object.entries(m);
      if (entries.length === 0) return <Muted>—</Muted>;
      return (
        <code className="line-clamp-2 max-w-md break-all font-mono text-xs text-theme-text-muted">
          {JSON.stringify(m)}
        </code>
      );
    }
  }
}

/** Activity feed: who did what, when, and from where. */
export function ActivityTable({
  items,
  total,
  offset,
  limit,
  onRangeChange,
  events,
  emptyMessage = "No activity yet",
}: ActivityTableProps) {
  const columns: Column<ActivityRow>[] = [
    {
      key: "actor",
      header: "Actor",
      render: (row) => {
        const user = row.actor;
        const isSystem = row.actorKind === "system";
        // A `user` row whose account was deleted keeps actorKind but loses the link.
        const label = user ? user.name || user.email : isSystem ? "System" : row.actorKind === "user" ? "Deleted user" : "Guest";
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
              <AvatarFallback
                className={`text-[10px] ${!isSystem ? "from-emerald-800 to-teal-600" : "from-theme-bg-hover to-theme-body"}`}
              >
                {user ? (
                  initials(user.name, user.email)
                ) : isSystem ? (
                  <Bot className="h-3.5 w-3.5 text-theme-accent" aria-hidden="true" />
                ) : (
                  <UserRound className="h-3 w-3" aria-hidden="true" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="whitespace-nowrap text-theme-text">{label}</span>
              {user && <span className="text-xs text-theme-text-muted">{user.email}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: "event",
      header: "Event",
      render: (row) => {
        const def = events.get(row.event);
        return (
          <Badge
            variant={def ? CATEGORY_VARIANTS[def.category] : "default"}
            className="whitespace-nowrap"
            title={row.event}
          >
            {def?.label ?? row.event}
          </Badge>
        );
      },
    },
    {
      key: "details",
      header: "Details",
      render: (row) => <EventDetails row={row} />,
    },
    {
      key: "source",
      header: "Source",
      render: (row) => {
        const client = row.event === "mcp.tool_call" ? str(row.metadata?.clientName) : null;
        const primary = client ?? (row.userAgent ? shortUserAgent(row.userAgent) : null);
        if (!primary) return <span className="text-theme-text-muted">—</span>;
        const label = <span className="whitespace-nowrap text-theme-text">{primary}</span>;
        if (!row.userAgent) return label;
        return (
          <Tooltip>
            <TooltipTrigger asChild>{label}</TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm break-all">
              {row.userAgent}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: (row) => {
        const { country, countryCode, region, city } = row.geo;
        const flag = flagEmoji(countryCode);
        // Prefer "City, Country"; fall back to region or country alone.
        const place = [city, country ?? region].filter(Boolean).join(", ");
        if (!place && !row.ipAddress) return <span className="text-theme-text-muted">—</span>;
        const content = (
          <div className="flex items-center gap-1.5">
            {flag && <span aria-hidden="true">{flag}</span>}
            <span className="whitespace-nowrap text-theme-text">
              {place || <span className="text-theme-text-muted">Unknown</span>}
            </span>
          </div>
        );
        if (!row.ipAddress) return content;
        // The IP the location was guessed from, kept off the main row.
        return (
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="left" className="font-mono text-xs">
              {row.ipAddress}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      key: "createdAt",
      header: "Time",
      render: (row) => (
        <span className="whitespace-nowrap text-theme-text-muted">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items as ActivityRow[]}
      keyExtractor={(row) => row.id}
      emptyMessage={emptyMessage}
      serverSide
      rangeMode
      totalItems={total}
      offset={offset}
      limit={limit}
      onRangeChange={onRangeChange}
    />
  );
}
