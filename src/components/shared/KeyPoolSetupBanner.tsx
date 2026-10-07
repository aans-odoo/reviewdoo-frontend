import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/** sessionStorage key holding the per-user dismissal flag. */
function dismissKey(userId: string): string {
  return `reviewdoo:setupBannerDismissed:${userId}`;
}

function readDismissed(userId: string | undefined): boolean {
  if (!userId) return false;
  try {
    return sessionStorage.getItem(dismissKey(userId)) === "1";
  } catch {
    return false;
  }
}

/**
 * Shown on the Review Checklists page while the key pool has no active key
 * (Requirements 1.6–1.8). The parent decides visibility from `hasActiveKey`;
 * this component only handles the per-session, per-user dismissal.
 */
export function KeyPoolSetupBanner() {
  const { user } = useAuth();
  const userId = user?.id;
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  if (dismissedFor === (userId ?? "") || readDismissed(userId)) return null;

  const handleDismiss = () => {
    if (userId) {
      try {
        sessionStorage.setItem(dismissKey(userId), "1");
      } catch {
        // sessionStorage unavailable: still hide for the current render tree.
      }
    }
    setDismissedFor(userId ?? "");
  };

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-md border border-theme-accent/30 bg-theme-accent/10 px-3 py-2 text-sm text-theme-accent-light"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        Semantic search and duplicate detection are off. Add a Gemini key in{" "}
        <Link to="/ai-config" className="font-medium underline hover:opacity-80">
          AI Keys
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss setup banner"
        className="shrink-0 rounded p-0.5 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
