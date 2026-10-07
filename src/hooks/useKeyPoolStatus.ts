import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { KeyPoolStatus } from "@/lib/aiKeys";

/**
 * Reports whether the team Key_Pool has at least one Active Gemini key.
 */
export function useKeyPoolStatus(enabled: boolean = true) {
  const [hasActiveKey, setHasActiveKey] = useState(true);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // `/ai-keys/status` is authenticated. When disabled (e.g. an anonymous user
    // on a publicly shared page) skip the call so it doesn't trigger a
    // 401 → login redirect.
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get<KeyPoolStatus>("/ai-keys/status");
      setHasActiveKey(res.data.hasActiveKey);
    } catch {
      // On error, don't block the UI: the server stays the source of truth.
      setHasActiveKey(true);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hasActiveKey, loading, refresh };
}
