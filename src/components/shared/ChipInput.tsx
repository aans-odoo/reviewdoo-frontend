import { useState, KeyboardEvent } from "react";
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
}

/**
 * A free-text, multi-value input. Type a value and press Enter (or comma) to
 * add it as a chip; click the chip's X or press Backspace on an empty field to
 * remove. Values are de-duplicated. Replaces brittle comma-separated text
 * fields with a clearer add/remove interaction.
 */
export function ChipInput({
  values,
  onChange,
  placeholder = "Type and press Enter...",
  lowercase = false,
  id,
  containerClasses,
  inputClasses
}: ChipInputProps) {
  const [draft, setDraft] = useState("");

  const addValue = (raw: string) => {
    const value = (lowercase ? raw.toLowerCase() : raw).trim();
    if (!value) return;
    if (!values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  };

  const removeValue = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
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
          {values.map((value) => (
            <Badge key={value} variant="outline" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-theme-bg-hover"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        id={id}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addValue(draft)}
        className={inputClasses}
      />
    </div>
  );
}
