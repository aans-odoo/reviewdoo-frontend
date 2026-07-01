import { useState, KeyboardEvent } from "react";
import { Plus, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ReferenceDraft {
  id?: string;
  url: string;
  description?: string;
}

interface ReferenceInputProps {
  values: ReferenceDraft[];
  onChange: (values: ReferenceDraft[]) => void;
  className?: string;
}

/**
 * Add references one at a time (URL + optional description). Each added
 * reference shows as a chip with a remove button. Replaces the old
 * one-URL-per-line textarea with an explicit add/remove flow.
 */
export function ReferenceInput({ values, onChange, className }: ReferenceInputProps) {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const addReference = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    if (values.some((r) => r.url === trimmedUrl)) {
      setUrl("");
      setDescription("");
      return;
    }
    const trimmedDesc = description.trim();
    onChange([...values, { url: trimmedUrl, description: trimmedDesc || undefined }]);
    setUrl("");
    setDescription("");
  };

  const removeReference = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addReference();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {values.length > 0 && (
        <ul className="space-y-1.5">
          {values.map((ref, index) => (
            <li
              key={`${ref.url}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-theme-bg-elevated px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 shrink-0 text-theme-text-dim" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-theme-text">{ref.url}</p>
                  {ref.description && (
                    <p className="truncate text-xs text-theme-text-dim">{ref.description}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeReference(index)}
                className="shrink-0 rounded-full p-1 hover:bg-theme-bg-hover"
                aria-label={`Remove ${ref.url}`}
              >
                <X className="h-3.5 w-3.5 text-theme-danger" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="https://example.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          className="sm:flex-1"
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          className="sm:flex-1"
        />
        <Button type="button" variant="outline" onClick={addReference} disabled={!url.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
