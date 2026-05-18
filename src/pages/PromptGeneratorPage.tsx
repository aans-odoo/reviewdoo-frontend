import { useEffect, useMemo, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Copy, Check, Wand2, Loader2, Network } from "lucide-react";
import api from "@/lib/api";

/** Form-field descriptor served by `GET /prompt-generator/types`. */
interface PromptFieldDescriptor {
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
}

/** Prompt-type descriptor served by `GET /prompt-generator/types`. */
interface PromptTypeDescriptor {
  id: string;
  name: string;
  description: string;
  fields: PromptFieldDescriptor[];
}

/** Response shape from `POST /prompt-generator`. */
interface PromptResponse {
  prompt: string;
  metadata: {
    promptTypeId: string;
    promptTypeName: string;
    mcpToolNames: string[];
    tokenCount: number;
    reviewChecklistCount: number;
    guidelineCount: number;
    truncated: boolean;
  };
}

interface ApiError {
  response?: {
    data?: {
      error?: {
        code?: string;
        message?: string;
      };
    };
  };
}

export function PromptGeneratorPage() {
  const [types, setTypes] = useState<PromptTypeDescriptor[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState("");

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const [generating, setGenerating] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<PromptResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Load the registry on mount.
  useEffect(() => {
    let cancelled = false;
    setTypesLoading(true);
    setTypesError("");
    api
      .get<{ types: PromptTypeDescriptor[] }>("/prompt-generator/types")
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.types ?? [];
        setTypes(list);
        if (list.length > 0) {
          setSelectedTypeId(list[0].id);
        }
      })
      .catch((err: ApiError) => {
        if (cancelled) return;
        setTypesError(
          err.response?.data?.error?.message ?? "Failed to load prompt types",
        );
      })
      .finally(() => {
        if (!cancelled) setTypesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedType = useMemo(
    () => types.find((t) => t.id === selectedTypeId),
    [types, selectedTypeId],
  );

  // Reset form values whenever the selected type changes so stale fields
  // from the previous type don't leak into the next submission.
  useEffect(() => {
    if (!selectedType) {
      setFormValues({});
      return;
    }
    const initial: Record<string, string> = {};
    for (const field of selectedType.fields) {
      initial[field.name] = "";
    }
    setFormValues(initial);
    setResult(null);
    setSubmitError("");
  }, [selectedType]);

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    // Strip blank optional fields so the backend Zod schema sees a clean
    // input object (an empty string would fail `.min(1)`).
    const input: Record<string, string> = {};
    for (const field of selectedType.fields) {
      const value = formValues[field.name]?.trim() ?? "";
      if (value.length > 0) {
        input[field.name] = value;
      }
    }

    setGenerating(true);
    setSubmitError("");
    setResult(null);
    try {
      const res = await api.post<PromptResponse>("/prompt-generator", {
        typeId: selectedType.id,
        input,
      });
      setResult(res.data);
    } catch (err) {
      const axErr = err as ApiError;
      setSubmitError(
        axErr.response?.data?.error?.message ?? "Failed to generate prompt",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSubmitError("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Prompt Generator</h2>
        <p className="mt-1 text-sm text-theme-text-muted">
          Generate review prompts for AI coding IDEs.
        </p>
      </div>

      {typesLoading ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-10 text-sm text-theme-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading prompt types...
          </CardContent>
        </Card>
      ) : typesError ? (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
          {typesError}
        </div>
      ) : types.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-theme-text-muted">
            No prompt types are available right now. Check back after configuring Reviewdoo.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Generate Prompt</CardTitle>
            <CardDescription>
              Pick the kind of review you're doing, fill in the fields, and copy the prompt into your AI IDE.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-type">Prompt type</Label>
                <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                  <SelectTrigger id="prompt-type">
                    <SelectValue placeholder="Select a prompt type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <p className="text-xs text-theme-text-muted">{selectedType.description}</p>
                )}
              </div>

              {selectedType?.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={`field-${field.name}`}>
                    {field.label}
                    {!field.required && (
                      <span className="ml-1 text-xs text-theme-text-dim">(optional)</span>
                    )}
                  </Label>
                  <Input
                    id={`field-${field.name}`}
                    type="text"
                    placeholder={field.placeholder}
                    value={formValues[field.name] ?? ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  />
                  {field.helpText && (
                    <p className="text-xs text-theme-text-muted">{field.helpText}</p>
                  )}
                </div>
              ))}

              <Button type="submit" disabled={generating || !selectedType}>
                <Wand2 className="mr-2 h-4 w-4" />
                {generating ? "Generating..." : "Generate Prompt"}
              </Button>

              {submitError && (
                <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">
                  {submitError}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="flex items-start gap-3 rounded-sm bg-theme-primary/10 border border-theme-primary/25 px-3 py-2 text-sm text-theme-text">
            <Network className="mt-0.5 h-4 w-4 flex-shrink-0 text-theme-primary" />
            <div className="flex-1">
              Make sure Reviewdoo is configured as an MCP server in your IDE.{" "}
              <Link
                to="/mcp-config"
                className="font-medium text-theme-primary underline-offset-4 hover:underline"
              >
                Set up MCP →
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Prompt</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                {result.metadata.promptTypeName} · Calls MCP tools:{" "}
                <code>list_guideline_tags</code>, <code>get_guidelines_by_tags</code> ·{" "}
                {result.metadata.tokenCount} tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-sm bg-theme-bg-elevated border border-border p-4 text-sm text-theme-text-muted font-mono">
                {result.prompt}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
