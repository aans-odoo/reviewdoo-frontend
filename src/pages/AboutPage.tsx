import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { ReviewFlowDiagram } from "@/components/ReviewFlowDiagram";
import { useState } from "react";
import {
  Brain,
  GitPullRequest,
  Sparkles,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  Code2,
  Database,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  Layers,
  MessageSquare,
  MessageSquarePlus,
  BookOpen,
  ShieldCheck,
  Wrench,
  LogIn,
  LucideIcon,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  BadgeInfo,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

export function AboutPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-theme-body">
      {/* Header */}
      <header className="border-b border-border bg-theme-bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <a href="/how-to-use">
              <Button variant="ghost" size="sm" className="gap-2">
                <BadgeInfo className="h-4 w-4" />
                How to use
              </Button>
            </a>
            {!isAuthenticated && (
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

      {isAuthenticated && (
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-theme-text-muted hover:text-theme-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-theme-bg-card via-theme-bg-elevated to-theme-bg-card p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(192,85,165,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(155,230,85,0.1),transparent_50%)]" />

          <div className="relative z-10 max-w-3xl pt-6">
            <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-4 bg-gradient-to-r from-theme-primary-light via-theme-text to-theme-accent bg-clip-text text-transparent">
              Fix the common stuff before review.
            </h1>
            <p className="text-lg text-theme-text-muted leading-relaxed">
              Review<span className="text-theme-primary">doo</span> is an internal knowledge base of the review checklists we've built from real PR feedback. You use this before submitting your PR for review, to ensure you're not missing any review checklist. It's a self-check against our own standards, <span className="text-theme-text font-medium">not an AI reviewer</span>, and not a replacement for human review.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-theme-text-muted">
              <span className="text-theme-text font-medium">— Arib Ansari (aans)</span>
              <span className="text-theme-text-dim">•</span>
              <span>Website@Odoo</span>
            </div>
          </div>
        </div>

        {/* The Challenge Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">The Problem I Wanted to Solve</h2>

          <Card className="border-theme-danger/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <div className="grid gap-10 md:grid-cols-2">
                <ChallengeCard
                  icon={MessageSquare}
                  title="Feedback Gets Lost"
                  description="When senior devs leave detailed comments on our PRs, that knowledge disappears into the PR history. We can't easily find it later."
                />
                <ChallengeCard
                  icon={TrendingUp}
                  title="We Repeat Mistakes"
                  description="Without a shared place to keep past feedback, we make the same errors across different PRs. The same issues get caught over and over."
                />
                <ChallengeCard
                  icon={Clock}
                  title="Review Cycles Take Time"
                  description="We submit PRs, wait for review, get feedback, fix issues, and repeat. Each cycle adds hours or days to our workflow."
                />
                <ChallengeCard
                  icon={Users}
                  title="Knowledge Isn't Shared"
                  description="When one developer gets feedback, others don't benefit from it. We rely on memory and word-of-mouth instead of a shared reference."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What it is / isn't */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">What Reviewdoo Is (and Isn't)</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-theme-success/20 bg-theme-bg-card/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <IconBox icon={CheckCircle2} variant="success" size="sm" />
                  <h3 className="font-semibold text-theme-text">What it is</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-theme-text-muted">
                  <PointItem good>A curated knowledge base of our review checklists.</PointItem>
                  <PointItem good>Searchable by keyword or meaning, with duplicate detection to keep it clean.</PointItem>
                  <PointItem good>Connected to your AI IDE over MCP so it can check a diff against the relevant items.</PointItem>
                  <PointItem good>Curated by the team, by hand—you add what's worth remembering.</PointItem>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-theme-danger/20 bg-theme-bg-card/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <IconBox icon={XCircle} variant="danger" size="sm" />
                  <h3 className="font-semibold text-theme-text">What it isn't</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-theme-text-muted">
                  <PointItem>An AI reviewer—it doesn't judge your code or approve PRs.</PointItem>
                  <PointItem>A replacement for human review.</PointItem>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How the knowledge base works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">How the Knowledge Base Works</h2>

          <Card className="border-theme-success/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-10">
                Reviewdoo is built and maintained <span className="text-theme-accent font-semibold">by the team</span>—we contribute the feedback worth keeping, and the IDE puts it to work as a <span className="text-theme-accent font-semibold">self-check before a PR</span>.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <SolutionStep
                  number="1"
                  icon={MessageSquarePlus}
                  title="Contribute"
                  description="When you get useful review feedback, add it yourself as a review checklist item."
                />
                <SolutionStep
                  number="2"
                  icon={Layers}
                  title="Organize"
                  description="Scope checklists to the file patterns and languages they apply to. Keyword and semantic search, plus duplicate detection, keep the base findable and clean."
                />
                <SolutionStep
                  number="3"
                  icon={ShieldCheck}
                  title="Apply"
                  description="Before a PR, your IDE pulls the review checklists relevant to your diff and checks your changes against them."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Our Workflow Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">How We Use It in Our Daily Workflow</h2>

          <Card className="border-theme-primary/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <WorkflowStep
                  title="We Make Code Changes"
                  description="We work on our feature branch as usual, making changes and committing code."
                  icon={Code2}
                />
                <WorkflowStep
                  title="We Run @reviewdoo init"
                  description="Before submitting the PR, we run @reviewdoo init in our AI IDE. Reviewdoo hands the IDE the full self-check workflow—how to pick what to review, and how to call Reviewdoo's MCP tools to fetch the review checklists relevant to our changes."
                  icon={Sparkles}
                />
                <WorkflowStep
                  title="Our IDE Runs the Self-Check"
                  description="The AI IDE (Antigravity, Codex, Kiro, etc.) follows the init instructions: it asks what we want to check, fetches the review checklists (by changed file) that match our diff, then checks our changes against them—flagging anything that violates a checklist, with full codebase context."
                  icon={Brain}
                />
                <WorkflowStep
                  title="We Fix Issues Proactively"
                  description="The AI IDE flags every review checklist item our changes don't follow. We fix them immediately, before any human reviewer sees the code."
                  icon={CheckCircle2}
                />
                <WorkflowStep
                  title="We Submit a Cleaner PR"
                  description="Our PR is already vetted against team standards and past feedback. Reviews are faster, and we avoid back-and-forth cycles."
                  icon={GitPullRequest}
                />
                <WorkflowStep
                  title="We Contribute Back"
                  description="When we get review feedback worth remembering, we add it to the knowledge base ourselves—as a review checklist item—so the whole team benefits next time."
                  icon={MessageSquarePlus}
                  isLast
                />
              </div>

              {/* Flow Diagram */}
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-theme-text mb-6 text-center">Review Flow Diagram</h3>

                <ReviewFlowDiagram />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What We Gain Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">What We Gain</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={Clock}
              title="Faster Merges"
              description="We catch issues before review, reducing back-and-forth cycles. PRs get merged faster."
            />
            <BenefitCard
              icon={BookOpen}
              title="Learn From the Whole Team"
              description="We benefit from checklists created from feedback given to any team member, not just our own PRs."
            />
            <BenefitCard
              icon={Target}
              title="Fewer Mistakes"
              description="We stop repeating the same errors. If someone captured feedback on it before, we can avoid it."
            />
            <BenefitCard
              icon={Users}
              title="Team Alignment"
              description="We all check against the same shared reference. New team members get up to speed faster."
            />
            <BenefitCard
              icon={Zap}
              title="Less Review Burden"
              description="Reviewers spend less time on repetitive feedback and more on architectural guidance."
            />
            <BenefitCard
              icon={Database}
              title="A Shared Reference"
              description="Our review checklists live in one place instead of scattered PRs and memory. It grows as the team contributes."
            />
          </div>
        </section>

        {/* Technical Details Section */}
        <section>
          <TechnicalAccordion
            icon={Wrench}
            title="How Retrieval Works (Technical Details)"
            content={
              <div className="space-y-6 py-4 px-2">
                {/* Deterministic matching */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Matching Is Plain Pattern &amp; Language Matching—Not AI</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      When your IDE asks Reviewdoo what applies to a diff, the matching is <span className="text-theme-accent font-semibold">deterministic</span>—no embeddings, no AI, no similarity scoring:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="text-theme-text font-semibold">Review checklists</span> are matched by <span className="text-theme-accent font-semibold">file pattern and language</span>. A checklist scoped to <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">*.ts</code> surfaces when a matching file changed, and one scoped to a language (e.g. <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">javascript</code>) surfaces when your diff touches that language.
                      </li>
                      <li>
                        A checklist with <span className="text-theme-text font-semibold">no patterns or languages</span> is treated as <span className="text-theme-accent font-semibold">general</span> and applies to any diff—because it's meant to be followed everywhere.
                      </li>
                    </ul>
                    <p>
                      This makes the per-diff check fast, free, and repeatable—the same diff always produces the same result.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Ranking + cap */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Keeping the Checklist Response Focused</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      A broad change can match a lot of checklists. Rather than dumping all of them into the IDE's context, matches are <span className="text-theme-accent font-semibold">ranked by relevance</span>: diff-specific matches (by file pattern, then language) come before broad "general" checklists, and higher severity and better-referenced items rank first.
                    </p>
                    <p>
                      The response is capped at <span className="text-theme-accent font-semibold">50 by default</span> (the IDE can override this) and it states how many lower-relevance items were left out—so nothing is dropped silently.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Where semantic search fits */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Where Semantic Search Fits</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      The knowledge base <span className="text-theme-accent font-semibold">does</span> use semantic search—but for <span className="text-theme-text font-semibold">curation</span>, not the per-diff check. In the management UI you can search review checklists by meaning (not just keywords), and when you add a new item Reviewdoo flags likely duplicates so the base stays clean.
                    </p>
                    <p>
                      Semantic search needs an embedding model, which each user configures under <span className="text-theme-text font-semibold">AI Config</span>. The IDE-facing matching above needs none of that.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* The init workflow */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">The init Workflow: One Command, Any Scope</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Running <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">@reviewdoo init</code> returns a single workflow that adapts to what's being reviewed:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>A single commit or a range of commits</li>
                      <li>Uncommitted changes or a diff against a base branch</li>
                      <li>Different file types or project areas</li>
                    </ul>
                    <p>
                      The IDE asks which scope to check, then the <span className="text-theme-accent font-semibold">core steps stay the same</span>—fetch the review checklists relevant to the diff, then check the changes against them. No prompt to copy and paste.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Why AI IDEs */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Why This Works Best in an AI IDE</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Reviewdoo is fundamentally an <span className="text-theme-accent font-semibold">MCP server</span>—it exposes tools any MCP-compatible client can call. But <span className="text-theme-text font-semibold">AI IDEs are strongly recommended</span> (Antigravity, Codex, Kiro, etc.) for three reasons:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="text-theme-text font-semibold">Full codebase context:</span> they can explore beyond the diff and see how a change fits the bigger picture.
                      </li>
                      <li>
                        <span className="text-theme-text font-semibold">Real-time feedback:</span> you get results while coding, not after submitting.
                      </li>
                      <li>
                        <span className="text-theme-text font-semibold">Project awareness:</span> they understand your structure and patterns, so the checks land in context.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* MCP Setup */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">MCP Setup: One-Time Configuration</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Each developer adds Reviewdoo to their IDE's <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">mcp.json</code> once. The <span className="text-theme-text font-semibold">MCP Config</span> page gives you the exact config to copy and paste, and lets you test the connection.
                    </p>
                    <p className="text-theme-info">
                      💡 This is a one-time setup per developer.
                    </p>
                  </div>
                </div>
              </div>
            }
          />
        </section>

        {/* Getting Started */}
        <Card className="border-theme-primary/30 bg-gradient-to-br from-theme-primary/10 via-theme-bg-card to-theme-accent/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold text-theme-text">Ready to Try It?</h3>
              <p className="text-theme-text-muted max-w-2xl mx-auto">
                {!isAuthenticated ? "Log in, then set up the MCP config and run @reviewdoo init before your next PR." : "Set up the MCP config and run @reviewdoo init before your next PR."}
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-theme-primary px-6 py-3 text-sm font-medium text-white hover:bg-theme-primary-dark transition-colors"
                >
                  {isAuthenticated ? "Dashboard" : "Log In"}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/how-to-use"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-theme-bg-elevated px-6 py-3 text-sm font-medium text-theme-text hover:bg-theme-bg-hover transition-colors"
                >
                  <BadgeInfo className="h-4 w-4" />
                  How to set it up
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
function PointItem({ children, good = false }: { children: React.ReactNode; good?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      {good ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-theme-success" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-theme-danger" />
      )}
      <span>{children}</span>
    </li>
  );
}

function ChallengeCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <IconBox icon={icon} variant="danger" />
      <div>
        <h3 className="font-semibold text-theme-text mb-1">{title}</h3>
        <p className="text-sm text-theme-text-muted">{description}</p>
      </div>
    </div>
  );
}

function SolutionStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="space-y-3">
        <div className="relative w-fit">
          <IconBox icon={icon} variant="success" size="lg" />
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent text-theme-bg-card text-xs font-bold">
            {number}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-theme-text mb-1">{title}</h3>
          <p className="text-sm text-theme-text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({
  title,
  description,
  icon,
  isLast = false,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <IconBox icon={icon} variant="primary" className="border" />
        {!isLast && (
          <div className="w-px h-10 bg-gradient-to-b from-theme-primary via-theme-primary/50 to-transparent mt-2" />
        )}
      </div>
      <div className="flex-1 pb-2 pt-2">
        <h3 className="font-semibold text-theme-text mb-1">{title}</h3>
        <p className="text-sm text-theme-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function BenefitCard({
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
            <h3 className="font-semibold text-theme-text mb-1">{title}</h3>
            <p className="text-sm text-theme-text-muted">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TechnicalAccordion({
  icon,
  title,
  content,
}: {
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-theme-info/20 bg-theme-bg-card/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-theme-bg-elevated transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <IconBox icon={icon} variant="info" size="md" />
          <h3 className="text-lg font-semibold text-theme-text">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-theme-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-theme-text-muted flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-theme-info/10">
          {content}
        </div>
      )}
    </Card>
  );
}
