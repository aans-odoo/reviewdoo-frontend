import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Network, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { McpConnectionDetails } from "@/components/shared/McpConnectionDetails";
import { getMcpUrl } from "@/lib/mcpConnection";
import { McpConfigSnippet } from "@/components/shared/McpConfigSnippet";

type ConnectionStatus =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "success"; toolCount: number }
  | { kind: "error"; message: string };

interface JsonRpcResponse {
  jsonrpc?: string;
  id?: number | string;
  result?: { tools?: unknown[] };
  error?: { code?: number; message?: string };
}

/**
 * Parses the body of a Streamable HTTP MCP response. The SDK answers with
 * `Content-Type: text/event-stream`, so the JSON-RPC payload arrives as a
 * `data: ...` line inside an SSE frame. If the server happens to return plain
 * JSON (some proxies normalize it), we fall back to JSON.parse on the raw text.
 */
function parseMcpResponseBody(body: string): JsonRpcResponse {
  const trimmed = body.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as JsonRpcResponse;
  }
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith("data:")) {
      const payload = line.slice("data:".length).trim();
      if (payload) {
        return JSON.parse(payload) as JsonRpcResponse;
      }
    }
  }
  throw new Error("Empty or unrecognized MCP response body");
}

export function McpConfigPage() {
  const { isAdmin } = useAuth();
  const mcpUrl = getMcpUrl();

  const stdioSnippet = JSON.stringify(
    {
      mcpServers: {
        reviewdoo: {
          command: "npx",
          args: ["-y", "mcp-remote", mcpUrl],
        },
      },
    },
    null,
    2,
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>({ kind: "idle" });

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleTestConnection = async () => {
    setConnection({ kind: "testing" });
    try {
      const response = await fetch(mcpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
      });

      const text = await response.text();

      if (!response.ok) {
        setConnection({
          kind: "error",
          message: `HTTP ${response.status} ${response.statusText}`.trim(),
        });
        return;
      }

      const parsed = parseMcpResponseBody(text);

      if (parsed.error) {
        setConnection({
          kind: "error",
          message: parsed.error.message ?? "Unknown MCP error",
        });
        return;
      }

      const tools = parsed.result?.tools ?? [];
      setConnection({ kind: "success", toolCount: tools.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reach MCP endpoint";
      setConnection({ kind: "error", message });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-theme-text">
          <Network className="h-6 w-6" />
          MCP Config
        </h2>
        <p className="mt-1 text-sm text-theme-text-muted">
          Register Reviewdoo as a remote MCP server in your AI IDE so it can fetch review checklists while reviewing your code.
        </p>
      </div>

      <McpConnectionDetails mcpUrl={mcpUrl} />

      <details className="group rounded-lg border border-border bg-theme-bg-card">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg p-5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-theme-text-muted group-open:rotate-90" />
          <span>
            <span className="block font-medium text-theme-text">Configuration files & other options</span>
            <span className="mt-1 block text-theme-text-muted">Optional setup for clients that use a config file or require stdio.</span>
          </span>
        </summary>
        <div className="min-w-0 space-y-6 border-t border-border p-4 sm:p-5">
          <section className="min-w-0 space-y-3">
            <h3 className="text-sm font-medium text-theme-text">JSON configuration</h3>
            <p className="text-sm leading-relaxed text-theme-text-muted">If your client uses a JSON configuration file, choose its format below and merge the entry into your existing configuration. Reload the client if needed.</p>
            <McpConfigSnippet mcpUrl={mcpUrl} />
          </section>
          <section className="min-w-0 space-y-3">
            <h3 className="text-sm font-medium text-theme-text">Stdio fallback</h3>
            <p className="text-sm leading-relaxed text-theme-text-muted">For clients that only support local stdio servers, use mcp-remote to connect to this URL. This option requires Node.js and npx on your machine.</p>
            <div className="min-w-0 rounded-md border border-border bg-theme-bg-elevated">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
                <span className="text-xs font-medium text-theme-text-muted">JSON · mcp-remote</span>
                <Button variant="ghost" size="sm" className="h-7 gap-2" onClick={() => handleCopy("stdio", stdioSnippet)}>
                  {copiedKey === "stdio" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === "stdio" ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="overflow-auto whitespace-pre p-4 font-mono text-sm text-theme-text-muted">{stdioSnippet}</pre>
            </div>
          </section>
        </div>
      </details>

      {isAdmin && (
      <Card>
        <CardHeader>
          <CardTitle>Test connection</CardTitle>
          <CardDescription>
            Verify the MCP endpoint is reachable from your browser. This sends a <code>tools/list</code> request to{" "}
            <code className="break-all">{mcpUrl}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3" aria-live="polite">
          <Button onClick={handleTestConnection} disabled={connection.kind === "testing"}>
            {connection.kind === "testing" ? "Testing..." : "Test connection"}
          </Button>

          {connection.kind === "success" && (
            <div className="rounded-sm bg-theme-success/10 border border-theme-success/25 px-3 py-2 text-sm text-theme-success">
              Connected — {connection.toolCount} tool{connection.toolCount === 1 ? "" : "s"} available
            </div>
          )}

          {connection.kind === "error" && (
            <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
              {connection.message}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
