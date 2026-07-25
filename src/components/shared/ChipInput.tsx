import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Lowercase each value before storing (handy for languages). */
  lowercase?: boolean;
  id?: string;
  containerClasses?: string;
  inputClasses?: string;
  /** Muted helper text shown below the input to hint at multi-value entry. */
  hint?: string;
}

/**
 * A free-text, multi-value input. Type a value and press Enter (or click Add)
 * to add it as a chip; click the chip's X or press Backspace on an empty field
 * to remove. Commas are treated as literal characters so patterns may contain
 * them. Values are de-duplicated.
 */
export function ChipInput({
  values,
  onChange,
  placeholder = "Type and press Enter...",
  lowercase = false,
  id,
  containerClasses,
  inputClasses,
  hint = ""
}: ChipInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const removeButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  // Index of the chip's remove button to focus after the next render, set when
  // a chip is removed so keyboard focus stays within the control.
  const pendingFocusIndex = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFocusIndex.current === null) return;
    const index = pendingFocusIndex.current;
    pendingFocusIndex.current = null;
    // Focus the chip that shifted into the removed slot, the new last chip, or
    // fall back to the text input when no chips remain.
    removeButtonsRef.current.length = values.length;
    const target =
      removeButtonsRef.current[index] ??
      removeButtonsRef.current[values.length - 1] ??
      inputRef.current;
    target?.focus();
  }, [values]);

  const addValue = (raw: string) => {
    const value = (lowercase ? raw.toLowerCase() : raw).trim();
    if (!value) return;
    if (!values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  };

  const removeValue = (value: string, index?: number) => {
    if (index !== undefined) pendingFocusIndex.current = index;
    onChange(values.filter((v) => v !== value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue(draft);
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      removeValue(values[values.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", containerClasses)}>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <Badge
              key={value}
              variant="outline"
              className="max-w-full gap-1 pr-1"
              title={value}
            >
              <span className="min-w-0 truncate">{value}</span>
              <button
                type="button"
                ref={(el) => {
                  removeButtonsRef.current[index] = el;
                }}
                onClick={() => removeValue(value, index)}
                className="ml-0.5 shrink-0 rounded-full p-0.5 hover:bg-theme-bg-hover"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(draft.trim() && "pr-28", inputClasses)}
        />
        {draft.trim() && (
          <button
            type="button"
            onClick={() => {
              addValue(draft);
              // Keep focus in the input for continued entry.
              inputRef.current?.focus();
            }}
            className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-theme-border bg-theme-bg-card px-2 py-1 text-[10px] font-medium text-theme-text-muted hover:bg-theme-bg-hover"
            aria-label="Add pattern"
          >
            Add
            <span className="text-[8px]">(or press Enter)</span>
          </button>
        )}
      </div>
      {hint && (
        <p className="text-xs text-theme-text-muted">{hint}</p>
      )}
    </div>
  );
}
