import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

/**
 * Shown when no active embedding model is configured. Embeddings are required
 * to create guidelines/checklists and to run similarity & semantic search.
 */
export function EmbeddingModelBanner({ action }: { action: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-theme-accent/30 bg-theme-accent/10 px-3 py-2 text-sm text-theme-accent-light">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        An active embedding model is required to {action}. Set one up in{" "}
        <Link to="/ai-config" className="font-medium underline hover:opacity-80">
          AI Config
        </Link>
        .
      </p>
    </div>
  );
}
