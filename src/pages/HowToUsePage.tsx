import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ReviewFlowDiagram } from "@/components/ReviewFlowDiagram";
import { McpConfigSnippet } from "@/components/shared/McpConfigSnippet";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import {
  LogIn,
  Plug,
  Terminal,
  ListChecks,
  Wrench,
  ArrowRight,
  Check,
  Clock,
  Network,
  MessageSquareText,
  BookOpen,
  ShieldCheck,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

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

  const sizeClasses = { sm: "h-6 w-6", md: "h-10 w-10", lg: "h-12 w-12" };
  const iconSizes = { sm: "h-3 w-3", md: "h-5 w-5", lg: "h-6 w-6" };

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-lg ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}

const STEPS = [
  {
    icon: Plug,
    title: "Connect Reviewdoo",
    subtitle: "One-time MCP setup",
  },
  {
    icon: Terminal,
    title: "Run init",
    subtitle: "A single command",
  },
  {
    icon: ListChecks,
    title: "Pick what to check",
    subtitle: "Interactive prompt",
  },
  {
    icon: Wrench,
    title: "Fix, then submit",
    subtitle: "Ship a clean PR",
  },
] as const;

export function HowToUsePage() {
  const { isAuthenticated } = useAuth();

  // Same derivation used by the in-dashboard MCP Config page, so the snippet
  // here matches what developers paste into their IDE.
  const mcpUrl = `${import.meta.env.VITE_API_URL || window.location.origin}/mcp`;

  const [active, setActive] = useState(0);

  // Scroll-driven stepper: each step card is observed, and whichever card is
  // crossing the viewport center becomes the active step — so the progress bar
  // advances as you scroll. Clicking a bar segment jumps to that card.
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = markerRefs.current.findIndex((el) => el === entry.target);
          if (idx !== -1) setActive(idx);
        }
      },
      // A zero-height band at the vertical center of the viewport: a marker
      // "intersects" only while it's crossing the middle of the screen.
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    const els = markerRefs.current.filter((el): el is HTMLDivElement => el !== null);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (i: number) => {
    setActive(i);
    markerRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Per-step body content, rendered inside each stacked step card.
  const renderStepBody = (i: number) => {
    switch (i) {
      case 0:
        return (
          <StepContent text="Paste this into your IDE's mcp.json — the same config you'll find on the MCP Config page once you log in — then restart the IDE. You only do this once.">
            <McpConfigSnippet />
          </StepContent>
        );
      case 1:
        return (
          <StepContent text="In your IDE's AI chat, type the command below. Reviewdoo hands the IDE the full self-check workflow — you don't need to remember any of the steps that follow.">
            <div className="rounded-md border border-border bg-theme-bg-elevated px-4 py-4 font-mono text-sm">
              <span className="select-none text-theme-text-dim">{">"} </span>
              <span className="text-theme-accent">@reviewdoo</span>
              <span className="text-theme-text"> init</span>
              <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-theme-text-muted align-middle" />
            </div>
          </StepContent>
        );
      case 2:
        return (
          <StepContent text="The IDE asks what you want to review and shows an interactive selection. Pick your scope and it runs the right git command for you.">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Latest commit",
                "A specific commit",
                "A range of commits",
                "Uncommitted changes",
                "Changes vs a base branch",
              ].map((opt) => (
                <div
                  key={opt}
                  className="flex items-center gap-2 rounded-md border border-border bg-theme-bg-elevated px-3 py-2 text-sm text-theme-text-muted"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-theme-accent" />
                  {opt}
                </div>
              ))}
            </div>
          </StepContent>
        );
      case 3:
        return (
          <StepContent text="The IDE pulls only the guidelines and checklist items relevant to your diff, checks your changes against them, and lists what to fix — grouped by severity. Clean it up, then open your PR with confidence.">
            <div className="flex flex-wrap gap-2">
              <SeverityPill label="Critical" className="bg-theme-danger/15 text-theme-danger" />
              <SeverityPill label="Major" className="bg-theme-accent/15 text-theme-accent" />
              <SeverityPill label="Minor" className="bg-theme-info/15 text-theme-info" />
              <SeverityPill label="Suggestion" className="bg-theme-text-muted/15 text-theme-text-muted" />
            </div>
          </StepContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-theme-body">
      {/* Header */}
      <header className="border-b border-border bg-theme-bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
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

            {/* Quick facts */}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <QuickFact icon={Clock} label="~2 min" sub="one-time setup" />
              <QuickFact icon={ShieldCheck} label="Self-check" sub="not an AI gate" />
              <QuickFact icon={Network} label="Any MCP IDE" sub="Kiro, Codex…" />
            </div>
          </div>
        </div>

        {/* Get started — sticky progress bar over stacked step cards */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-theme-text">Get started</h2>
              <p className="mt-1 text-sm text-theme-text-muted">Four steps. Scroll through them, or jump with the bar.</p>
            </div>
            <span className="hidden sm:block text-sm text-theme-text-dim font-mono">
              {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </span>
          </div>

          {/* Sticky progress rail — highlights the step currently in view. */}
          <div className="sticky top-[68px] z-10 -mx-2 rounded-lg border border-border bg-theme-bg-card/90 px-3 py-3 backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-2">
              {STEPS.map((step, i) => {
                const isActive = i === active;
                const isDone = i < active;
                return (
                  <button key={step.title} onClick={() => goTo(i)} className="group text-left">
                    <div
                      className={`h-1.5 rounded-full transition-colors ${isActive
                          ? "bg-theme-accent"
                          : isDone
                            ? "bg-theme-success/60"
                            : "bg-theme-bg-elevated group-hover:bg-theme-primary/30"
                        }`}
                    />
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${isActive
                            ? "bg-theme-accent text-theme-bg-card"
                            : isDone
                              ? "bg-theme-success/20 text-theme-success"
                              : "bg-theme-bg-elevated text-theme-text-muted"
                          }`}
                      >
                        {isDone ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <span
                        className={`hidden truncate text-xs font-medium sm:block ${isActive ? "text-theme-text" : "text-theme-text-muted group-hover:text-theme-text"
                          }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step cards — real content, stacked so there's no empty space. */}
          <div className="space-y-5">
            {STEPS.map((step, i) => {
              const isActive = i === active;
              const StepIcon = step.icon;
              return (
                <Card
                  key={step.title}
                  ref={(el: HTMLDivElement | null) => {
                    markerRefs.current[i] = el;
                  }}
                  className={`scroll-mt-32 transition-colors ${isActive
                      ? "border-theme-primary/40 bg-theme-bg-card"
                      : "border-border bg-theme-bg-card/50"
                    }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <IconBox icon={StepIcon} variant="primary" size="lg" className="border" />
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wider text-theme-text-dim">
                          Step {i + 1} · {step.subtitle}
                        </div>
                        <h3 className="text-lg font-semibold text-theme-text">{step.title}</h3>
                      </div>
                    </div>
                    <div className="mt-5">{renderStepBody(i)}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How it works — same diagram as the About page */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">How it works</h2>

          <Card className="border-theme-info/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-8 max-w-3xl">
                After <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">init</code>, your IDE
                talks to Reviewdoo over MCP to gather just the guidelines and checklists that apply to your changes, then checks
                your diff against them locally — flagging anything that doesn't follow a guideline or violates a checklist, with
                full codebase context.
              </p>

              <ReviewFlowDiagram />
            </CardContent>
          </Card>
        </section>

        {/* What you'll be using */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">What you'll be using</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={Terminal}
              title="init"
              mono
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
function QuickFact({ icon: Icon, label, sub }: { icon: LucideIcon; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-theme-bg-card/60 px-3 py-2.5 backdrop-blur-sm">
      <IconBox icon={Icon} variant="accent" size="sm" />
      <div className="leading-tight">
        <div className="text-sm font-semibold text-theme-text">{label}</div>
        <div className="text-xs text-theme-text-muted">{sub}</div>
      </div>
    </div>
  );
}

function StepContent({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-theme-text-muted leading-relaxed">{text}</p>
      {children}
    </div>
  );
}

function SeverityPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{label}</span>
  );
}

function InfoCard({
  icon,
  title,
  description,
  mono = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  mono?: boolean;
}) {
  return (
    <Card className="group border-theme-accent/20 bg-theme-bg-card/50 transition-all hover:border-theme-accent/40 hover:bg-theme-bg-card">
      <CardContent className="pt-6">
        <div className="flex flex-col items-start gap-3">
          <IconBox icon={icon} variant="accent" className="transition-transform group-hover:scale-105" />
          <div>
            <h3 className={`mb-1 font-semibold text-theme-text ${mono ? "font-mono text-sm" : ""}`}>{title}</h3>
            <p className="text-sm text-theme-text-muted">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
