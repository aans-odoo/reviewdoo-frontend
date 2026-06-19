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
import {
  Bot,
  Cpu,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import { PipelineConfigBanner } from "@/components/pipeline/PipelineConfigBanner";

type UsageType = "processing" | "embedding";

interface IngestionAIConfigHealth {
  ok: boolean;
  missing: UsageType[];
}

interface IngestionAIPoolMember {
  configId: string;
  providerName: string;
  modelId: string;
  ownerEmail: string;
  usable: boolean;
}

interface IngestionAIConfig {
  processing: IngestionAIPoolMember[];
  embedding: IngestionAIPoolMember[];
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
  return `${option.providerName} / ${option.modelId} — ${option.ownerEmail}`;
}

export function IngestionAIConfigPage() {
  const [config, setConfig] = useState<IngestionAIConfig | null>(null);
  const [options, setOptions] = useState<IngestionAIConfigOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Ordered pools the admin is editing. Each holds AIModelConfig ids in
  // failover order (index 0 = primary).
  const [processingPool, setProcessingPool] = useState<string[]>([]);
  const [embeddingPool, setEmbeddingPool] = useState<string[]>([]);
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
      setProcessingPool(cfg.processing.map((m) => m.configId));
      setEmbeddingPool(cfg.embedding.map((m) => m.configId));
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

  const optionsById = useMemo(() => {
    const map = new Map<string, IngestionAIConfigOption>();
    for (const o of options) map.set(o.id, o);
    return map;
  }, [options]);

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

    if (processingPool.length === 0) {
      setError("Add at least one processing model to the pool");
      setSaving(false);
      return;
    }
    if (embeddingPool.length === 0) {
      setError("Add at least one embedding model to the pool");
      setSaving(false);
      return;
    }

    try {
      await api.put("/ingestion/ai-config", {
        processing: processingPool,
        embedding: embeddingPool,
      });
      setSuccess("Ingestion AI pool saved");
      await fetchAll();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save ingestion AI configuration"));
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    !!config &&
    (processingPool.join(",") !== config.processing.map((m) => m.configId).join(",") ||
      embeddingPool.join(",") !== config.embedding.map((m) => m.configId).join(","));

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

  return (
    <div className="space-y-6">
      <PipelineConfigBanner />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">
            Ingestion → AI Configuration
          </h2>
          <p className="mt-1 text-sm text-theme-text-muted">
            Build an ordered failover pool of processing and embedding models for the ingestion
            pipeline. Models are tried top-to-bottom; when one hits a rate limit (429), the
            pipeline automatically fails over to the next. Add keys from different providers or
            projects for the best resilience.
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
          <CardTitle>Failover Pools</CardTitle>
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
            <form onSubmit={handleSave} className="space-y-8">
              <PoolEditor
                title="Processing Models"
                description="Used for insight extraction and the qualification gate's AI fallback."
                icon={<Cpu className="h-4 w-4 text-theme-primary" />}
                pool={processingPool}
                setPool={setProcessingPool}
                options={processingOptions}
                optionsById={optionsById}
              />

              <PoolEditor
                title="Embedding Models"
                description="Used for deduplication and semantic search over checklists."
                icon={<Bot className="h-4 w-4 text-theme-primary" />}
                pool={embeddingPool}
                setPool={setEmbeddingPool}
                options={embeddingOptions}
                optionsById={optionsById}
              />

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={
                    saving ||
                    !dirty ||
                    processingPool.length === 0 ||
                    embeddingPool.length === 0
                  }
                >
                  {saving ? "Saving..." : "Save Pool"}
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

interface PoolEditorProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  pool: string[];
  setPool: React.Dispatch<React.SetStateAction<string[]>>;
  options: IngestionAIConfigOption[];
  optionsById: Map<string, IngestionAIConfigOption>;
}

function PoolEditor({
  title,
  description,
  icon,
  pool,
  setPool,
  options,
  optionsById,
}: PoolEditorProps) {
  const [toAdd, setToAdd] = useState<string>("");

  // Only offer configs that aren't already in the pool.
  const addable = useMemo(
    () => options.filter((o) => !pool.includes(o.id)),
    [options, pool]
  );

  const move = (index: number, delta: number) => {
    setPool((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: string) => setPool((prev) => prev.filter((x) => x !== id));

  const add = () => {
    if (!toAdd) return;
    setPool((prev) => (prev.includes(toAdd) ? prev : [...prev, toAdd]));
    setToAdd("");
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="flex items-center gap-2">{icon} {title}</Label>
        <p className="mt-1 text-xs text-theme-text-muted">{description}</p>
      </div>

      {pool.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border px-3 py-3 text-sm text-theme-text-muted">
          No models in the pool. Add at least one below.
        </div>
      ) : (
        <ol className="space-y-2">
          {pool.map((id, index) => {
            const opt = optionsById.get(id);
            // An entry can be in the pool but no longer in `options` if its
            // config was deactivated or its owner demoted — flag it.
            const stale = !opt;
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-sm border border-border bg-theme-bg-card px-3 py-2"
              >
                <Badge variant={index === 0 ? "purple" : "outline"} className="shrink-0">
                  {index === 0 ? "Primary" : `#${index + 1}`}
                </Badge>
                <div className="min-w-0 flex-1">
                  {opt ? (
                    <span className="text-sm text-theme-text">{describeOption(opt)}</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-theme-danger">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Unavailable config ({id.slice(0, 8)}…) — deactivated or owner demoted
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => move(index, 1)}
                    disabled={index === pool.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(id)}
                    aria-label="Remove from pool"
                  >
                    <X className="h-4 w-4 text-theme-danger" />
                  </Button>
                  {stale && <span className="sr-only">unavailable</span>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex items-center gap-2">
        <Select value={toAdd} onValueChange={setToAdd}>
          <SelectTrigger className="flex-1">
            <SelectValue
              placeholder={
                addable.length === 0
                  ? "No more eligible models to add"
                  : "Select a model to add"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {addable.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {describeOption(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="secondary" onClick={add} disabled={!toAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}
