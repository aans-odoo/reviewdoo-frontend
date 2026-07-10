import { useState, useRef, useEffect, useMemo, KeyboardEvent } from "react";
import { Check, ChevronDown, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  /**
   * Optional create handler. When provided and the query has no exact match,
   * a "Create" row is shown. Should persist the new option and return it so it
   * can be selected immediately (even before the parent's option list updates).
   */
  onCreate?: (label: string) => Promise<MultiSelectOption | void>;
  containerClasses?: string;
  selectClasses?: string;
  disabled?: boolean;
}

/**
 * A chip-style multi-select: the trigger shows selected values as removable
 * badges; the dropdown offers a searchable, checkbox-style option list with an
 * optional inline "create" action. Built without extra dependencies, in the
 * same custom-dropdown style used elsewhere in the app.
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  emptyText = "No options found.",
  onCreate,
  containerClasses,
  selectClasses,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdOptions, setCreatedOptions] = useState<MultiSelectOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Merge parent options with any locally created ones so freshly created
  // values resolve to a label immediately.
  const allOptions = useMemo(() => {
    const map = new Map<string, string>();
    [...options, ...createdOptions].forEach((o) => map.set(o.value, o.label));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [options, createdOptions]);

  const labelFor = (value: string) =>
    allOptions.find((o) => o.value === value)?.label ?? value;

  const filtered = allOptions.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const exactMatch = allOptions.some(
    (o) => o.label.toLowerCase() === query.trim().toLowerCase()
  );
  const canCreate = !!onCreate && query.trim().length > 0 && !exactMatch;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const remove = (value: string) => onChange(selected.filter((v) => v !== value));

  const handleCreate = async () => {
    if (!onCreate || !query.trim() || creating) return;
    setCreating(true);
    try {
      const created = await onCreate(query.trim());
      if (created) {
        setCreatedOptions((prev) => [...prev, created]);
        if (!selected.includes(created.value)) {
          onChange([...selected, created.value]);
        }
      }
      setQuery("");
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canCreate) {
        handleCreate();
      } else if (filtered.length > 0) {
        toggle(filtered[0].value);
        setQuery("");
      }
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      remove(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", containerClasses)}>
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-border bg-theme-bg-elevated px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
          disabled && "cursor-not-allowed opacity-50",
          selectClasses
        )}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-theme-text-dim">{placeholder}</span>
          ) : (
            selected.map((value) => (
              <Badge key={value} variant="secondary" className="gap-1 pr-1">
                {labelFor(value)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(value);
                  }}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-theme-bg-hover"
                  aria-label={`Remove ${labelFor(value)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="rounded p-0.5 text-theme-text-dim hover:text-theme-text"
              aria-label="Clear all"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-theme-text-dim" />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-theme-bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full bg-transparent px-1 text-sm text-theme-text placeholder:text-theme-text-dim focus:outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-theme-text hover:bg-theme-bg-hover"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      isSelected
                        ? "border-theme-primary bg-theme-primary text-white"
                        : "border-border"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  {option.label}
                </button>
              );
            })}
            {filtered.length === 0 && !canCreate && (
              <p className="px-3 py-2 text-sm text-theme-text-muted">{emptyText}</p>
            )}
            {canCreate && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-theme-primary hover:bg-theme-bg-hover disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {creating ? "Creating..." : `Create "${query.trim()}"`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
