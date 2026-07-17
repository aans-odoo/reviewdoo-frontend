import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { MarkdownField } from "@/components/shared/MarkdownPreviewToggle";
import { Users, Terminal, Check, Loader2 } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { getApiErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/shared/Alert";
import { Loading } from "@/components/shared/Loading";

type FieldKey = "teamName" | "teamLogoUrl" | "initPrompt";
type SaveState = "idle" | "saving" | "saved";

export function AppSettingsPage() {
  const { settings, isLoading, updateSettings } = useAppSettings();
  const [error, setError] = useState("");

  const [teamName, setTeamName] = useState("");
  const [teamLogoUrl, setTeamLogoUrl] = useState("");
  const [initPrompt, setInitPrompt] = useState("");
  const [saveState, setSaveState] = useState<Record<FieldKey, SaveState>>({
    teamName: "idle",
    teamLogoUrl: "idle",
    initPrompt: "idle",
  });

  // Tracks the last persisted value per field so we only save on actual change.
  const savedValues = useRef<Record<FieldKey, string>>({
    teamName: "",
    teamLogoUrl: "",
    initPrompt: "",
  });

  useEffect(() => {
    if (settings) {
      setTeamName(settings.teamName);
      setTeamLogoUrl(settings.teamLogoUrl);
      setInitPrompt(settings.initPrompt);
      savedValues.current = {
        teamName: settings.teamName,
        teamLogoUrl: settings.teamLogoUrl,
        initPrompt: settings.initPrompt,
      };
    }
  }, [settings]);

  // Enter in a single-line field commits the change by blurring (which fires
  // the save). Focus simply leaves the field.
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.currentTarget.blur();
  };

  const revert = (field: FieldKey) => {
    if (field === "teamName") setTeamName(savedValues.current.teamName);
    else if (field === "teamLogoUrl") setTeamLogoUrl(savedValues.current.teamLogoUrl);
    else setInitPrompt(savedValues.current.initPrompt);
  };

  // Auto-save a single field when it loses focus, but only if it changed and
  // is non-empty (the backend rejects blank values).
  const handleBlur = async (field: FieldKey, value: string) => {
    if (!value.trim()) {
      revert(field);
      return;
    }
    if (value === savedValues.current[field]) return;

    setError("");
    setSaveState((s) => ({ ...s, [field]: "saving" }));
    try {
      await updateSettings({ [field]: value });
      savedValues.current[field] = value;
      setSaveState((s) => ({ ...s, [field]: "saved" }));
      setTimeout(() => setSaveState((s) => ({ ...s, [field]: "idle" })), 2000);
    } catch (err: unknown) {
      setSaveState((s) => ({ ...s, [field]: "idle" }));
      setError(getApiErrorMessage(err, "Failed to save settings"));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">App Settings</h2>
        <p className="mt-1 text-sm text-theme-text-muted">
          Changes are saved automatically when you click away from a field.
        </p>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError("")}>{error}</Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Users className="mr-2 inline h-4 w-4 text-theme-text-muted" />
            Team Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="team-name">Team name</Label>
              <SaveIndicator state={saveState.teamName} />
            </div>
            <Input
              id="team-name"
              placeholder="Odoo"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onBlur={(e) => handleBlur("teamName", e.target.value)}
              onKeyDown={handleEnter}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="team-logo-url">Logo URL</Label>
              <SaveIndicator state={saveState.teamLogoUrl} />
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="team-logo-url"
                placeholder="https://example.com/logo.png"
                value={teamLogoUrl}
                onChange={(e) => setTeamLogoUrl(e.target.value)}
                onBlur={(e) => handleBlur("teamLogoUrl", e.target.value)}
                onKeyDown={handleEnter}
              />
              <TeamLogo logoUrl={teamLogoUrl} teamName={teamName} className="h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Terminal className="mr-2 inline h-4 w-4 text-theme-text-muted" />
            MCP Init Prompt
          </CardTitle>
          <CardDescription>
            The workflow instructions returned by the MCP <code className="rounded bg-theme-bg-hover px-1 py-0.5 text-xs font-mono text-theme-text">init</code> tool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarkdownField
            label="Prompt text"
            htmlFor="init-prompt"
            value={initPrompt}
            labelAccessory={<>{["saving", "saved"].includes(saveState.initPrompt) && <span className="w-px h-4 bg-theme-text-muted/50"/>}<SaveIndicator state={saveState.initPrompt} /></>}
          >
            <Textarea
              id="init-prompt"
              className="min-h-[320px] font-mono text-xs"
              value={initPrompt}
              onChange={(e) => setInitPrompt(e.target.value)}
              onBlur={(e) => handleBlur("initPrompt", e.target.value)}
              placeholder="Enter the MCP init workflow instructions..."
            />
          </MarkdownField>
        </CardContent>
      </Card>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  // Always render a fixed-height container so the label row keeps its size
  // whether or not the indicator is visible — prevents layout shift as the
  // "Saving..." / "Saved" text appears and disappears.
  return (
    <span
      className="flex h-4 items-center gap-1 text-xs"
      aria-live="polite"
    >
      {state === "saving" && (
        <span className="flex items-center gap-1 text-theme-text-dim">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
        </span>
      )}
      {state === "saved" && (
        <span className="flex items-center gap-1 text-theme-primary-light">
          <Check className="h-3.5 w-3.5" /> Saved
        </span>
      )}
    </span>
  );
}
