import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMcpUrl } from "@/lib/mcpConnection";

/** Connection settings shared by onboarding and the MCP configuration page. */
export function McpConnectionDetails({ mcpUrl = getMcpUrl() }: { mcpUrl?: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const copyUrl = async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopyState("copied");
      resetTimer.current = setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-theme-bg-elevated relative bg-gradient-to-br from-theme-bg-card via-theme-bg-elevated to-theme-bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(192,85,165,0.15),transparent_70%)] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(155,230,85,0.1),transparent_70%)] opacity-10" />
      <div className="space-y-4 p-5 sm:p-6 relative z-10">
        <dl className="divide-y divide-border text-sm">
          <div className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-theme-text-muted">Server name</dt>
            <dd>
              <p className="font-medium text-theme-text">Reviewdoo</p>
              <p className="mt-1 leading-relaxed text-theme-text-muted">(or anything you like)</p>
            </dd>
          </div>
          <div className="grid gap-2 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-theme-text-muted">Server URL</dt>
            <dd className="min-w-0 space-y-3">
              <div className="relative">
                <div className="bg-theme-bg/30 border rounded-sm pl-4 pr-2 py-2 flex items-center justify-between">
                  <p className="font-mono">{mcpUrl}</p>
                  <Button type="button" variant="outline" size="sm" onClick={copyUrl} className="rounded-sm">
                    {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copyState === "copied" ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
              <p role="status" className={copyState === "error" ? "text-theme-danger" : "sr-only"}>
                {copyState === "error" ? "Couldn’t copy. Select the URL above and copy it manually." : copyState === "copied" ? "Server URL copied to clipboard." : ""}
              </p>
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-theme-text-muted">Type / transport</dt>
            <dd>
              <p className="font-medium text-theme-text">Streamable HTTP</p>
              <p className="mt-1 leading-relaxed text-theme-text-muted">A remote server over HTTP. If your IDE calls this HTTP, choose that option. Do not select SSE or stdio.</p>
            </dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-theme-text-muted">Authentication</dt>
            <dd>
              <p className="font-medium text-theme-text">None / No authentication</p>
              <p className="mt-1 leading-relaxed text-theme-text-muted">Leave API keys, tokens, and custom headers empty.</p>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
