import { useState, useEffect, FormEvent, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Cpu, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import api from "@/lib/api";
import { PipelineConfigBanner } from "@/components/pipeline/PipelineConfigBanner";

type UsageType = "processing" | "embedding";

interface IngestionAIConfigHealth {
  ok: boolean;
  missing: UsageType[];
}

interface IngestionAIConfig {
  processingConfigId: string | null;
  embeddingConfigId: string | null;
  health: IngestionAIConfigHealth;
}

interface IngestionAIConfigOption {
  id: string;
  providerName: string;
  modelId: string;
  usageType: UsageType;
  ownerUserId: string;
  ownerEmail: string;
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  const axErr = err as { response?: { data?: { error?: { message?: string } } } };
  return axErr.response?.data?.error?.message ?? fallback;
}

function describeOption(option: IngestionAIConfigOption): string {
  return `${option.ownerEmail} — ${option.providerName} / ${option.modelId}`;
}

export function IngestionAIConfigPage() {
  const [config, setConfig] = useState<IngestionAIConfig | null>(null);
  const [options, setOptions] = useState<IngestionAIConfigOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [processingConfigId, setProcessingConfigId] = useState<string>("");
  const [embeddingConfigId, setEmbeddingConfigId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [configRes, optionsRes, healthRes] = await Promise.all([
        api.get<{ config: IngestionAIConfig }>("/ingestion/ai-config"),
        api.get<{ options: IngestionAIConfigOption[] }>("/ingestion/ai-config/options"),
        api.get<IngestionAIConfigHealth>("/ingestion/ai-config/health"),
      ]);
      const cfg: IngestionAIConfig = {
        ...configRes.data.config,
        // Prefer the freshest /health response for the badge.
        health: healthRes.data,
      };
      setConfig(cfg);
      setOptions(optionsRes.data.options ?? []);
      setProcessingConfigId(cfg.processingConfigId ?? "");
      setEmbeddingConfigId(cfg.embeddingConfigId ?? "");
      setError("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load ingestion AI configuration"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const processingOptions = useMemo(
    () => options.filter((o) => o.usageType === "processing"),
    [options]
  );
  const embeddingOptions = useMemo(
    () => options.filter((o) => o.usageType === "embedding"),
    [options]
  );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!processingConfigId) {
      setError("Select a processing model");
      setSaving(false);
      return;
    }
    if (!embeddingConfigId) {
      setError("Select an embedding model");
      setSaving(false);
      return;
    }

    try {
      await api.put("/ingestion/ai-config", {
        processingConfigId,
        embeddingConfigId,
      });
      setSuccess("Ingestion AI configuration saved");
      await fetchAll();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save ingestion AI configuration"));
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    !!config &&
    (processingConfigId !== (config.processingConfigId ?? "") ||
      embeddingConfigId !== (config.embeddingConfigId ?? ""));

  const renderHealthBadge = () => {
    if (!config) return null;
    if (config.health.ok) {
      return (
        <Badge variant="green">
          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Configured
        </Badge>
      );
    }
    return (
      <Badge variant="red">
        <ShieldAlert className="mr-1 h-3.5 w-3.5" />
        Missing: {config.health.missing.join(", ") || "config"}
      </Badge>
    );
  };

  const renderSelect = (
    id: string,
    value: string,
    onChange: (v: string) => void,
    list: IngestionAIConfigOption[],
    placeholder: string
  ) => {
    if (list.length === 0) {
      return (
        <div className="rounded-sm border border-dashed border-border px-3 py-3 text-sm text-theme-text-muted">
          No active {id.includes("processing") ? "processing" : "embedding"} configurations from
          admin users yet. Have an admin add one on the AI Config page.
        </div>
      );
    }
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {list.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              <span className="flex items-center gap-2">
                <span>{describeOption(opt)}</span>
                {opt.id === value && (
                  <Badge variant="purple" className="ml-1">
                    Current
                  </Badge>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="space-y-6">
      <PipelineConfigBanner />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">
            Ingestion → AI Configuration
          </h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Choose the processing and embedding AI models the ingestion pipeline uses for every
            polling, historical, and webhook-sourced comment. Both must be active configurations
            owned by an active admin user.
          </p>
        </div>
        <div>{renderHealthBadge()}</div>
      </div>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-sm bg-theme-success/10 border border-theme-success/25 px-3 py-2 text-sm text-theme-success">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Models</CardTitle>
          <CardDescription>
            Selections take effect immediately for new ingestion work. Existing in-flight cycles
            finish on whatever they started with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-theme-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="ingestion-processing-config"
                  className="flex items-center gap-2"
                >
                  <Cpu className="h-4 w-4 text-theme-primary" /> Processing Model
                </Label>
                <p className="text-xs text-theme-text-muted">
                  Used for insight extraction and qualification gate AI fallback.
                </p>
                {renderSelect(
                  "ingestion-processing-config",
                  processingConfigId,
                  setProcessingConfigId,
                  processingOptions,
                  "Select processing model"
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="ingestion-embedding-config"
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4 text-theme-primary" /> Embedding Model
                </Label>
                <p className="text-xs text-theme-text-muted">
                  Used for deduplication and semantic search over checklists.
                </p>
                {renderSelect(
                  "ingestion-embedding-config",
                  embeddingConfigId,
                  setEmbeddingConfigId,
                  embeddingOptions,
                  "Select embedding model"
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={
                    saving ||
                    !dirty ||
                    !processingConfigId ||
                    !embeddingConfigId
                  }
                >
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
                {dirty && !saving && (
                  <span className="text-xs text-theme-text-muted">Unsaved changes</span>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
