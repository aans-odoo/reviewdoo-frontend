import { useState, useRef, useEffect, useCallback, cloneElement, isValidElement } from "react";
import type { ReactElement, CSSProperties } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/shared/Markdown";
import { MarkdownHint } from "@/components/shared/MarkdownHint";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Keeps a single height value in sync across the edit textarea and the preview
 * container. The user's drag-to-resize height lives as an inline style on the
 * mounted DOM node, which is lost when that node unmounts on mode switch. We
 * observe whichever element is currently mounted and store its height so it can
 * be reapplied to the other element, making the height persist across toggles.
 */
function usePersistedFieldHeight() {
  const [height, setHeight] = useState<number>();
  const observerRef = useRef<ResizeObserver | null>(null);

  const attach = useCallback((el: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    observerRef.current = ro;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { height, attach };
}

/**
 * Clones the provided textarea child to attach the resize observer ref and
 * apply the persisted height, without the caller needing to wire up refs.
 */
function withPersistedHeight(
  children: React.ReactNode,
  attach: (el: HTMLElement | null) => void,
  height: number | undefined
): React.ReactNode {
  if (!isValidElement(children)) return children;
  const child = children as ReactElement<{ style?: CSSProperties; ref?: unknown }>;
  return cloneElement(child, {
    ref: attach,
    style: { ...(child.props.style ?? {}), ...(height ? { height } : {}) },
  });
}

interface MarkdownPreviewToggleProps {
  /** Current field value to render as markdown in preview mode */
  value: string;
  /** The textarea element to show in edit mode */
  children: React.ReactNode;
  /** Optional className for the preview container */
  className?: string;
}

/**
 * A wrapper that provides a toggle between a textarea (edit) and rendered
 * markdown (preview). Shows an eye icon next to the MarkdownHint label area
 * to switch modes.
 *
 * Usage:
 * ```tsx
 * <MarkdownPreviewToggle value={description}>
 *   <Textarea ... />
 * </MarkdownPreviewToggle>
 * ```
 *
 * The parent should render the label row with <MarkdownPreviewToggle.Header />
 * or use the compound pattern.
 */
export function MarkdownPreviewToggle({
  value,
  children,
  className,
}: MarkdownPreviewToggleProps) {
  const [preview, setPreview] = useState(false);
  const { height, attach } = usePersistedFieldHeight();

  return (
    <div className={cn("space-y-2", className)}>
      {preview ? (
        <div
          ref={attach}
          className="flex flex-col min-h-[80px] w-full rounded-[10px] border border-border bg-theme-bg-elevated px-3.5 py-2.5 text-sm text-theme-text overflow-y-auto resize-vertical"
          style={height ? { height } : { maxHeight: "300px" }}
          role="region"
          aria-label="Markdown preview"
          title="Previewing"
        >
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <span className="text-theme-text-dim italic">Nothing to preview</span>
          )}
        </div>
      ) : (
        withPersistedHeight(children, attach, height)
      )}
    </div>
  );
}

interface HeaderProps {
  /** Label text */
  label: string;
  /** HTML for attribute linking to the textarea */
  htmlFor?: string;
  /** Whether preview mode is active (controlled externally) */
  preview: boolean;
  /** Callback to toggle preview */
  onToggle: () => void;
  /** Optional node rendered right after the label (e.g. a save status indicator) */
  labelAccessory?: React.ReactNode;
}

/**
 * Label row with MarkdownHint and the preview toggle icon.
 * Designed to sit above the textarea / preview area.
 */
export function MarkdownFieldHeader({ label, htmlFor, preview, onToggle, labelAccessory }: HeaderProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const isPointerOver = useRef(false);

  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2.5">
        <label
          htmlFor={!preview ? htmlFor : undefined}
          className="text-[13px] font-medium leading-none text-theme-text-muted"
        >
          {label}
        </label>
        {labelAccessory}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <MarkdownHint />
        <span className="w-px h-4 bg-theme-text-muted opacity-20" />
        <TooltipProvider delayDuration={300}>
          <Tooltip
            open={tooltipOpen}
            onOpenChange={(open) => {
              // Only allow opening via pointer hover, not focus
              if (open && !isPointerOver.current) return;
              setTooltipOpen(open);
            }}
          >
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggle}
                onPointerEnter={() => { isPointerOver.current = true; }}
                onPointerLeave={() => { isPointerOver.current = false; setTooltipOpen(false); }}
                aria-label={preview ? "Switch to edit mode" : "Preview markdown"}
                aria-pressed={preview}
                className={cn(
                  "inline-flex items-center justify-center rounded-md p-1 transition-colors",
                  "hover:bg-theme-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-0",
                  preview
                    ? "text-theme-accent"
                    : "text-theme-text-muted opacity-60 hover:opacity-100"
                )}
              >
                {preview ? (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {preview ? "Back to editing" : "Preview markdown"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    </div>
  );
}

/**
 * Compound component combining the header + body (preview/textarea toggle).
 * This is the recommended all-in-one usage.
 */
interface MarkdownFieldProps {
  /** Label text */
  label: string;
  /** HTML for attribute */
  htmlFor?: string;
  /** Current field value */
  value: string;
  /** Textarea element */
  children: React.ReactNode;
  /** Optional className */
  className?: string;
  /** Optional node rendered right after the label (e.g. a save status indicator) */
  labelAccessory?: React.ReactNode;
}

export function MarkdownField({ label, htmlFor, value, children, className, labelAccessory }: MarkdownFieldProps) {
  const [preview, setPreview] = useState(false);
  const { height, attach } = usePersistedFieldHeight();

  return (
    <div className={cn("space-y-2", className)}>
      <MarkdownFieldHeader
        label={label}
        htmlFor={htmlFor}
        preview={preview}
        onToggle={() => setPreview((p) => !p)}
        labelAccessory={labelAccessory}
      />
      {preview ? (
        <div
          ref={attach}
          className="flex flex-col min-h-[80px] w-full rounded-[10px] border border-border bg-theme-bg-elevated px-3.5 py-2.5 text-sm text-theme-text overflow-y-auto resize-vertical cursor-default"
          style={height ? { height } : { maxHeight: "300px" }}
          role="region"
          aria-label="Markdown preview"
          title="Previewing"
        >
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <span className="text-theme-text-dim italic">Nothing to preview</span>
          )}
        </div>
      ) : (
        withPersistedHeight(children, attach, height)
      )}
    </div>
  );
}
