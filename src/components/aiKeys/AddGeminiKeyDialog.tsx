import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/shared/Alert";
import { EncryptedBadge } from "@/components/aiKeys/EncryptedBadge";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import type { PoolKeyView } from "@/lib/aiKeys";

/** Result of a successful `POST /ai-keys`. */
export interface AddGeminiKeyResult {
  key: PoolKeyView;
  hasActiveKey: boolean;
}

interface AddGeminiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the key passed validation and was stored in the pool. */
  onAdded: (result: AddGeminiKeyResult) => void;
}

export const GEMINI_API_KEYS_URL = "https://aistudio.google.com/api-keys";

/**
 * Dialog for contributing a Gemini API key to the shared team pool.
 *
 * The typed key lives only in local component state: it is sent once in the
 * POST body and cleared on success and whenever the dialog closes. It is never
 * written to browser storage, URLs, or logs.
 */
export function AddGeminiKeyDialog({ open, onOpenChange, onAdded }: AddGeminiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Tracks whether the dialog is still open so a late error from a request
  // started before closing doesn't repopulate state after reset().
  const openRef = useRef(open);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setApiKey("");
    setReveal(false);
    setConsent(false);
    setError("");
  };

  // Clear everything whenever the dialog is closed, including when the parent
  // closes it by setting `open` to false directly.
  useEffect(() => {
    openRef.current = open;
    if (!open) reset();
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const canSubmit = consent && apiKey.trim().length > 0 && !saving;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post<AddGeminiKeyResult>("/ai-keys", {
        apiKey,
        consent: true,
      });
      reset();
      onAdded(data);
      onOpenChange(false);
    } catch (err: unknown) {
      if (openRef.current) {
        setError(getApiErrorMessage(err, "Failed to add key"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        // Focus the key input on open, not the Encrypted badge (which would open its tooltip).
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Contribute a Gemini key</DialogTitle>
          <DialogDescription className="text-xs">
            We check it with one quick embedding request, then add it to the team pool.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="space-y-2 mt-5 mb-10">
            <div className="flex items-center justify-between px-1 gap-2">
              <Label htmlFor="gemini-api-key">Gemini API Key</Label>
              <EncryptedBadge />
            </div>
            <div className="relative">
              <Input
                ref={inputRef}
                id="gemini-api-key"
                name="gemini-api-key"
                type={reveal ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza…"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={saving}
                className="pr-11 font-mono"
              />
              <button
                type="button"
                onClick={() => setReveal((r) => !r)}
                aria-label={reveal ? "Hide key" : "Show key"}
                aria-pressed={reveal}
                aria-controls="gemini-api-key"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-theme-text-muted transition-colors hover:bg-theme-bg-hover hover:text-theme-text focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                {reveal ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="text-xs text-theme-text-dim px-1">
              Get your{" "}
              <a
                href={GEMINI_API_KEYS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-theme-primary-light underline-offset-4 hover:underline"
              >
                Gemini API key here
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={setConsent}
              disabled={saving}
              className="mt-0.5"
            />
            <label htmlFor="consent" className="text-sm text-theme-text-muted">
              I'm sharing this key with the team pool, so its quota will be used for the whole
              team's embeddings.
            </label>
          </div>

          <DialogFooter className="-mx-5">
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {saving ? "Checking key…" : "Add to pool"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
