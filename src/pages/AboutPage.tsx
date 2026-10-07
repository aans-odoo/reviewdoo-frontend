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
  CheckCircle2,
  XCircle,
  Code2,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  Layers,
  MessageSquare,
  MessageSquarePlus,
  ShieldCheck,
  Wrench,
  LogIn,
  LucideIcon,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  BadgeInfo,
  Zap,
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

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">{children}</code>
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
              Review<span className="text-theme-primary">doo</span> is our team's knowledge base of review checklists, built from real PR feedback. Before you open a PR, your AI IDE checks your changes against them, so the issues we've already flagged once don't come back. It's a self-check against our own standards, <span className="text-theme-text font-medium">not an AI reviewer</span> and not a replacement for human review.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-theme-text-muted">
              <span className="text-theme-text font-medium">Arib Ansari (aans)</span>
              <span className="text-theme-text-dim">•</span>
              <span>Website@Odoo</span>
            </div>
          </div>
        </div>

        {/* The Problem */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">The Problem I Wanted to Solve</h2>

          <Card className="border-theme-danger/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <div className="grid gap-10 md:grid-cols-2">
                <ChallengeCard
                  icon={MessageSquare}
                  title="Feedback Gets Lost"
                  description="Good review comments end up buried in PR history. Nobody finds them again."
                />
                <ChallengeCard
                  icon={TrendingUp}
                  title="We Repeat Mistakes"
                  description="The same issues get flagged again and again, on different PRs, by different reviewers."
                />
                <ChallengeCard
                  icon={Clock}
                  title="Review Cycles Take Time"
                  description="Submit, wait, fix, repeat. Every round trip adds hours or days."
                />
                <ChallengeCard
                  icon={Users}
                  title="Knowledge Isn't Shared"
                  description="When one developer learns something in review, the rest of the team doesn't."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What it is / isn't */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">What Reviewdoo Is (and Isn't)</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <IsIsntCard good title="What it is">
              <PointItem good title="A team knowledge base">
                Review checklists written by the team, from real PR feedback.
              </PointItem>
              <PointItem good title="Plugged into your AI IDE">
                Over MCP, it checks your diff against the checklists that apply.
              </PointItem>
              <PointItem good title="Easy to keep tidy">
                References, search by meaning, and duplicate warnings.
              </PointItem>
            </IsIsntCard>

            <IsIsntCard title="What it isn't">
              <PointItem title="An AI reviewer">
                It doesn't judge your code or approve PRs.
              </PointItem>
              <PointItem title="A replacement for human review">
                Reviewers still review. They just see fewer repeat issues.
              </PointItem>
            </IsIsntCard>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">How It Works</h2>

          <Card className="border-theme-success/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <SolutionStep
                  number="1"
                  icon={MessageSquarePlus}
                  title="Contribute"
                  description="Got review feedback worth remembering? Add it as a review checklist item."
                />
                <SolutionStep
                  number="2"
                  icon={Layers}
                  title="Scope"
                  description="Say where it applies: code, comments, commit messages, or everywhere. Narrow it by language or file pattern."
                />
                <SolutionStep
                  number="3"
                  icon={ShieldCheck}
                  title="Apply"
                  description="Before a PR, your IDE fetches the checklists that match your diff and checks your changes against them."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Daily workflow */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">A Day-to-Day Example</h2>

          <Card className="border-theme-primary/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <WorkflowStep
                  title="Make your changes"
                  description="Work on your branch as usual."
                  icon={Code2}
                />
                <WorkflowStep
                  title="Run @reviewdoo init"
                  description="In your AI IDE (Antigravity, Codex, Kiro, etc.), before opening the PR. No prompt to copy and paste."
                  icon={Sparkles}
                />
                <WorkflowStep
                  title="The IDE runs the self-check"
                  description="It asks what to check (latest commit, a range, uncommitted changes, or vs a base branch) and in which repo. Then it fetches the relavant checklists from Reviewdoo and vet your diff against those checklist and reports any violations."
                  icon={Brain}
                />
                <WorkflowStep
                  title="Fix and submit a cleaner PR"
                  description="Each finding links to its checklist item. Fix them before a reviewer ever sees the code."
                  icon={GitPullRequest}
                />
                <WorkflowStep
                  title="Contribute back"
                  description="Got a new general feedback from a reviewer? Add it, so the whole team catches it next time."
                  icon={MessageSquarePlus}
                  isLast
                />
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-theme-text mb-6 text-center">Review Flow</h3>
                <ReviewFlowDiagram />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What we gain */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">What We Gain</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <BenefitCard
              icon={Clock}
              title="Faster Merges"
              description="Fewer review rounds, because common issues are fixed before the PR is opened."
            />
            <BenefitCard
              icon={Target}
              title="Fewer Repeated Mistakes"
              description="Feedback given to anyone on the team protects everyone else from the same issue."
            />
            <BenefitCard
              icon={Zap}
              title="Less Review Burden"
              description="Reviewers spend less time on repeat comments and more on design and architecture."
            />
            <BenefitCard
              icon={Users}
              title="One Shared Standard"
              description="Everyone checks against the same list. New team members get up to speed faster."
            />
          </div>
        </section>

        {/* Technical details */}
        <section>
          <TechnicalAccordion
            icon={Wrench}
            title="Under the Hood"
            content={
              <div className="space-y-5 py-4 px-2">
                <TechItem title="Matching is rules, not AI">
                  <p>
                    When your IDE asks Reviewdoo for the relevant checklists, it picks them using plain rules. No AI or API key is involved, and the same diff always gets the same result.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <span className="text-theme-text font-semibold">Code and comment</span> checklists match by language (from the file extension, e.g. <Code>.ts</Code> is TypeScript). A file pattern like <Code>*_plugin.js</Code> narrows that to specific files.
                    </li>
                    <li>
                      <span className="text-theme-text font-semibold">Commit message and general</span> checklists apply to every review.
                    </li>
                  </ul>
                </TechItem>

                <TechItem title="Focused results">
                  <p>
                    Matches are sorted by severity, then by how specific the match is, then by how many references back them up. The IDE gets the top 50 by default, plus a note saying how many were left out.
                  </p>
                </TechItem>

                <TechItem title="Where AI is used">
                  <p>
                    Only for keeping the knowledge base tidy: searching checklists by meaning in the web app, and warning about likely duplicates when you add one. This is enabled when an admin adds a Gemini API key. The IDE check works without it.
                  </p>
                </TechItem>

                <TechItem title="Couldn't this just be a skill or a markdown file?">
                  <p>
                    Yes, honestly. You could keep these checklists in a file and hand it to your AI as a skill, and it would work. The AI part was never the hard part. Keeping a growing list useful is.
                  </p>
                  <p>
                    That's why Reviewdoo is an app: a UI to add and edit checklists, references back to the PRs they came from, categories and scopes, search by keyword or meaning, and a warning when you're about to add a duplicate. MCP is just how the IDE reads from it.
                  </p>
                </TechItem>
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
function IsIsntCard({
  title,
  good = false,
  children,
}: {
  title: string;
  good?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={`h-full bg-theme-bg-card/50 ${good ? "border-theme-success/30" : "border-theme-danger/30"}`}
    >
      <CardContent className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={good ? CheckCircle2 : XCircle} variant={good ? "success" : "danger"} size="md" />
          <h3 className="text-lg font-semibold text-theme-text">{title}</h3>
        </div>
        <ul>{children}</ul>
      </CardContent>
    </Card>
  );
}

function PointItem({
  title,
  children,
  good = false,
}: {
  title: string;
  children: React.ReactNode;
  good?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      {good ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-theme-success" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-theme-danger" />
      )}
      <div>
        <p className="text-sm font-medium text-theme-text">{title}</p>
        <p className="text-sm text-theme-text-muted">{children}</p>
      </div>
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

function TechItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-b border-border pb-5 last:border-b-0 last:pb-0">
      <h3 className="font-semibold text-theme-text">{title}</h3>
      <div className="text-sm text-theme-text-muted leading-relaxed space-y-2">{children}</div>
    </div>
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
