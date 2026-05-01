import { cn } from "@/lib/utils";

type Status = "completed" | "running" | "failed" | "pending" | "paused" | string;

const statusStyles: Record<string, string> = {
  completed: "bg-theme-success/15 text-theme-success border-theme-success/30",
  running: "bg-theme-info/15 text-theme-info border-theme-info/30",
  failed: "bg-theme-danger/15 text-theme-danger border-theme-danger/30",
  pending: "bg-theme-accent/15 text-theme-accent-light border-theme-accent/30",
  paused: "bg-theme-accent/15 text-theme-accent-light border-theme-accent/30",
  active: "bg-theme-success/15 text-theme-success border-theme-success/30",
  inactive: "bg-theme-bg-elevated text-theme-text-muted border-border",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] ?? "bg-theme-bg-elevated text-theme-text-muted border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
