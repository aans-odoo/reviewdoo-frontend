import { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Wand2 } from "lucide-react";
import api from "@/lib/api";

interface PromptResult {
  prompt: string;
  metadata: {
    reviewChecklistCount: number;
    guidelineCount: number;
    tokenCount: number;
    truncated: boolean;
  };
}

export function PromptGeneratorPage() {
  const [prNumber, setPrNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [repository, setRepository] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!prNumber.trim() && !branchName.trim()) {
      setError("Please provide a PR number or branch name");
      return;
    }
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const body: Record<string, string> = {};
      if (prNumber.trim()) body.prNumber = prNumber.trim();
      if (branchName.trim()) body.branchName = branchName.trim();
      if (repository.trim()) body.repository = repository.trim();

      const res = await api.post("/prompt-generator", body);
      setResult(res.data);
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to generate prompt");
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
      setError("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-theme-text">Prompt Generator</h2>
        <p className="mt-1 text-sm text-theme-text-muted">Generate review prompts for AI coding IDEs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Prompt</CardTitle>
          <CardDescription>Provide a PR number or branch name to generate a context-aware review prompt.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pr-number">PR Number</Label>
                <Input id="pr-number" placeholder="e.g. 42" value={prNumber} onChange={(e) => setPrNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-name">Branch Name</Label>
                <Input id="branch-name" placeholder="e.g. feature/auth-flow" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-context">Repository (optional)</Label>
              <Input id="repo-context" placeholder="e.g. owner/repo" value={repository} onChange={(e) => setRepository(e.target.value)} />
            </div>
            <Button type="submit" disabled={generating}>
              <Wand2 className="mr-2 h-4 w-4" />
              {generating ? "Generating..." : "Generate Prompt"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{error}</div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Prompt</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <><Check className="mr-2 h-4 w-4" /> Copied</>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /> Copy</>
                )}
              </Button>
            </div>
            <CardDescription>
              {result.metadata.reviewChecklistCount} review checklists · {result.metadata.guidelineCount} guidelines · {result.metadata.tokenCount} tokens
              {result.metadata.truncated && " · Truncated to fit token budget"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-sm bg-theme-bg-elevated border border-border p-4 text-sm text-theme-text-muted font-mono">
              {result.prompt}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
