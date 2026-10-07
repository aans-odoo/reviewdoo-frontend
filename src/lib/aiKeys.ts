/**
 * Frontend types for the AI Keys API (`/api/v1/ai-keys`).
 * Mirrors `backend/src/types/api.ts` and `backend/src/providers/geminiClient.ts`.
 */

/** Category of a Gemini call failure, as recorded on a Pool_Key. */
export type GeminiErrorCategory =
  | "rate_limited"
  | "key_rejected"
  | "upstream_unavailable"
  | "network"
  | "unexpected_response";

/** Plain-language reason a key failed validation or a re-check. */
export type KeyFailureReason =
  | "Key rejected by Gemini"
  | "Quota exceeded"
  | "Gemini unreachable"
  | "Unexpected response from Gemini";

/** Pool_Key as exposed by the API. Only the Key_Hint is ever sent. */
export interface PoolKeyView {
  id: string;
  keyHint: string;
  status: "active" | "invalid";
  createdAt: string;
  lastUsedAt: string | null;
  lastErrorCategory: GeminiErrorCategory | null;
  lastErrorAt: string | null;
  coolingDownUntil: string | null;
}

/** Pool_Key with its Owner, sent to Admins only in the "All keys" list. */
export interface PoolKeyAdminView extends PoolKeyView {
  owner: { id: string; name: string; email: string; avatarUrl: string };
}

/** Indexer progress shown in the Admin Indexing panel. */
export interface IndexerStatus {
  indexed: number;
  total: number;
  running: boolean;
  lastRun: {
    endedAt: string;
    failed: number;
    stopReason: "completed" | "no_active_key" | "keys_busy";
  } | null;
}

/** Response of `GET /ai-keys/status`. */
export interface KeyPoolStatus {
  hasActiveKey: boolean;
}

/** Response of `GET /ai-keys`. `allKeys` is present for Admins only. */
export interface KeyPoolListResponse {
  hasActiveKey: boolean;
  myKeys: PoolKeyView[];
  allKeys?: PoolKeyAdminView[];
}

/** Mirrors `backend/src/config/embedding.ts`. Display only. */
export const EMBEDDING_MODEL = "gemini-embedding-001";
/** Mirrors the backend per-user limit in `keyPoolService.ts`. */
export const MAX_KEYS_PER_USER = 5;
