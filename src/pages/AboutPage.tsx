import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
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
  Network,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  FileCode,
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
              For Website@Odoo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-4 bg-gradient-to-r from-theme-primary-light via-theme-text to-theme-accent bg-clip-text text-transparent">
              Learn from Every Review, Stop Repeating Mistakes
            </h1>
            <p className="text-lg text-theme-text-muted leading-relaxed">
              With Review<span className="text-theme-primary">doo</span>, we can capture feedback from past PR reviews and our team's coding guidelines, then use them to catch issues before submitting code—so we don't repeat mistakes our team has already learned from.
            </p>
          </div>
        </div>

        {/* The Challenge Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">The Challenge We Face</h2>

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
          <h2 className="text-2xl font-semibold text-theme-text">How Reviewdoo Helps Our Workflow</h2>

          <Card className="border-theme-success/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-10">
                With Reviewdoo, we can automatically capture review checklists and use them as a <span className="text-theme-accent font-semibold">quality check before submitting PRs</span>. This means fewer review cycles and faster merges.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <SolutionStep
                  number="1"
                  icon={Database}
                  title="Capture"
                  description="We automatically collect PR review comments from our team and store them in a searchable database"
                />
                <SolutionStep
                  number="2"
                  icon={Brain}
                  title="Learn"
                  description="AI extracts patterns from feedback and groups similar comments together so we don't duplicate knowledge"
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
                  title="We Generate a Review Prompt"
                  description="Before submitting the PR, we generate a detailed prompt on Reviewdoo that includes instructions on how to best review the code, how the AI IDE can call Reviewdoo's MCPs to fetch our team's relevant coding guidelines, and comments that were made on others' PRs."
                  icon={Sparkles}
                />
                <WorkflowStep
                  title="We Run AI Review in Our AI IDE"
                  description="We paste the prompt into our AI IDE (Cursor, Kiro, etc.). The AI IDE follows the instructions, calls MCPs to fetch guidelines and review checklists, then analyzes our changes with full codebase context."
                  icon={Brain}
                />
                <WorkflowStep
                  title="We Fix Issues Proactively"
                  description="The AI IDE points out issues based on review checklists and team guidelines. We fix them immediately, before any human reviewer sees the code."
                  icon={CheckCircle2}
                />
                <WorkflowStep
                  title="We Submit a Cleaner PR"
                  description="Our PR is already vetted against team standards and historical feedback. Reviews are faster, and we avoid back-and-forth cycles."
                  icon={GitPullRequest}
                />
                <WorkflowStep
                  title="The System Learns"
                  description="When we do get review comments, Reviewdoo captures them automatically. The knowledge base grows, helping everyone on the team."
                  icon={TrendingUp}
                  isLast
                />
              </div>

              {/* Flow Diagram */}
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-theme-text mb-6 text-center">Review Flow Diagram</h3>

                <div className="max-w-5xl mx-auto">
                  <div className="flex items-center gap-8">
                    {/* Left Actor - Reviewdoo */}
                    <div className="flex flex-col items-center justify-center self-stretch gap-3 w-32 border-r border-theme-primary/30 pr-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-theme-primary/20 text-theme-primary-light border-2 border-theme-primary/40 shadow-lg">
                        <Database className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-theme-text">Reviewdoo</div>
                        <div className="text-xs text-theme-text-muted">Knowledge Base</div>
                      </div>
                    </div>

                    {/* Middle - Flow Diagram */}
                    <div className="flex-1 py-10 px-4">
                      <div className="space-y-10">
                        {/* Step 1: Reviewdoo → IDE */}
                        <div className="relative">
                          <div className="flex items-center">
                            {/* Left label */}
                            <div className="flex items-center gap-2 pr-4 pl-5 py-2 rounded-lg bg-theme-primary/10 border border-theme-primary/30 relative">
                              <div className="absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent border-2 border-theme-bg-card text-theme-bg-card text-xs font-bold">
                                1
                              </div>
                              <span className="text-sm font-medium text-theme-text">Generate Prompt</span>
                              <Sparkles className="h-4 w-4 text-theme-primary-light" />
                            </div>
                            {/* Arrow line */}
                            <div className="flex-1 flex items-center px-4">
                              <div className="flex-1 h-0.5 bg-gradient-to-r from-theme-primary/50 to-theme-info/50" />
                              <ArrowRight className="h-5 w-5 text-theme-accent -ml-2" />
                            </div>
                            {/* Right muted text */}
                            <div className="text-xs text-theme-text-muted italic">Paste in AI IDE</div>
                          </div>
                          {/* Connecting dotted line to next step */}
                          <div className="absolute -right-6 top-[50%] h-20 w-3 border-r border-b border-t border-dashed border-theme-text-dim/30" />
                        </div>

                        {/* Step 2: IDE → Reviewdoo */}
                        <div className="relative">
                          <div className="flex items-center">
                            {/* Left muted text */}
                            <div className="text-xs text-theme-text-muted italic text-center">Request relevant <br />guideline and checklist</div>
                            {/* Arrow line */}
                            <div className="flex-1 flex items-center justify-end px-4">
                              <ArrowRight className="h-5 w-5 text-theme-accent rotate-180 -mr-2" />
                              <div className="flex-1 h-0.5 bg-gradient-to-l from-theme-primary/50 to-theme-info/50" />
                            </div>
                            {/* Right label */}
                            <div className="flex items-center gap-2 pr-5 pl-4 py-2 rounded-lg bg-theme-info/10 border border-theme-info/30 relative">
                              <div className="absolute -right-4 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent border-2 border-theme-bg-card text-theme-bg-card text-xs font-bold">
                                2
                              </div>
                              <Network className="h-4 w-4 text-theme-info" />
                              <span className="text-sm font-medium text-theme-text">Call MCP</span>
                            </div>
                          </div>
                          {/* Connecting dotted line to next step */}
                          <div className="absolute -left-6 top-[50%] h-20 w-3 border-l border-b border-t border-dashed border-theme-text-dim/30" />
                        </div>

                        {/* Step 3: Reviewdoo → IDE */}
                        <div className="relative">
                          <div className="flex items-center">
                            {/* Left label */}
                            <div className="flex items-center gap-2 pr-4 pl-5 py-2 rounded-lg bg-theme-primary/10 border border-theme-primary/30 relative">
                              <div className="absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent border-2 border-theme-bg-card text-theme-bg-card text-xs font-bold">
                                3
                              </div>
                              <span className="text-sm font-medium text-theme-text">Return Data</span>
                              <FileCode className="h-4 w-4 text-theme-primary-light" />
                            </div>
                            {/* Arrow line */}
                            <div className="flex-1 flex items-center px-4">
                              <div className="flex-1 h-0.5 bg-gradient-to-r from-theme-primary/50 to-theme-info/50" />
                              <ArrowRight className="h-5 w-5 text-theme-accent -ml-2" />
                            </div>
                            {/* Right muted text */}
                            <div className="text-xs text-theme-text-muted italic text-center">Receive relevant<br />guideline and checklist</div>
                          </div>
                          {/* Connecting dotted line to next step */}
                          <div className="absolute -right-6 top-[50%] h-20 w-3 border-r border-b border-t border-dashed border-theme-text-dim/30" />
                        </div>

                        {/* Step 4: IDE processes */}
                        <div className="relative">
                          <div className="flex flex-col items-end gap-0.5">
                            {/* Right label */}
                            <div className="flex items-center gap-2 pr-5 pl-4 py-2 rounded-lg bg-theme-info/10 border border-theme-info/30 relative">
                              <div className="absolute -right-4 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent border-2 border-theme-bg-card text-theme-bg-card text-xs font-bold">
                                4
                              </div>
                              <CheckCircle2 className="h-5 w-5 text-theme-success" />
                              <span className="text-sm font-medium text-theme-text">AI Reviews Code</span>
                            </div>
                            <div className="text-xs text-theme-text-muted italic">Based on guidelines & history</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Actor - AI IDE */}
                    <div className="flex flex-col items-center justify-center self-stretch gap-3 w-32 border-l border-theme-info/30 pl-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-theme-info/20 text-theme-info border-2 border-theme-info/40 shadow-lg">
                        <Code2 className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-theme-text">AI IDE</div>
                        <div className="text-xs text-theme-text-muted">Cursor, Kiro, etc.</div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-theme-text-muted mt-8 bg-theme-body px-6 py-2 rounded-sm w-fit mx-auto">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-theme-primary" />
                      <span>Reviewdoo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-theme-info" />
                      <span>IDE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-theme-accent" />
                      <span>Flow</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why Use AI IDEs Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">Why We Use AI IDEs</h2>

          <Card className="border-theme-info/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-6">
                We integrate Reviewdoo with AI IDEs (like Cursor or Kiro) because they give us better results than simple chat-based AI reviews:
              </p>

              <div className="grid gap-10 md:grid-cols-2">
                <IDEBenefitCard
                  icon={FileCode}
                  title="Full Codebase Context"
                  description="Our AI IDE can explore the entire codebase, not just the diff. It understands how our changes fit into the bigger picture and can check related files."
                />
                <IDEBenefitCard
                  icon={Network}
                  title="MCP Integration"
                  description="With Model Context Protocol, our AI IDE can call Reviewdoo's APIs to fetch relevant guidelines and review checklists dynamically as we code."
                />
                <IDEBenefitCard
                  icon={Zap}
                  title="Real-Time Feedback"
                  description="We get instant feedback while coding, not after submitting. We can fix issues immediately instead of waiting for review cycles."
                />
                <IDEBenefitCard
                  icon={Layers}
                  title="Project Awareness"
                  description="Our AI IDE understands our project structure, dependencies, and patterns. This context helps it give us more relevant and actionable suggestions."
                />
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
                      No level of sophisticated algorithm can perfectly solve this. We use <span className="text-theme-accent font-semibold">AI combined with algorithms</span> in our comment processing pipeline to:
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
                      We can create and store very clean review checklists from all PR comments, but this number can reach <span className="text-theme-accent font-semibold">thousands</span>. When an IDE asks Reviewdoo for relevant checklists via MCP (based on diff, file changes, commit message, etc.), we can't return all matches—it would eat up the token context.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">Current approach:</span> We cap relevant checklists at <span className="text-theme-accent font-semibold">20 max</span>. If there are many high-similarity matches, we might miss the 21st point. This is a known limitation that we'll possibly improve.
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
                      <span className="text-theme-text font-semibold">Current approach:</span> We return <span className="text-theme-accent font-semibold">all guidelines</span> related to the changed file types, as all guidelines must be followed. Similarity checks don't matter as much here.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">Future improvement:</span> We could check the diff and avoid sending guidelines that wouldn't apply to the specific changes. This isn't critical now since we don't have many guidelines yet, but it's something we can optimize as the guideline base grows.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Prompt Generation */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Prompt Generation: Context-Aware Instructions</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      We may have to generate slightly different review prompt based on task we're reviewing:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Single commit vs. multiple commits</li>
                      <li>Changes across multiple repositories</li>
                      <li>Different file types or project areas</li>
                    </ul>
                    <p>
                      However, the <span className="text-theme-accent font-semibold">core MCP instructions remain the same</span>—how to call MCPs to fetch guidelines and review checklists.
                    </p>
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
                      <span className="text-theme-text font-semibold">We're making this easy:</span> A dedicated page on Reviewdoo will provide the appropriate JSON configuration that you can simply copy and paste into your IDE's MCP settings.
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
                {!isAuthenticated ? "Log in to start using Reviewdoo." : ""} Generate your first review prompt and see how it helps catch issues before submitting your next PR.
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

function IDEBenefitCard({
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
      <IconBox icon={icon} variant="info" />
      <div>
        <h3 className="font-semibold text-theme-text mb-1">{title}</h3>
        <p className="text-sm text-theme-text-muted">{description}</p>
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
