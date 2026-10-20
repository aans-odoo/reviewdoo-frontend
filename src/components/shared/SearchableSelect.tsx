import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  /** Secondary text shown under the label and matched by search (e.g. an email). */
  hint?: string;
  /** Leading visual (e.g. an avatar), shown in the list and in the trigger when selected. */
  icon?: ReactNode;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Classes for the trigger (width etc.). */
  className?: string;
  /** Classes for the dropdown panel (e.g. a wider min width). */
  contentClassName?: string;
  "aria-label"?: string;
}

/**
 * Single-value select with a search box, for option lists that can grow
 * (users, events). Same look as the app's `Select` trigger; built without
 * extra dependencies, like `MultiSelect`.
 *
 * Keyboard: Enter/Space/ArrowDown opens; typing filters; ArrowUp/ArrowDown/
 * Home/End move; Enter picks; Escape or Tab closes.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No matches",
  disabled = false,
  className,
  contentClassName,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q)
    );
  }, [options, query]);

  const openList = () => {
    if (disabled) return;
    setQuery("");
    // Start on the current value so Enter without moving keeps it.
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const pick = (option: SearchableSelectOption) => {
    onChange(option.value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Keep the active row in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openList();
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(Math.max(0, filtered.length - 1));
        break;
      case "Enter": {
        e.preventDefault();
        const option = filtered[activeIndex];
        if (option) pick(option);
        break;
      }
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-[10px] border border-border bg-theme-bg-elevated px-3.5 py-2 text-left text-sm text-theme-text transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon}
          <span className={cn("line-clamp-1", !selected && "text-theme-text-dim")}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-theme-text-dim" aria-hidden="true" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 z-50 mt-1 w-full min-w-[14rem] overflow-hidden rounded-md border border-border bg-theme-bg-card shadow-lg",
            contentClassName
          )}
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-theme-text-dim" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={searchPlaceholder}
              role="combobox"
              aria-expanded={true}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={filtered[activeIndex] ? optionId(activeIndex) : undefined}
              aria-label={ariaLabel ? `Search ${ariaLabel.toLowerCase()}` : "Search options"}
              className="w-full bg-transparent text-sm text-theme-text placeholder:text-theme-text-dim focus:outline-none"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" aria-label={ariaLabel} className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-theme-text-muted">{emptyText}</li>
            ) : (
              filtered.map((option, i) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isSelected}
                    // mousedown, not click: fires before the input blurs.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(option);
                    }}
                    onMouseMove={() => setActiveIndex(i)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-theme-text",
                      i === activeIndex && "bg-theme-bg-hover"
                    )}
                  >
                    <Check
                      className={cn("h-3.5 w-3.5 shrink-0 text-theme-primary", !isSelected && "invisible")}
                      aria-hidden="true"
                    />
                    {option.icon}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.hint && (
                        <span className="truncate text-xs text-theme-text-muted">{option.hint}</span>
                      )}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
