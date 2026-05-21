import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import api from "@/lib/api";

/**
 * Pipeline-pages banner that surfaces missing or invalid ingestion
 * configuration.
 *
 * On mount it polls both health endpoints in parallel:
 *   - GET /ingestion/github-config     → { config: { credentialSet: boolean, ... } | null }
 *   - GET /ingestion/ai-config/health  → { ok: boolean, missing: ("processing"|"embedding")[] }
 *
 * Renders a warning banner with deep links to the config pages when either side
 * is missing or invalid. When both sides are healthy, renders nothing.
 */

type AIUsageType = "processing" | "embedding";

interface GitHubConfigResponse {
  config: {
    credentialSet: boolean;
    validationError?: string | null;
  } | null;
}

interface AIConfigHealthResponse {
  ok: boolean;
  missing: AIUsageType[];
}

interface BannerEntry {
  key: string;
  message: React.ReactNode;
  to: string;
  linkLabel: string;
}

export function PipelineConfigBanner() {
  const [entries, setEntries] = useState<BannerEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const next: BannerEntry[] = [];

      const [githubResult, aiResult] = await Promise.allSettled([
        api.get<GitHubConfigResponse>("/ingestion/github-config"),
        api.get<AIConfigHealthResponse>("/ingestion/ai-config/health"),
      ]);

      if (githubResult.status === "fulfilled") {
        const cfg = githubResult.value.data.config;
        if (!cfg || !cfg.credentialSet) {
          next.push({
            key: "github",
            message: (
              <>
                GitHub ingestion credential is not configured. Polling, historical, and webhook
                ingestion will be skipped until an admin sets it.
              </>
            ),
            to: "/ingestion/github-config",
            linkLabel: "Configure GitHub credential",
          });
        }
      }

      if (aiResult.status === "fulfilled") {
        const health = aiResult.value.data;
        if (!health.ok) {
          const sides =
            health.missing.length > 0
              ? health.missing.join(" and ")
              : "configuration";
          next.push({
            key: "ai",
            message: (
              <>
                Ingestion AI configuration is missing or invalid ({sides}). The pipeline cannot
                process new comments until both processing and embedding models are set.
              </>
            ),
            to: "/ingestion/ai-config",
            linkLabel: "Configure AI models",
          });
        }
      }

      if (!cancelled) {
        setEntries(next);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="alert" aria-live="polite">
      {entries.map((entry) => (
        <div
          key={entry.key}
          className="flex items-start gap-3 rounded-sm border border-theme-accent/30 bg-theme-accent/10 px-4 py-3 text-sm text-theme-accent-light"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-theme-accent-light"
            aria-hidden="true"
          />
          <div className="flex-1 space-y-1">
            <div>{entry.message}</div>
            <Link
              to={entry.to}
              className="inline-flex items-center text-theme-accent-light underline-offset-2 hover:underline"
            >
              {entry.linkLabel} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
