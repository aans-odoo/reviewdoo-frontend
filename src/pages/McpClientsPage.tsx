import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/shared/Alert";
import { Loading } from "@/components/shared/Loading";
import { Radio, Wifi, WifiOff, Globe, Monitor, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A tracked MCP client as reported by the backend. `connected` means it's had
 * activity within the backend's active window; otherwise it's a
 * previously-seen client kept across restarts until it's pruned.
 */
interface McpClient {
  clientKey: string;
  clientName: string | null;
  clientVersion: string | null;
  protocolVersion: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  connectedAt: string;
  lastSeenAt: string;
  connected: boolean;
}

const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api/v1`;

function relativeTime(iso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function McpClientsPage() {
  const [clients, setClients] = useState<McpClient[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be signed in to view connected clients.");
      setInitialLoad(false);
      return;
    }

    const url = `${API_BASE}/mcp-clients/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("clients", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as McpClient[];
        setClients(data);
        setError("");
      } catch {
        // Ignore malformed frames
      } finally {
        setInitialLoad(false);
      }
    });

    es.onopen = () => {
      setConnected(true);
      setInitialLoad(false);
    };

    es.onerror = () => {
      setConnected(false);
      setInitialLoad(false);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  // Tick every second so relative timestamps stay fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const connectedCount = clients.filter((c) => c.connected).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">
            Connected MCP Clients
          </h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Live view of IDEs connected to your MCP server, based on real-time
            activity. The list resets on server restart and repopulates as
            clients reconnect.
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
            connected
              ? "border-theme-success/30 bg-theme-success/10 text-theme-success"
              : "border-border bg-theme-bg-elevated text-theme-text-muted"
          )}
        >
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? "Live" : "Reconnecting…"}
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {initialLoad ? (
        <Loading />
      ) : clients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <Radio className="h-8 w-8 text-theme-text-dim" />
          <div>
            <p className="text-sm font-medium text-theme-text">No clients yet</p>
            <p className="mt-1 text-sm text-theme-text-muted">
              When an IDE connects to your Reviewdoo MCP server, it'll appear here in real time.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="text-sm text-theme-text-muted">
            {connectedCount} connected
            {clients.length > connectedCount &&
              ` · ${clients.length - connectedCount} previously seen`}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {clients.map((client) => (
              <ClientCard key={client.clientKey} client={client} now={now} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ClientCard({ client, now }: { client: McpClient; now: number }) {
  const isConnected = client.connected;

  return (
    <Card className={cn("p-4", !isConnected && "opacity-70")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            {isConnected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-theme-success opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                isConnected ? "bg-theme-success" : "bg-theme-text-dim"
              )}
            />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-theme-text">
              {client.clientName || "Unknown IDE"}
            </div>
            {client.clientVersion && (
              <div className="text-xs text-theme-text-dim">v{client.clientVersion}</div>
            )}
          </div>
        </div>
        <Badge variant={isConnected ? "green" : "outline"}>
          {isConnected ? "Connected" : `Seen ${relativeTime(client.lastSeenAt, now)}`}
        </Badge>
      </div>

      <div className="mt-4 space-y-2.5 text-xs text-theme-text-muted">
        <Detail icon={Globe} label="IP Address" value={client.ipAddress ?? "Unknown"} />
        <Detail icon={Monitor} label="Protocol" value={client.protocolVersion ?? "Unknown"} />
        <Detail icon={Clock} label="Connected at" value={formatTime(client.connectedAt)} />
        <Detail icon={Clock} label="Last activity" value={relativeTime(client.lastSeenAt, now)} />
      </div>

      {client.userAgent && (
        <div
          className="mt-3 truncate border-t border-border pt-3 text-[11px] text-theme-text-dim"
          title={client.userAgent}
        >
          {client.userAgent}
        </div>
      )}
    </Card>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-theme-text-dim">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="truncate font-medium text-theme-text" title={value}>
        {value}
      </span>
    </div>
  );
}
