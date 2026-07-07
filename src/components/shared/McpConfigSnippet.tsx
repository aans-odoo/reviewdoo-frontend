import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IDE_CONFIGS, DEFAULT_IDE_ID, getIdeConfig } from "@/lib/mcpIdeConfigs";

interface McpConfigSnippetProps {
  /** Override the MCP endpoint URL (defaults to VITE_API_URL or current origin) */
  mcpUrl?: string;
  /** Hide the IDE selector and lock to a specific IDE */
  ideId?: string;
}

export function McpConfigSnippet({ mcpUrl, ideId }: McpConfigSnippetProps) {
  const resolvedUrl = mcpUrl ?? `${import.meta.env.VITE_API_URL || window.location.origin}/mcp`;
  const [selectedIde, setSelectedIde] = useState(ideId ?? DEFAULT_IDE_ID);
  const [copied, setCopied] = useState(false);

  const ide = getIdeConfig(selectedIde);
  const snippet = JSON.stringify(ide.buildConfig(resolvedUrl), null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-md border border-border bg-theme-bg-elevated">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-theme-text-muted">mcp.json</span>
          {!ideId && (
            <Select value={selectedIde} onValueChange={setSelectedIde}>
              <SelectTrigger className="h-7 w-auto min-w-[160px] rounded-md border-border bg-theme-bg-card text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IDE_CONFIGS.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 gap-2" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-auto whitespace-pre p-4 text-sm text-theme-text-muted font-mono">
        {snippet}
      </pre>
    </div>
  );
}
