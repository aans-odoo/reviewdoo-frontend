import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  LogIn,
  Plug,
  Terminal,
  ListChecks,
  Wrench,
  GitPullRequest,
  ArrowRight,
  Copy,
  Check,
  Database,
  Code2,
  MessageSquareText,
  BookOpen,
  ShieldCheck,
  Sparkles,
  LucideIcon,
} from "lucide-react";

function IconBox({
  icon: Icon,
  variant = "default",
  size = "md",
  className = "",
}: {
  icon: LucideIcon;
  variant?: "danger" | "success" | "info" | "accent" | "primary" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const variantClasses = {
    danger: "bg-theme-danger/20 text-theme-danger",
    success: "bg-theme-success/20 text-theme-success",
    info: "bg-theme-info/20 text-theme-info",
    accent: "bg-theme-accent/20 text-theme-accent",
    primary: "bg-theme-primary/20 text-theme-primary-light border-theme-primary/30",
    default: "bg-theme-bg-elevated text-theme-text",
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-lg ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}

export function HowToUsePage() {
  const { isAuthenticated } = useAuth();

  // Same derivation used by the in-dashboard MCP Config page, so the snippet
  // here matches what developers paste into their IDE.
  const mcpUrl = `${import.meta.env.VITE_API_URL || window.location.origin}/mcp`;
  const configSnippet = JSON.stringify(
    {
      mcpServers: {
        reviewdoo: {
          url: mcpUrl,
        },
      },
    },
    null,
    2,
  );

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-body">
      {/* Header */}
      <header className="border-b border-border bg-theme-bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <a href="/about">
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                About
              </Button>
            </a>
            {isAuthenticated ? (
              <a href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Dashboard
                </Button>
              </a>
            ) : (
              <a href="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Log In
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-theme-bg-card via-theme-bg-elevated to-theme-bg-card p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(192,85,165,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(155,230,85,0.1),transparent_50%)]" />

          <div className="relative z-10 max-w-3xl">
            <Badge className="mb-4 bg-theme-primary-muted text-theme-primary-light border-theme-primary-light/20">
              For Developers
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-4 bg-gradient-to-r from-theme-primary-light via-theme-text to-theme-accent bg-clip-text text-transparent">
              Set up once, then just run init
            </h1>
            <p className="text-lg text-theme-text-muted leading-relaxed">
              Connect Review<span className="text-theme-primary">doo</span> to your AI IDE one time. After that, a single command —{" "}
              <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-base">@reviewdoo init</code>{" "}
              — walks you through checking your changes against the team's guidelines and review checklists before you open a PR.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 text-theme-text-muted">
                <ShieldCheck className="h-4 w-4 text-theme-success" />
                A self-check, not an AI review
              </span>
              <span className="text-theme-text-dim">•</span>
              <span className="inline-flex items-center gap-2 text-theme-text-muted">
                <Sparkles className="h-4 w-4 text-theme-primary-light" />
                No prompts to copy and paste
              </span>
            </div>
          </div>
        </div>

        {/* Setup steps */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">Get started in 4 steps</h2>

          <Card className="border-theme-primary/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6 space-y-8">
              {/* Step 1 */}
              <SetupStep
                number="1"
                icon={Plug}
                title="Add Reviewdoo to your IDE (one time)"
                description="Paste this into your IDE's mcp.json — the same config you'll find on the MCP Config page once you log in — then restart the IDE."
              >
                <div className="mt-4 rounded-sm border border-border bg-theme-bg-elevated">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2">
                    <span className="text-xs font-medium text-theme-text-muted">mcp.json</span>
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
                    {configSnippet}
                  </pre>
                </div>
              </SetupStep>

              {/* Step 2 */}
              <SetupStep
                number="2"
                icon={Terminal}
                title="Run @reviewdoo init"
                description="In your IDE's AI chat, type @reviewdoo init. Reviewdoo hands the IDE the full self-check workflow — no need to know which steps to run."
              >
                <div className="mt-4 rounded-sm border border-border bg-theme-bg-elevated px-4 py-3 font-mono text-sm">
                  <span className="text-theme-text-dim select-none">{">"} </span>
                  <span className="text-theme-accent">@reviewdoo</span>
                  <span className="text-theme-text"> init</span>
                </div>
              </SetupStep>

              {/* Step 3 */}
              <SetupStep
                number="3"
                icon={ListChecks}
                title="Pick what to check"
                description="The IDE asks what you want to review and shows an interactive selection. Choose your scope and it figures out the rest."
              >
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    "Latest commit",
                    "A specific commit",
                    "A range of commits",
                    "Uncommitted changes",
                    "Changes vs a base branch",
                  ].map((opt) => (
                    <div
                      key={opt}
                      className="flex items-center gap-2 rounded-sm border border-border bg-theme-bg-elevated px-3 py-2 text-sm text-theme-text-muted"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-theme-accent" />
                      {opt}
                    </div>
                  ))}
                </div>
              </SetupStep>

              {/* Step 4 */}
              <SetupStep
                number="4"
                icon={Wrench}
                title="Fix issues, then submit"
                description="The IDE pulls only the guidelines and checklist items relevant to your diff, checks your changes against them, and lists what to fix — grouped by severity. Clean it up, then open your PR with confidence."
                isLast
              />
            </CardContent>
          </Card>
        </section>

        {/* How it works diagram */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">How it works</h2>

          <Card className="border-theme-info/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-8">
                After <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">init</code>, your IDE
                talks to Reviewdoo over MCP to gather just what applies to your changes, then does the checking locally with full
                codebase context.
              </p>

              <FlowDiagram />

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-theme-text-muted mt-8 bg-theme-body px-6 py-2 rounded-sm w-fit mx-auto">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-theme-info" />
                  <span>You + your IDE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-theme-primary" />
                  <span>Reviewdoo</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-theme-accent" />
                  <span>Flow</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What you'll use */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">What you'll be using</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={Terminal}
              title="init"
              description="The one command you run. It hands your IDE the whole self-check workflow so you don't have to remember any steps."
            />
            <InfoCard
              icon={BookOpen}
              title="Team guidelines"
              description="Coding standards mapped to the file types you touched — the rules everyone on the team is expected to follow."
            />
            <InfoCard
              icon={MessageSquareText}
              title="Review checklists"
              description="Concrete checks distilled from past PR feedback. Only the ones relevant to your diff show up, so the list stays short."
            />
          </div>
        </section>

        {/* CTA */}
        <Card className="border-theme-primary/30 bg-gradient-to-br from-theme-primary/10 via-theme-bg-card to-theme-accent/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold text-theme-text">That's it</h3>
              <p className="text-theme-text-muted max-w-2xl mx-auto">
                Set up the MCP config once, then run{" "}
                <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-sm">@reviewdoo init</code>{" "}
                before every PR. {isAuthenticated ? "Grab your config from the MCP Config page." : "Log in to grab your config."}
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <a
                  href={isAuthenticated ? "/mcp-config" : "/login"}
                  className="inline-flex items-center gap-2 rounded-lg bg-theme-primary px-6 py-3 text-sm font-medium text-white hover:bg-theme-primary-dark transition-colors"
                >
                  {isAuthenticated ? "Open MCP Config" : "Log In"}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-theme-bg-elevated px-6 py-3 text-sm font-medium text-theme-text hover:bg-theme-bg-hover transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Why Reviewdoo?
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
function SetupStep({
  number,
  icon,
  title,
  description,
  children,
  isLast = false,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <IconBox icon={icon} variant="primary" size="lg" className="border" />
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent text-theme-bg-card text-xs font-bold">
            {number}
          </div>
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-8 bg-gradient-to-b from-theme-primary via-theme-primary/50 to-transparent mt-2" />
        )}
      </div>
      <div className="flex-1 pb-2">
        <h3 className="font-semibold text-theme-text mb-1">{title}</h3>
        <p className="text-sm text-theme-text-muted leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-theme-accent/20 bg-theme-bg-card/50 transition-all">
      <CardContent className="pt-6">
        <div className="flex flex-col items-start gap-3">
          <IconBox icon={icon} variant="accent" />
          <div>
            <h3 className="font-semibold text-theme-text mb-1 font-mono text-sm">{title}</h3>
            <p className="text-sm text-theme-text-muted">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact end-to-end flow showing the init self-check: the developer triggers
 * init, the IDE pulls the relevant guidelines and checklists from Reviewdoo
 * over MCP, checks the diff locally, and reports what to fix before the PR.
 */
function FlowDiagram() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-stretch gap-6">
        {/* Left actor — You + IDE */}
        <div className="flex flex-col items-center justify-center gap-3 w-28 border-r border-theme-info/30 pr-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-theme-info/20 text-theme-info border-2 border-theme-info/40 shadow-lg">
            <Code2 className="h-8 w-8" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-theme-text">Your IDE</div>
            <div className="text-xs text-theme-text-muted">Kiro, Codex, Antigravity…</div>
          </div>
        </div>

        {/* Middle — steps */}
        <div className="flex-1 py-4">
          <div className="space-y-6">
            <FlowRow
              number="1"
              label="Run init"
              icon={Terminal}
              side="left"
              note="@reviewdoo init"
            />
            <FlowRow
              number="2"
              label="Fetch guidelines + checklists"
              icon={Database}
              side="right"
              note="Only what matches your diff"
            />
            <FlowRow
              number="3"
              label="Check the diff locally"
              icon={ListChecks}
              side="left"
              note="Full codebase context"
            />
            <FlowRow
              number="4"
              label="Report what to fix"
              icon={GitPullRequest}
              side="left"
              note="Grouped by severity"
              accent
            />
          </div>
        </div>

        {/* Right actor — Reviewdoo */}
        <div className="flex flex-col items-center justify-center gap-3 w-28 border-l border-theme-primary/30 pl-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-theme-primary/20 text-theme-primary-light border-2 border-theme-primary/40 shadow-lg">
            <Database className="h-8 w-8" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-theme-text">Reviewdoo</div>
            <div className="text-xs text-theme-text-muted">Guidelines + Checklists</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowRow({
  number,
  label,
  icon: Icon,
  side,
  note,
  accent = false,
}: {
  number: string;
  label: string;
  icon: LucideIcon;
  side: "left" | "right";
  note: string;
  accent?: boolean;
}) {
  const chipColor = accent
    ? "bg-theme-success/10 border-theme-success/30"
    : side === "left"
      ? "bg-theme-info/10 border-theme-info/30"
      : "bg-theme-primary/10 border-theme-primary/30";

  const chip = (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 relative ${chipColor}`}>
      <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent border-2 border-theme-bg-card text-theme-bg-card text-xs font-bold">
        {number}
      </div>
      <Icon className="h-4 w-4 text-theme-text ml-1" />
      <span className="text-sm font-medium text-theme-text">{label}</span>
    </div>
  );

  const noteEl = <div className="text-xs text-theme-text-muted italic">{note}</div>;

  return (
    <div className="flex items-center gap-4">
      {side === "left" ? (
        <>
          {chip}
          <div className="flex flex-1 items-center">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-theme-primary/50 to-theme-info/50" />
            <ArrowRight className="h-5 w-5 text-theme-accent -ml-2" />
          </div>
          {noteEl}
        </>
      ) : (
        <>
          {noteEl}
          <div className="flex flex-1 items-center justify-end">
            <ArrowRight className="h-5 w-5 text-theme-accent rotate-180 -mr-2" />
            <div className="flex-1 h-0.5 bg-gradient-to-l from-theme-primary/50 to-theme-info/50" />
          </div>
          {chip}
        </>
      )}
    </div>
  );
}
