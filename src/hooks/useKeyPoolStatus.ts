import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { KeyPoolStatus, MigrationNotice } from "@/lib/aiKeys";

const EMPTY_NOTICE: MigrationNotice = { pending: false, keys: [] };

/**
 * Reports whether the team Key_Pool has at least one Active Gemini key, and
 * whether the current user still has a pending migration notice for keys
 * carried over into the pool.
 */
export function useKeyPoolStatus(enabled: boolean = true) {
  const [hasActiveKey, setHasActiveKey] = useState(true);
  const [migrationNotice, setMigrationNotice] =
    useState<MigrationNotice>(EMPTY_NOTICE);
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
      setMigrationNotice(res.data.migrationNotice ?? EMPTY_NOTICE);
    } catch {
      // On error, don't block the UI: the server stays the source of truth.
      setHasActiveKey(true);
      setMigrationNotice(EMPTY_NOTICE);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hasActiveKey, migrationNotice, loading, refresh };
}
