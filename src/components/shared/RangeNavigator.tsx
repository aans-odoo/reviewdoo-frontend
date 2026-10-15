import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Hard cap mirrored from the backend (MAX_LIST_LIMIT) to keep windows sane. */
const MAX_RANGE = 1000;

export interface RangeValue {
  /** 0-indexed start of the window. */
  offset: number;
  /** Number of rows requested. */
  limit: number;
}

interface RangeNavigatorProps {
  /** Current window actually in effect. */
  offset: number;
  limit: number;
  /** Total rows available on the server for the active filters. */
  total: number;
  /** Rows actually rendered in the current view (may be < limit near the end). */
  shown: number;
  onChange: (value: RangeValue) => void;
}

/**
 * Parse a human range like "5-21", or a single index like "12", into a
 * zero-indexed { offset, limit } window.
 *
 * Rules (1-indexed, inclusive on both ends):
 *   "a"    -> show only record a               => { offset: a-1, limit: 1 }
 *   "a-b"  -> show records a through b          => { offset: a-1, limit: b-a+1 }
 *
 * Returns null for every invalid case so the caller can fall back to the
 * previous value:
 *   - empty / whitespace only
 *   - non-numeric or malformed ("abc", "1-", "-5", "1-2-3", "1.5", "1,5")
 *   - a < 1 or b < 1            (0 and negatives are invalid; min index is 1)
 *   - b < a                     (reversed range, e.g. "20-10")
 *   - a > total                 (window starts past the last record)
 */
export function parseRange(input: string, total: number): RangeValue | null {
  const s = input.replace(/\s+/g, "");
  if (!s) return null;

  // Only digits, optionally "digits-digits". Rejects signs, decimals, extra
  // separators, and trailing/leading dashes.
  const m = /^(\d+)(?:-(\d+))?$/.exec(s);
  if (!m) return null;

  const a = Number(m[1]);
  const b = m[2] !== undefined ? Number(m[2]) : a;

  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (a < 1 || b < 1) return null; // "0", "0-5", etc.
  if (b < a) return null; // "20-10"
  if (total > 0 && a > total) return null; // start beyond available data

  const limit = Math.min(b - a + 1, MAX_RANGE);
  return { offset: a - 1, limit };
}

/** Canonical editable text for a window: "a" when it's a single row, else "a-b". */
function formatRange(offset: number, limit: number): string {
  const start = offset + 1;
  const end = offset + limit;
  return start === end ? `${start}` : `${start}-${end}`;
}

export function RangeNavigator({
  offset,
  limit,
  total,
  shown,
  onChange,
}: RangeNavigatorProps) {
  const canonical = formatRange(offset, limit);
  const [text, setText] = useState(canonical);
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the field in sync when the window changes from the outside (prev/next,
  // filter resets, server clamping).
  useEffect(() => {
    setText(canonical);
    setInvalid(false);
  }, [canonical]);

  const commit = () => {
    const parsed = parseRange(text, total);
    if (!parsed) {
      // Invalid: flash a hint and restore the last good value.
      setInvalid(true);
      setText(canonical);
      window.setTimeout(() => setInvalid(false), 900);
      return;
    }
    setInvalid(false);
    if (parsed.offset !== offset || parsed.limit !== limit) {
      onChange(parsed);
    } else {
      setText(canonical);
    }
  };

  // Display bounds, clamped to what actually exists.
  const firstRow = total === 0 ? 0 : offset + 1;
  const lastRow = total === 0 ? 0 : offset + shown;

  const atStart = offset <= 0;
  const atEnd = offset + limit >= total;

  const goPrev = () => {
    if (atStart) return;
    const newOffset = Math.max(0, offset - limit);
    onChange({ offset: newOffset, limit });
  };

  const goNext = () => {
    if (atEnd) return;
    onChange({ offset: offset + limit, limit });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
      <p className="text-sm text-theme-text-muted opacity-80">
        Showing{" "}
        <span className="font-medium text-theme-text">
          {firstRow}
          {lastRow !== firstRow ? `-${lastRow}` : ""}
        </span>{" "}
        / <span className="font-medium text-theme-text">{total}</span>
        <span className="text-theme-text-dim">
          {" "}
          ({shown} shown)
        </span>
      </p>

      <div className="flex items-center gap-0.5 h-9">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={atStart}
                aria-label="Previous range"
                className="h-9 px-3 border-border rounded-[4px] rounded-tl-xl rounded-bl-xl bg-theme-bg-elevated/60 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Previous</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commit();
                    inputRef.current?.blur();
                  } else if (e.key === "Escape") {
                    setText(canonical);
                    setInvalid(false);
                    inputRef.current?.blur();
                  }
                }}
                onBlur={commit}
                inputMode="numeric"
                aria-label="Visible range, e.g. 1-10 or 12"
                aria-invalid={invalid}
                className={cn(
                  "h-9 w-20 rounded-[4px] border bg-theme-bg-elevated/60 px-2 py-1 text-center text-sm text-theme-text transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0",
                  invalid
                    ? "border-theme-danger text-theme-danger focus-visible:ring-theme-danger"
                    : "border-border focus-visible:ring-theme-primary"
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-center">
              Type a range like <span className="font-medium">1-10</span>, a wider
              window like <span className="font-medium">5-30</span>, or a single
              record like <span className="font-medium">12</span>. Invalid input is
              ignored.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                disabled={atEnd}
                aria-label="Next range"
                className="h-9 px-3 border-border rounded-[4px] rounded-tr-xl rounded-br-xl bg-theme-bg-elevated/60 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Next</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
