import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownHintProps {
  className?: string;
}

export function MarkdownHint({ className }: MarkdownHintProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-theme-text-muted opacity-50 mr-1",
        className
      )}
      title="Markdown formatting is supported"
    >
      Markdown supported
      <span className="flex items-center gap-px h-4 pl-1 pr-0.5 rounded-[4px] bg-theme-text-muted text-theme-bg-elevated text-[10px] font-black">M <ArrowDown className="w-2.5" /></span>
    </span>
  );
}
