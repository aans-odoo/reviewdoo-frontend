import api from "@/lib/api";

/** Mirrors `ActivityLogView` in backend/src/services/activityService.ts. */
export type ActivityActorKind = "user" | "guest" | "system";

export type ActivityCategory = "navigation" | "auth" | "search" | "checklist" | "mcp" | "system";

export interface ActivityLogItem {
  id: string;
  event: string;
  actorKind: ActivityActorKind;
  actor: { id: string; name: string; email: string; avatarUrl: string } | null;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  geo: {
    country: string | null;
    countryCode: string | null;
    region: string | null;
    city: string | null;
  };
  createdAt: string;
}

/** Regional-indicator flag emoji for a 2-letter ISO country code, else null. */
export function flagEmoji(countryCode: string | null): string | null {
  if (!countryCode || !/^[A-Za-z]{2}$/.test(countryCode)) return null;
  const base = 0x1f1e6;
  const cc = countryCode.toUpperCase();
  return String.fromCodePoint(
    base + (cc.charCodeAt(0) - 65),
    base + (cc.charCodeAt(1) - 65),
  );
}

export interface ActivityListResponse {
  items: ActivityLogItem[];
  total: number;
}

export interface ActivityEventDefinition {
  event: string;
  label: string;
  category: ActivityCategory;
}

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  navigation: "Navigation",
  auth: "Auth",
  search: "Search",
  checklist: "Checklists",
  mcp: "MCP",
  system: "System",
};

let lastTracked: { path: string; at: number } | null = null;
/** Same path within this window is treated as a duplicate (StrictMode, re-renders). */
const DEDUPE_MS = 1000;

/**
 * Reports a page view. Only the pathname is sent: query strings can carry
 * one-time tokens (account setup, password reset). Fire-and-forget: errors
 * are ignored so tracking never affects navigation.
 */
export function trackPageView(pathname: string): void {
  const now = Date.now();
  if (lastTracked && lastTracked.path === pathname && now - lastTracked.at < DEDUPE_MS) return;
  lastTracked = { path: pathname, at: now };
  api.post("/activity/page-view", { path: pathname }).catch(() => undefined);
}
