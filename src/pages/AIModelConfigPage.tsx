import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Alert } from "@/components/shared/Alert";
import { Plus, Pencil, Trash2, Zap, CircleDot, Bot, Cpu, Loader2, Activity, FlaskConical, CheckCircle2, XCircle, Power, Coins } from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { Loading } from "@/components/shared/Loading";

interface AIModelConfig {
  id: string;
  providerName: string;
  modelId: string;
  keySet: boolean;
  usageType: "embedding" | "processing";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  ok: boolean;
  usageType: "embedding" | "processing";
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
}

const PROVIDERS = ["gemini", "openrouter"];

export function AIModelConfigPage() {
  const [configs, setConfigs] = useState<AIModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogUsageType, setDialogUsageType] = useState<"embedding" | "processing">("embedding");
  const [editTarget, setEditTarget] = useState<AIModelConfig | null>(null);
  const [provider, setProvider] = useState("gemini");
  const [modelId, setModelId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AIModelConfig | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ai-model-configs");
      setConfigs(res.data.configs ?? res.data);
      setError("");
    } catch {
      setError("Failed to load AI model configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const openCreate = (type: "embedding" | "processing") => {
    setEditTarget(null);
    setDialogUsageType(type);
    setProvider("gemini");
    setModelId("");
    setApiKey("");
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (config: AIModelConfig) => {
    setEditTarget(config);
    setDialogUsageType(config.usageType);
    setProvider(config.providerName);
    setModelId(config.modelId);
    setApiKey("");
    setFormError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editTarget) {
        const body: Record<string, string | boolean> = { providerName: provider, modelId, usageType: dialogUsageType };
        if (apiKey) body.apiKey = apiKey;
        await api.put(`/ai-model-configs/${editTarget.id}`, body);
      } else {
        await api.post("/ai-model-configs", { providerName: provider, modelId, apiKey, usageType: dialogUsageType });
      }
      setDialogOpen(false);
      await fetchConfigs();
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, "Failed to save configuration"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/ai-model-configs/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchConfigs();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete configuration"));
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (config: AIModelConfig) => {
    setActivating(config.id);
    setError("");
    try {
      await api.put(`/ai-model-configs/${config.id}`, {
        isActive: true,
        providerName: config.providerName,
        modelId: config.modelId,
        usageType: config.usageType,
      });
      await fetchConfigs();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to activate configuration"));
    } finally {
      setActivating(null);
    }
  };

  const handleTest = async (config: AIModelConfig) => {
    setTesting(config.id);
    setError("");
    try {
      const res = await api.post(`/ai-model-configs/${config.id}/test`);
      const result: TestResult = res.data.result ?? res.data;
      setTestResults((prev) => ({ ...prev, [config.id]: result }));
    } catch (err: unknown) {
      setTestResults((prev) => ({
        ...prev,
        [config.id]: {
          ok: false,
          usageType: config.usageType,
          latencyMs: 0,
          message: getApiErrorMessage(err, "Failed to test model"),
        },
      }));
    } finally {
      setTesting(null);
    }
  };

  const embeddingConfigs = configs.filter((c) => c.usageType === "embedding");
  const processingConfigs = configs.filter((c) => c.usageType === "processing");

  const renderConfigCard = (config: AIModelConfig) => {
    const testResult = testResults[config.id];
    return (
      <Card
        key={config.id}
        className={config.isActive ? "border-theme-cyan/20 bg-theme-cyan/[0.03]" : ""}
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.isActive ? "bg-theme-accent/15" : "bg-theme-bg-elevated"}`}>
                {config.isActive ? (
                  <Zap className="h-4 w-4 text-theme-accent" />
                ) : (
                  <CircleDot className="h-4 w-4 text-theme-text-muted" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize text-theme-text">{config.providerName}</span>
                  <span className="text-theme-text-muted">|</span>
                  <span className="text-sm font-medium text-theme-text-muted">{config.modelId}</span>
                </div>
                <p className="mt-1 text-xs text-theme-text-muted">
                  Updated {new Date(config.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!config.isActive
                ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-theme-text-muted hover:text-theme-accent hover:bg-theme-accent/10"
                    onClick={() => handleActivate(config)}
                    disabled={activating === config.id}
                    aria-label="Set as active model"
                    title="Set as active model"
                  >
                    {activating === config.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                )
                : <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-theme-accent hover:text-theme-accent hover:bg-theme-accent/10 !opacity-100"
                  disabled
                  aria-label="Currently active model"
                  title="Currently active model"
                >
                  <Activity className="h-4 w-4" />
                </Button>
              }
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                onClick={() => handleTest(config)}
                disabled={testing === config.id}
                aria-label="Test model"
                title="Run a live test call against this model (consumes small amount of quota)"
              >
                {testing === config.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <FlaskConical className="h-4 w-4" />
                    <Coins
                      className="absolute right-0.5 top-0.5 h-3 w-3 text-amber-400"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(config)} aria-label="Edit config">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeleteTarget(config)}
                disabled={config.isActive}
                aria-label="Delete config"
                title={config.isActive ? "Cannot delete active config" : "Delete config"}
              >
                <Trash2 className={`h-4 w-4 ${config.isActive ? "text-theme-text-muted" : "text-theme-danger"}`} />
              </Button>
            </div>
          </div>
          {testResult && (
            <div
              className={`mt-3 flex items-start gap-2 rounded-sm border px-3 py-2 text-xs ${testResult.ok
                  ? "border-theme-cyan/25 bg-theme-cyan/[0.06] text-theme-text"
                  : "border-theme-danger/25 bg-theme-danger/10 text-theme-danger"
                }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-theme-accent" />
              ) : (
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="break-words">{testResult.message}</p>
                {testResult.ok && (
                  <p className="mt-0.5 text-theme-text-muted">Responded in {testResult.latencyMs} ms</p>
                )}
              </div>
              <button
                className="shrink-0 text-theme-text-muted hover:underline"
                onClick={() =>
                  setTestResults((prev) => {
                    const next = { ...prev };
                    delete next[config.id];
                    return next;
                  })
                }
              >
                Dismiss
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSection = (
    title: string,
    description: string,
    icon: React.ReactNode,
    sectionConfigs: AIModelConfig[],
    type: "embedding" | "processing"
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="text-sm font-medium text-theme-text">{title}</h3>
            <p className="text-xs text-theme-text-muted">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => openCreate(type)}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
      {sectionConfigs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-theme-text-muted">
              No {type} model configured.{" "}
              <button className="text-theme-primary hover:underline" onClick={() => openCreate(type)}>
                Add one
              </button>{" "}
              to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sectionConfigs.map(renderConfigCard)}
        </div>
      )}
    </div>
  );

  const dialogTitle = editTarget
    ? "Edit Model"
    : `Add ${dialogUsageType === "embedding" ? "Embedding" : "Processing"} Model`;

  const dialogDescription = editTarget
    ? "Update the model configuration. Leave API key blank to keep the current one."
    : `Configure a new ${dialogUsageType} model. It will be set as active automatically.`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">AI Model Configuration</h2>
        <p className="mt-1 text-sm text-theme-text-muted">
          Manage AI providers for embedding and processing. One model per type can be active at a time.
        </p>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError("")}>{error}</Alert>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="py-6 space-y-12">
          {renderSection(
            "Embedding Models",
            "Used for generating vector embeddings for semantic search",
            <Bot className="h-5 w-5 text-theme-primary" />,
            embeddingConfigs,
            "embedding"
          )}
          {renderSection(
            "Processing Models",
            "Used for insight extraction, analysis, and content generation",
            <Cpu className="h-5 w-5 text-theme-primary" />,
            processingConfigs,
            "processing"
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {formError && (
              <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{formError}</div>
            )}
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (<SelectItem key={p} value={p}><span className="capitalize">{p}</span></SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-model-id">Model ID</Label>
              <Input id="ai-model-id" placeholder="e.g. gemini-pro, gpt-4" value={modelId} onChange={(e) => setModelId(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-api-key">
                API Key {editTarget && <span className="text-theme-text-dim">(leave blank to keep current)</span>}
              </Label>
              <Input id="ai-api-key" type="password" placeholder={editTarget ? "••••••••" : "Enter API key"} value={apiKey} onChange={(e) => setApiKey(e.target.value)} required={!editTarget} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editTarget ? "Save Changes" : "Add Model"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete AI Model Config"
        description={`Are you sure you want to delete the ${deleteTarget?.providerName} (${deleteTarget?.modelId}) configuration? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
