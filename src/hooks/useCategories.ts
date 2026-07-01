import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface CategoryItem {
  id: string;
  name: string;
  checklistCount?: number;
}

/**
 * Loads the admin-managed review checklist categories. Returns a `refresh`
 * callback so callers can re-fetch after a create/edit/delete.
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories ?? []);
    } catch {
      // Silent: the dropdown simply renders whatever it already has.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, refresh };
}
