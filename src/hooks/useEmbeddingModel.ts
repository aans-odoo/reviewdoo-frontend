import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface AIModelConfig {
  id: string;
  usageType: "embedding" | "processing";
  isActive: boolean;
}

/**
 * Detects whether the current user has an active embedding model configured.
 * An embedding model is required to generate embeddings and to run the
 * similarity / semantic search used when creating review checklists.
 */
export function useEmbeddingModel(enabled: boolean = true) {
  const [hasEmbeddingModel, setHasEmbeddingModel] = useState(true);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // `/ai-model-configs` is an authenticated endpoint. When disabled (e.g. on a
    // publicly shared page viewed by an anonymous user) we skip the call so it
    // doesn't trigger a 401 → login redirect.
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/ai-model-configs");
      const configs: AIModelConfig[] = res.data.configs ?? [];
      setHasEmbeddingModel(
        configs.some((c) => c.usageType === "embedding" && c.isActive)
      );
    } catch {
      // On error, don't block the UI — let the server be the source of truth.
      setHasEmbeddingModel(true);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hasEmbeddingModel, loading, refresh };
}
