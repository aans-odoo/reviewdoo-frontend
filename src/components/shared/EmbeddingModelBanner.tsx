import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface EmbeddingModelBannerProps {
  /** The message to display before the "Set one up in AI Config" link. */
  message: string;
}

/**
 * Shown when no active embedding model is configured.
 */
export function EmbeddingModelBanner({ message }: EmbeddingModelBannerProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-theme-accent/30 bg-theme-accent/10 px-3 py-2 text-sm text-theme-accent-light">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        {message} Set one up in{" "}
        <Link
          to="/ai-config"
          state={{ openAddEmbedding: true }}
          className="font-medium underline hover:opacity-80"
        >
          AI Config
        </Link>
        .
      </p>
    </div>
  );
}
