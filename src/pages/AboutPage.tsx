import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Code2,
  Database,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  Search,
  Layers,
  MessageSquare,
  BookOpen,
  LogIn,
  LucideIcon,
  ChevronDown,
  ChevronUp,
  Bug,
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

export function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-theme-body">
      {/* Header */}
      <header className="border-b border-border bg-theme-bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
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
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-theme-bg-card via-theme-bg-elevated to-theme-bg-card p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(192,85,165,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(155,230,85,0.1),transparent_50%)]" />

          <div className="relative z-10 max-w-3xl">
            <Badge className="mb-4 bg-theme-primary-muted text-theme-primary-light border-theme-primary-light/20">
              For Website Team
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-4 bg-gradient-to-r from-theme-primary-light via-theme-text to-theme-accent bg-clip-text text-transparent">
              Learn from Every Review, Stop Repeating Mistakes
            </h1>
            <p className="text-lg text-theme-text-muted leading-relaxed">
              Review<span className="text-theme-primary">doo</span> is an internal tool built to help capture feedback from past PR reviews and our team's coding guidelines, then use them to catch issues before submitting code—so we don't repeat mistakes our team has already learned from.
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
                  description="Without a system to track past feedback, we make the same errors across different PRs. The same issues get caught repeatedly."
                />
                <ChallengeCard
                  icon={Clock}
                  title="Review Cycles Take Time"
                  description="We submit PRs, wait for review, get feedback, fix issues, and repeat. Each cycle adds hours or days to our workflow."
                />
                <ChallengeCard
                  icon={Users}
                  title="Knowledge Isn't Shared"
                  description="When one developer gets feedback, others don't benefit from it. We rely on memory and word-of-mouth instead of a shared system."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How Reviewdoo Helps Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">How This Tool Helps Our Workflow</h2>

          <Card className="border-theme-success/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-10">
                Reviewdoo automatically captures review checklists and uses them as a <span className="text-theme-accent font-semibold">quality check before submitting PRs</span>. This means fewer review cycles and faster merges.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <SolutionStep
                  number="1"
                  icon={Database}
                  title="Capture"
                  description="The system automatically collects PR review comments from our team and stores them in a searchable database"
                />
                <SolutionStep
                  number="2"
                  icon={Brain}
                  title="Learn"
                  description="AI extracts patterns from feedback and groups similar comments together to avoid duplicating knowledge"
                />
                <SolutionStep
                  number="3"
                  icon={Search}
                  title="Apply"
                  description="Before submitting a PR, we can check if our changes match any past feedback and fix issues proactively"
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
                  description="Before submitting the PR, we run @reviewdoo init in our AI IDE. Reviewdoo hands the IDE the full self-check workflow—how to pick what to review, and how to call Reviewdoo's MCP tools to fetch the coding guidelines and review checklists (created from comments made on others' PRs) relevant to our changes."
                  icon={Sparkles}
                />
                <WorkflowStep
                  title="Our IDE Runs the Self-Check"
                  description="The AI IDE (Antigravity, Codex, Kiro, etc.) follows the init instructions: it asks what we want to check, calls the MCP tools to fetch only the guidelines and checklists that match our diff, then checks our changes against them—flagging anything that doesn't follow a guideline or violates a checklist, with full codebase context."
                  icon={Brain}
                />
                <WorkflowStep
                  title="We Fix Issues Proactively"
                  description="The AI IDE flags every guideline or checklist item our changes don't follow. We fix them immediately, before any human reviewer sees the code."
                  icon={CheckCircle2}
                />
                <WorkflowStep
                  title="We Submit a Cleaner PR"
                  description="Our PR is already vetted against team standards and historical feedback. Reviews are faster, and we avoid back-and-forth cycles."
                  icon={GitPullRequest}
                />
                <WorkflowStep
                  title="The System Learns"
                  description="When we do get review comments, the system captures them automatically. The knowledge base grows over time, helping everyone on the team."
                  icon={TrendingUp}
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
              icon={Brain}
              title="Learn from Review Checklists"
              description="We benefit from review checklists that were created from feedback given to any team member, not just our own PRs."
            />
            <BenefitCard
              icon={Target}
              title="Fewer Mistakes"
              description="We stop repeating the same errors. If someone got feedback on it before, we can avoid it."
            />
            <BenefitCard
              icon={Users}
              title="Team Alignment"
              description="We all learn from the same knowledge base. New team members get up to speed faster."
            />
            <BenefitCard
              icon={Zap}
              title="Less Review Burden"
              description="Reviewers spend less time on repetitive feedback and more on architectural guidance."
            />
            <BenefitCard
              icon={TrendingUp}
              title="Continuous Improvement"
              description="Our knowledge base grows with every review. The more we use it, the smarter it gets."
            />
          </div>
        </section>

        {/* Technical Details Section */}
        <section>
          <TechnicalAccordion
            icon={Bug}
            title="Technical Details & Challenges"
            content={
              <div className="space-y-6 py-4 px-2">
                {/* Challenge 1 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Challenge: Identifying Insightful Comments</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      The biggest challenge is determining if a PR comment is actually an insightful point worth saving, or if it's just "LGTM", very code-specific suggestions, or other niche points rather than general learnings.
                    </p>
                    <p>
                      No level of sophisticated algorithm can perfectly solve this. The system uses <span className="text-theme-accent font-semibold">AI combined with algorithms</span> in the comment processing pipeline to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Register a comment as a new review checklist</li>
                      <li>Merge it into an existing review checklist as a reference (supporting evidence)</li>
                      <li>Filter out non-actionable comments</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Challenge 2 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Challenge: Token Limitations</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      The system can create and store very clean review checklists from all PR comments, but this number can reach <span className="text-theme-accent font-semibold">thousands</span>. When an IDE asks Reviewdoo for relevant checklists via MCP (based on diff, file changes, commit message, etc.), we can't return all matches—it would eat up the token context.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">Current approach:</span> Relevant checklists are capped at <span className="text-theme-accent font-semibold">20 max</span>. If there are many high-similarity matches, we might miss the 21st point. This is a known limitation that may be improved in the future.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Guidelines */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Guidelines: Language-Based Retrieval</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Guidelines are simpler than checklists. The AI IDE calls Reviewdoo's MCP to get relevant guidelines based on file changes (e.g., CSS, JS guidelines if changes are in those files).
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">Current approach:</span> The system returns <span className="text-theme-accent font-semibold">all guidelines</span> related to the changed file types, as all guidelines must be followed. Similarity checks don't matter as much here.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">Future improvement:</span> The system could check the diff and avoid sending guidelines that wouldn't apply to the specific changes. This isn't critical now since we don't have many guidelines yet, but it's something that can be optimized as the guideline base grows.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* The init workflow */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">The init Workflow: Context-Aware Instructions</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Running <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">@reviewdoo init</code> returns a single workflow that adapts to what's being reviewed:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Single commit vs. a range of commits</li>
                      <li>Uncommitted changes or a diff against a base branch</li>
                      <li>Different file types or project areas</li>
                    </ul>
                    <p>
                      The IDE asks which scope to check, then the <span className="text-theme-accent font-semibold">core MCP steps stay the same</span>—fetch the guidelines and review checklists relevant to the diff, then check the changes against them. No prompt to copy and paste.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Why AI IDEs */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Why This Document Talks About AI IDEs</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Reviewdoo is fundamentally an <span className="text-theme-accent font-semibold">MCP server</span>—it exposes tools via the Model Context Protocol that any MCP-compatible client can call. You could technically use it with any tool that supports MCP.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">However, AI IDEs are strongly recommended</span> (like Antigravity, Codex, Kiro, etc.) for three key reasons:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        <span className="text-theme-text font-semibold">Full Codebase Context:</span> AI IDEs can explore your entire codebase, not just the diff. They understand how changes fit into the bigger picture and can check related files.
                      </li>
                      <li>
                        <span className="text-theme-text font-semibold">Real-Time Feedback:</span> You get instant feedback while coding, not after submitting. You can fix issues immediately instead of waiting for review cycles.
                      </li>
                      <li>
                        <span className="text-theme-text font-semibold">Project Awareness:</span> AI IDEs understand your project structure, dependencies, and patterns. This context helps them give more relevant and actionable suggestions based on the guidelines and review checklists fetched from Reviewdoo.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* MCP Setup */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">MCP Setup: Manual Configuration Required</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Developers need to manually configure their <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">mcp.json</code> file to allow their IDEs to make MCP calls to Reviewdoo.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">This has been simplified:</span> A dedicated page on Reviewdoo provides the appropriate JSON configuration that you can simply copy and paste into your IDE's MCP settings.
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
                {!isAuthenticated ? "Log in to start using the tool." : ""} Run @reviewdoo init before your next PR and see how it helps catch issues before submitting.
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
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-theme-bg-elevated px-6 py-3 text-sm font-medium text-theme-text hover:bg-theme-bg-hover transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Read Again
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
