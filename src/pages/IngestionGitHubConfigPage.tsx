import { useState, useEffect, FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Github, ShieldCheck, ShieldAlert, Loader2, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/api";
import { PipelineConfigBanner } from "@/components/pipeline/PipelineConfigBanner";

type CredentialKind = "pat" | "app_installation";

interface IngestionGitHubConfig {
  credentialKind: CredentialKind;
  allowedScopes: string[];
  credentialSet: boolean;
  validatedAt: string | null;
  validationError: string | null;
}

interface TestResult {
  ok: boolean;
  identity?: string;
  error?: string;
}

const CREDENTIAL_KIND_LABEL: Record<CredentialKind, string> = {
  pat: "Personal Access Token",
  app_installation: "GitHub App Installation",
};

function getApiErrorMessage(err: unknown, fallback: string): string {
  const axErr = err as { response?: { data?: { error?: { message?: string } } } };
  return axErr.response?.data?.error?.message ?? fallback;
}

function parseScopes(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function IngestionGitHubConfigPage() {
  const [config, setConfig] = useState<IngestionGitHubConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [credentialKind, setCredentialKind] = useState<CredentialKind>("pat");
  const [credential, setCredential] = useState("");
  const [scopesInput, setScopesInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ config: IngestionGitHubConfig | null }>(
        "/ingestion/github-config"
      );
      const data = res.data.config;
      setConfig(data);
      if (data) {
        setCredentialKind(data.credentialKind);
        setScopesInput(data.allowedScopes.join(", "));
      }
      setError("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load GitHub ingestion configuration"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const buildBody = () => ({
    credentialKind,
    credential,
    allowedScopes: parseScopes(scopesInput),
  });

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    setTestResult(null);

    if (!credential.trim()) {
      setError("Credential is required to save the configuration");
      setSaving(false);
      return;
    }

    try {
      await api.put("/ingestion/github-config", buildBody());
      setCredential("");
      setSuccess("GitHub ingestion configuration saved");
      await fetchConfig();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save GitHub ingestion configuration"));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError("");
    setSuccess("");
    setTestResult(null);
    try {
      // Send the form values when a credential has been entered; otherwise the
      // backend falls back to the stored credential.
      const trimmed = credential.trim();
      const body = trimmed ? buildBody() : {};
      const res = await api.post<TestResult>("/ingestion/github-config/test", body);
      setTestResult(res.data);
    } catch (err: unknown) {
      setTestResult({ ok: false, error: getApiErrorMessage(err, "Test connection failed") });
    } finally {
      setTesting(false);
    }
  };

  const canTest = !loading && (credential.trim().length > 0 || (config?.credentialSet ?? false));

  return (
    <div className="space-y-6">
      <PipelineConfigBanner />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">
          Ingestion → GitHub Configuration
        </h2>
        <p className="mt-1 text-sm text-theme-text-muted">
          Configure the system-wide GitHub credential used to fetch pull request comments for
          ingestion. Only admins can manage this configuration.
        </p>
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
          <CardTitle>
            <Github className="mr-2 inline h-5 w-5 text-theme-text-muted" />
            Current Status
          </CardTitle>
          <CardDescription>
            {config?.credentialSet
              ? "A credential is stored. Use the form below to update it."
              : "No credential is stored yet. Provide one below to enable ingestion."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-theme-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {config?.credentialSet ? (
                  <Badge variant="green">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Credential set
                  </Badge>
                ) : (
                  <Badge variant="red">
                    <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Not configured
                  </Badge>
                )}
                {config && (
                  <Badge variant="outline">
                    {CREDENTIAL_KIND_LABEL[config.credentialKind]}
                  </Badge>
                )}
                {config?.validatedAt && (
                  <span className="text-xs text-theme-text-muted">
                    Last validated {new Date(config.validatedAt).toLocaleString()}
                  </span>
                )}
              </div>
              {config?.validationError && (
                <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
                  Last validation error: {config.validationError}
                </div>
              )}
              {config && config.allowedScopes.length > 0 && (
                <div className="text-xs text-theme-text-muted">
                  Allowed scopes:{" "}
                  <span className="text-theme-text">
                    {config.allowedScopes.join(", ")}
                  </span>
                </div>
              )}
              {config && config.allowedScopes.length === 0 && (
                <div className="text-xs text-theme-text-muted">
                  Allowed scopes: <span className="text-theme-text">all accessible repositories</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credential</CardTitle>
          <CardDescription>
            Personal Access Tokens are easiest. GitHub App installations are recommended for
            higher rate limits in production.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-credential-kind">Credential kind</Label>
              <Select
                value={credentialKind}
                onValueChange={(v) => setCredentialKind(v as CredentialKind)}
              >
                <SelectTrigger id="github-credential-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pat">Personal Access Token</SelectItem>
                  <SelectItem value="app_installation">GitHub App Installation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github-credential">
                Credential{" "}
                {config?.credentialSet && (
                  <span className="text-theme-text-dim">(leave blank to keep current)</span>
                )}
              </Label>
              <Textarea
                id="github-credential"
                rows={3}
                placeholder="Personal Access Token or App Installation token..."
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-theme-text-muted">
                Stored encrypted at rest. Never returned in API responses.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github-allowed-scopes">Allowed scopes</Label>
              <Input
                id="github-allowed-scopes"
                placeholder="owner/repo, owner/another-repo"
                value={scopesInput}
                onChange={(e) => setScopesInput(e.target.value)}
              />
              <p className="text-xs text-theme-text-muted">
                Comma-separated list of <code>owner/repo</code> entries. Leave empty to allow all
                accessible repositories.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleTest}
                disabled={testing || !canTest}
              >
                {testing ? "Testing..." : "Test Connection"}
              </Button>
            </div>

            {testResult && (
              <div
                className={
                  testResult.ok
                    ? "rounded-sm bg-theme-success/10 border border-theme-success/25 px-3 py-2 text-sm text-theme-success"
                    : "rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger"
                }
              >
                {testResult.ok ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Connection successful
                    {testResult.identity ? ` — authenticated as ${testResult.identity}` : ""}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    {testResult.error ?? "Connection failed"}
                  </span>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
