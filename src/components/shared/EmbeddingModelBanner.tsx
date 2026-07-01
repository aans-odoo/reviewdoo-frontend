import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface EmbeddingModelBannerProps {
  /** The entity name, e.g. "guidelines" or "review checklists" */
  entity: string;
  /** Current search type selection */
  searchType: "text" | "semantic";
}

/**
 * Shown when no active embedding model is configured. The message adapts based
 * on the current search type selection.
 */
export function EmbeddingModelBanner({ entity, searchType }: EmbeddingModelBannerProps) {
  const message =
    searchType === "semantic"
      ? `An active embedding model is required to add ${entity} or perform semantic search.`
      : `An active embedding model is required to add ${entity}.`;

  return (
    <div className="flex items-start gap-2 rounded-md border border-theme-accent/30 bg-theme-accent/10 px-3 py-2 text-sm text-theme-accent-light">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        {message} Set one up in{" "}
        <Link to="/ai-config" className="font-medium underline hover:opacity-80">
          AI Config
        </Link>
        .
      </p>
    </div>
  );
}
