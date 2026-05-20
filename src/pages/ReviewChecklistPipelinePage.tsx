import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  Brain,
  Sparkles,
  CheckCircle2,
  Filter,
  ListChecks,
  ArrowRight,
  ArrowDown,
  GitMerge,
  Search,
  MessageSquare,
  BookOpen,
  LogIn,
  LucideIcon,
  ChevronDown,
  ChevronUp,
  Bug,
  Webhook,
  History,
  XCircle,
  Plus,
  ShieldCheck,
  Repeat,
  KeyRound,
  CircleAlert,
  Cog,
  Info,
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

export function ReviewChecklistPipelinePage() {
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
              Technical Deep Dive
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-4 bg-gradient-to-r from-theme-primary-light via-theme-text to-theme-accent bg-clip-text text-transparent">
              The Review Checklist Pipeline
            </h1>
            <p className="text-lg text-theme-text-muted leading-relaxed">
              How Review<span className="text-theme-primary">doo</span> turns raw PR comments into reusable team learnings—filtering noise, deduplicating insights, and building the knowledge base your AI IDE pulls from.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-theme-text-muted">
              <span className="text-theme-text font-medium">— Arib Ansari (aans)</span>
              <span className="text-theme-text-dim">•</span>
              <span>Pipeline v1</span>
            </div>
          </div>
        </div>

        {/* The Core Question */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">The Hard Part: Which Comments Are Worth Keeping?</h2>

          <Card className="border-theme-danger/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-8">
                A team's PRs receive hundreds of comments. Most aren't worth saving as reusable learnings. The pipeline's job is to keep the <span className="text-theme-accent font-semibold">few that actually generalize</span> and discard the rest.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <ProblemCard
                  icon={MessageSquare}
                  title="Generalizable Insight"
                  badge="Save"
                  badgeVariant="success"
                  example='"Always validate user input on the server side, not just the client."'
                  verdict="Keep — this rule applies to future PRs too."
                />
                <ProblemCard
                  icon={CircleAlert}
                  title="PR-Specific Nit"
                  badge="Discard"
                  badgeVariant="danger"
                  example='"Rename this variable from `x` to `userId` on line 42."'
                  verdict="Drop — tied to this exact change, not transferable."
                />
                <ProblemCard
                  icon={CheckCircle2}
                  title="Approval / LGTM"
                  badge="Discard"
                  badgeVariant="danger"
                  example='"LGTM 👍 ship it"'
                  verdict="Drop — caught by deterministic rules, no AI call needed."
                />
                <ProblemCard
                  icon={GitMerge}
                  title="Similar to Existing"
                  badge="Merge"
                  badgeVariant="info"
                  example='"This duplicates logic—extract a helper." (already saved twice before)'
                  verdict="Merge — attach as another reference instead of duplicating."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Pipeline Diagram - The Centerpiece */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">The Pipeline, End to End</h2>

          <Card className="border-theme-primary/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-10">
                Every comment—whether arriving from a polling cycle or the historical backfill, flows through the same six stages. Each stage either passes the comment forward, short-circuits to a discard, or branches the outcome.
              </p>

              <PipelineDiagram />
            </CardContent>
          </Card>
        </section>

        {/* Sources Section */}
        <section id="where-comments-come-from" className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">Where Comments Come From</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <SourceCard
              icon={History}
              title="Historical Backfill"
              description="When a teammate is added, a one-time background job walks every PR they've ever opened and pulls the comments they received—years of feedback in one go."
              points={[
                "Search API: q=author:{username} type:pr",
                "Cursor persisted on every page for resume",
                "Rate-limit aware (pauses, sleeps, resumes)",
              ]}
            />
            <SourceCard
              icon={Repeat}
              title="Periodic Polling"
              description="A scheduler re-runs a narrow version of the historical fetch every 10 minutes per author, scoped to recent activity. This is the primary ongoing ingestion path—no webhook config required."
              points={[
                "10-minute cycle, 60-minute lookback overlap",
                "Zero AI cost on already-seen comments",
                "Survives outages: missed comments caught next cycle",
              ]}
            />
          </div>

          <Card className="border-theme-info/20 bg-theme-bg-card/50 mt-4">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <IconBox icon={Webhook} variant="info" size="sm" className="mt-0.5" />
                <div className="text-sm text-theme-text-muted leading-relaxed">
                  <span className="text-theme-text font-semibold">Why polling, not webhooks:</span> Webhooks would deliver comments within seconds, but configuring them requires repo-admin access on GitHub—which contributor teams don't have on shared repositories. Polling trades a few minutes of latency for "works on any repo we can read." For an asynchronous "review-before-submit" workflow, the latency genuinely doesn't matter. Webhook support is preserved as optional infrastructure for installations that do have repo-admin access.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Qualification Gate Deep Dive */}
        <section id="qualification-gate" className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">The Qualification Gate</h2>

          <Card className="border-theme-accent/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-8">
                The gate decides <span className="text-theme-accent font-semibold">save</span> or <span className="text-theme-danger font-semibold">discard</span>. It runs cheap deterministic rules first, only falling back to an AI classifier when no rule matches. This keeps the cost-per-comment low and most discards explainable.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <GateColumn
                  title="Stage 1: Deterministic Rules"
                  subtitle="Free · Instant · No AI call"
                  variant="success"
                  rules={[
                    { label: "Bot author", desc: "user.type=Bot or [bot] suffix" },
                    { label: "Self-comment by PR author", desc: "PR author replying on their own PR" },
                    { label: "Too short", desc: "< 12 non-whitespace chars" },
                    { label: "Approval-only", desc: 'LGTM, "looks good", +1, 👍' },
                    { label: "Acknowledgement reply", desc: '"thanks", "done", "fixed"' },
                    { label: "Question-only", desc: "ends in ? without imperative verb" },
                  ]}
                />
                <GateColumn
                  title="Stage 2: AI Classifier"
                  subtitle="One processing call · temperature=0"
                  variant="info"
                  rules={[
                    { label: "generalizable_insight", desc: "→ save (if confidence ≥ 0.6)" },
                    { label: "pr_specific_nit", desc: "→ discard" },
                    { label: "question", desc: "→ discard" },
                    { label: "acknowledgement", desc: "→ discard" },
                    { label: "other", desc: "→ discard" },
                    { label: "low confidence", desc: "→ discard (any classification < 0.6)" },
                  ]}
                />
              </div>

              <div className="mt-8 p-4 rounded-lg bg-theme-bg-elevated border border-theme-primary/20">
                <div className="flex items-start gap-3">
                  <IconBox icon={ShieldCheck} variant="primary" size="sm" className="border mt-0.5" />
                  <div className="text-sm text-theme-text-muted">
                    <span className="text-theme-text font-semibold">Determinism guarantee:</span> The same comment, processed twice with the same <code className="px-1 py-0.5 rounded bg-theme-bg-card text-theme-accent text-xs">gateVersion</code> and the same AI config, produces the same verdict. We use <code className="px-1 py-0.5 rounded bg-theme-bg-card text-theme-accent text-xs">temperature=0</code> on the classifier and a fixed prompt template, so re-runs are reproducible.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Save vs Merge */}
        <section id="deduplication" className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">Save or Merge? The Deduplication Step</h2>

          <Card className="border-theme-info/20 bg-theme-bg-card/50 py-3 px-4">
            <CardContent className="pt-6">
              <p className="text-theme-text-muted mb-8">
                Once the gate says <span className="text-theme-success font-semibold">save</span>, the pipeline extracts a structured insight and embeds it. Before creating a new checklist, we check whether something similar already exists.
              </p>

              <div className="space-y-6">
                <DedupStep
                  number="1"
                  icon={Brain}
                  title="Extract Insight"
                  description="The processing AI returns a structured object: description, severity, category, languages, file patterns. This is the canonical form of the learning."
                />
                <DedupStep
                  number="2"
                  icon={Sparkles}
                  title="Generate Embedding"
                  description="The embedding AI converts the description into a vector. We store these in PostgreSQL via the pgvector extension."
                />
                <DedupStep
                  number="3"
                  icon={Search}
                  title="Cosine Similarity Search"
                  description="One pgvector query finds the nearest existing checklist. If similarity ≥ 0.92 (configurable), we merge as a reference instead of creating a new checklist."
                />
                <DedupStep
                  number="4"
                  icon={GitMerge}
                  title="Persist Outcome"
                  description="Either a new ReviewChecklist + Reference + Embedding, or a new Reference attached to the existing checklist with growing supporting evidence."
                  isLast
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Idempotency & Reliability */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-theme-text">Built for Retries</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={Repeat}
              title="Idempotent by Comment ID"
              description="Every Reference and RejectedComment is unique on (externalCommentId, commentKind). Process the same comment twice → same end state, zero AI cost on the duplicate."
            />
            <BenefitCard
              icon={KeyRound}
              title="Polling Catches Missed Activity"
              description="Each cycle re-queries a 60-minute lookback window. If we were down or slow, the next cycle finds whatever we missed—nothing falls through the cracks."
            />
            <BenefitCard
              icon={Cog}
              title="Resumable Backfills"
              description="The historical fetcher persists its cursor on every page. A server restart re-enqueues running jobs from where they left off."
            />
            <BenefitCard
              icon={ShieldCheck}
              title="Edit-Aware"
              description="If a comment's content hash changes between cycles, we re-run the gate on the new body. If it no longer qualifies, the Reference becomes a RejectedComment."
            />
            <BenefitCard
              icon={Filter}
              title="Rejection Inspection"
              description="Discarded comments aren't gone—they're saved to RejectedComment. Admins inspect them and one-click promote anything the gate misclassified."
            />
            <BenefitCard
              icon={ListChecks}
              title="Event Timeline"
              description="Every meaningful transition emits an IngestionEvent. The Ingestion Logs page renders the full timeline so you can debug why any comment did or didn't make it."
            />
          </div>
        </section>

        {/* Architecture Decisions */}
        <section>
          <TechnicalAccordion
            icon={Bug}
            title="Architecture Decisions & Tradeoffs"
            content={
              <div className="space-y-6 py-4 px-2">
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Tracked Authors Are PR Authors, Not Reviewers</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      The point of Reviewdoo is "stop repeating mistakes our PRs have been called out on." So we watch the <span className="text-theme-accent font-semibold">team's own PRs</span> for incoming feedback, not what the team writes on others' PRs.
                    </p>
                    <p>
                      The historical fetcher uses GitHub's search query <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">author:{`{username}`} type:pr</code> to find PRs opened by the tracked person, then walks every comment kind on those PRs. Self-comments by the PR author are filtered out as they're usually clarifications, not feedback.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">One System-Wide AI Config for Ingestion</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      Background jobs (polling, historical, optional webhooks) don't have a logged-in user. Instead of guessing whose API key to use, an admin explicitly picks one <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">processing</code> and one <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">embedding</code> AIModelConfig on a dedicated config page.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">Tradeoff:</span> one admin pays for all pipeline AI calls. Acceptable at team scale; the deterministic rules and idempotency check together keep the volume low — already-processed comments never hit the AI providers.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">PR-Level State Is Not Stored</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      We don't track which PRs have been ingested. The GitHub Search API gives us the full list of a tracked author's PRs every time we re-run; the cost is a few cheap API calls. Idempotency is enforced at the <span className="text-theme-accent font-semibold">comment level</span> via a unique constraint on <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">(externalCommentId, commentKind)</code>.
                    </p>
                    <p>
                      So a re-run after a server restart is safe and cheap—already-processed comments skip the AI calls entirely.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Platform Adapter Boundary</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      All GitHub-specific code lives behind a <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">PlatformAdapter</code> interface. The pipeline only operates on a generic <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">RawComment</code> shape—no <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">if (platform === "github")</code> branches anywhere downstream.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">If we migrate to a self-hosted git platform:</span> write a new adapter implementing <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">searchPullRequestsByAuthor</code>, <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">fetchCommentsForPR</code>, <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">verifyWebhookSignature</code>, and <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">parseWebhookPayload</code>. The pipeline doesn't change.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">Gate Versioning</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      The gate's deterministic rules and AI prompt are tagged with a <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">gateVersion</code> constant. When we change the rules, we bump the version manually.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">We don't auto-replay</span> historical comments after a bump—too expensive. Instead, admins can review the Rejected Comments page and promote anything the new rules would have saved.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text">In-Memory Job Queue</h3>
                  <div className="text-sm text-theme-text-muted leading-relaxed space-y-2 ml-6">
                    <p>
                      No Redis. No BullMQ. A simple in-process queue that survives restarts by re-enqueuing any <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">running</code> or <code className="px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-accent text-xs">paused</code> IngestionLog from its persisted cursor on boot.
                    </p>
                    <p>
                      <span className="text-theme-text font-semibold">Tradeoff:</span> this works for one team's volume. If we ever needed multi-instance deployment, we'd swap in a real queue—but the pipeline contract wouldn't change.
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
              <h3 className="text-2xl font-semibold text-theme-text">Want the Bigger Picture?</h3>
              <p className="text-theme-text-muted max-w-2xl mx-auto">
                The pipeline feeds a knowledge base your AI IDE pulls from before you submit a PR. Read the About page to see how the whole system fits together.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <a
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-lg bg-theme-primary px-6 py-3 text-sm font-medium text-white hover:bg-theme-primary-dark transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Read About Reviewdoo
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-theme-bg-elevated px-6 py-3 text-sm font-medium text-theme-text hover:bg-theme-bg-hover transition-colors"
                >
                  <ArrowRight className="h-4 w-4 rotate-[-90deg]" />
                  Back to Top
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PipelineDiagram() {
  return (
    <div className="space-y-2">
      {/* Sources */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <SourceBubble icon={History} label="Historical" sublabel="one-time backfill" />
        <span className="text-theme-text-dim text-sm">or</span>
        <SourceBubble icon={Repeat} label="Polling" sublabel="every 10 min" />
      </div>

      <DownArrow label="Raw Comment" />

      {/* Stage 1: Normalize */}
      <PipelineStage
        number="1"
        icon={Filter}
        title="Normalize"
        subtitle="Strip bot markers, collapse whitespace, hash"
        cost="Free"
        variant="default"
      />

      <DownArrow />

      {/* Stage 2: Qualification Gate */}
      <PipelineStage
        number="2"
        icon={ShieldCheck}
        title="Qualification Gate"
        subtitle="Deterministic rules → AI classifier (if no rule matches)"
        cost="≤ 1 processing call"
        variant="primary"
        readMoreLink="#qualification-gate"
      />

      {/* Branch: discard or save */}
      <BranchPoint />

      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Discard branch */}
        <div className="space-y-2">
          <BranchLabel label="Discard" variant="danger" extraClasses="!justify-end pr-12" />
          <PipelineStage
            number="✕"
            icon={XCircle}
            title="RejectedComment"
            subtitle="Saved with reason · admin can promote later"
            cost="DB write"
            variant="danger"
            compact
          />
        </div>

        {/* Save branch — continues through stages */}
        <div className="space-y-2">
          <BranchLabel label="Save" variant="success" readMoreLink="#deduplication" extraClasses="!justify-start pl-14" />
          <PipelineStage
            number="3"
            icon={Brain}
            title="Extract Insight"
            subtitle="description · severity · category · languages"
            cost="1 processing call"
            variant="info"
            compact
          />
          <DownArrowSmall />
          <PipelineStage
            number="4"
            icon={Sparkles}
            title="Generate Embedding"
            subtitle="vector for cosine search"
            cost="1 embedding call"
            variant="info"
            compact
          />
          <DownArrowSmall />
          <PipelineStage
            number="5"
            icon={Search}
            title="Deduplicate"
            subtitle="pgvector cosine similarity"
            cost="1 SQL query"
            variant="accent"
            compact
          />
        </div>
      </div>

      {/* Final branch under save: new vs merge */}
      <div className="grid grid-cols-2 gap-6 mt-4">
        <div /> {/* empty under discard */}
        <div className="space-y-2">
          <BranchPointSmall />
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="space-y-2">
              <BranchLabel label="< threshold" variant="success" small />
              <PipelineStage
                number="6"
                icon={Plus}
                title="New Checklist"
                subtitle="ReviewChecklist + Reference + Embedding"
                cost="DB write"
                variant="success"
                compact
                tight
              />
            </div>
            <div className="space-y-2">
              <BranchLabel label="≥ threshold" variant="info" small />
              <PipelineStage
                number="6"
                icon={GitMerge}
                title="Merge"
                subtitle="Reference attached to existing checklist"
                cost="DB write"
                variant="info"
                compact
                tight
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-10">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-theme-text-muted bg-theme-body px-6 py-3 rounded-md w-fit mx-auto border border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-theme-primary" />
            <span>Gate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-theme-info" />
            <span>AI Call</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-theme-accent" />
            <span>Vector Lookup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-theme-success" />
            <span>Save</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-theme-danger" />
            <span>Discard</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceBubble({ icon: Icon, label, sublabel }: { icon: LucideIcon; label: string; sublabel: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-theme-info/20 text-theme-info border-2 border-theme-info/40 shadow-lg">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-theme-text">{label} <a href="#where-comments-come-from"><Info className="inline text-theme-text-dim w-3 h-3 ml-0.5" /></a></div>
        <div className="text-xs text-theme-text-muted">{sublabel}</div>
      </div>
    </div>
  );
}

function DownArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      {label && <div className="text-xs text-theme-text-muted italic mb-1">{label}</div>}
      <ArrowDown className="h-5 w-5 text-theme-accent" />
    </div>
  );
}

function DownArrowSmall() {
  return (
    <div className="flex justify-center">
      <ArrowDown className="h-4 w-4 text-theme-text-dim" />
    </div>
  );
}

function BranchPoint() {
  return (
    <div className="flex justify-center py-2">
      <div className="flex flex-col items-center">
        <ArrowDown className="h-5 w-5 text-theme-accent" />
        <div className="h-px w-48 bg-theme-text-dim/30 mt-1" />
        <div className="flex justify-between w-48 -mt-px">
          <div className="h-4 w-px bg-theme-text-dim/30" />
          <div className="h-4 w-px bg-theme-text-dim/30" />
        </div>
      </div>
    </div>
  );
}

function BranchPointSmall() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center">
        <ArrowDown className="h-4 w-4 text-theme-text-dim" />
        <div className="h-px w-32 bg-theme-text-dim/30 mt-1" />
        <div className="flex justify-between w-32 -mt-px">
          <div className="h-3 w-px bg-theme-text-dim/30" />
          <div className="h-3 w-px bg-theme-text-dim/30" />
        </div>
      </div>
    </div>
  );
}

function BranchLabel({ label, variant, small = false, readMoreLink, extraClasses }: { label: string; variant: "success" | "danger" | "info"; small?: boolean, readMoreLink?: string, extraClasses?: string }) {
  const variantClasses = {
    success: "bg-theme-success/10 text-theme-success border-theme-success/30",
    danger: "bg-theme-danger/10 text-theme-danger border-theme-danger/30",
    info: "bg-theme-info/10 text-theme-info border-theme-info/30",
  };
  return (
    <div className={`flex items-center justify-center gap-1 ${extraClasses}`}>
      <div className={`w-fit px-2.5 py-0.5 rounded-full border text-xs font-mono ${variantClasses[variant]} ${small ? "text-[10px]" : ""}`}>
        {label}
      </div>
      {readMoreLink && <a href={readMoreLink}><Info className="inline text-theme-text-dim w-3 h-3" /></a>}
    </div>
  );
}

function PipelineStage({
  number,
  icon: Icon,
  title,
  subtitle,
  cost,
  variant,
  compact = false,
  tight = false,
  readMoreLink,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  cost: string;
  variant: "default" | "primary" | "info" | "accent" | "success" | "danger";
  compact?: boolean;
  tight?: boolean;
  readMoreLink?: string;
}) {
  const variantClasses = {
    default: "bg-theme-bg-elevated border-border",
    primary: "bg-theme-primary/10 border-theme-primary/30",
    info: "bg-theme-info/10 border-theme-info/30",
    accent: "bg-theme-accent/10 border-theme-accent/30",
    success: "bg-theme-success/10 border-theme-success/30",
    danger: "bg-theme-danger/10 border-theme-danger/30",
  };
  const iconVariant = (variant === "default" ? "default" : variant) as "default" | "primary" | "info" | "accent" | "success" | "danger";

  return (
    <div className={`flex items-center gap-3 rounded-lg border ${variantClasses[variant]} ${compact ? "p-3" : "p-4"} ${tight ? "min-h-0" : ""}`}>
      <div className="relative flex-shrink-0">
        <IconBox icon={Icon} variant={iconVariant} size={compact ? "md" : "lg"} className={variant === "primary" ? "border" : ""} />
        <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-theme-accent text-theme-bg-card text-[10px] font-bold">
          {number}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-theme-text flex items-center gap-2 ${compact ? "text-sm" : ""}`}>{title} {readMoreLink && <a href={readMoreLink}><Info className="inline text-theme-text-muted w-4 h-4" /></a>}</div>
        <div className={`text-theme-text-muted ${compact ? "text-xs" : "text-sm"}`}>{subtitle}</div>
      </div>
      {!tight && (
        <div className="flex-shrink-0 text-[10px] uppercase tracking-wide text-theme-text-dim font-mono px-2 py-1 rounded bg-theme-bg-card border border-border whitespace-nowrap">
          {cost}
        </div>
      )}
    </div>
  );
}

function ProblemCard({
  icon,
  title,
  badge,
  badgeVariant,
  example,
  verdict,
}: {
  icon: LucideIcon;
  title: string;
  badge: string;
  badgeVariant: "success" | "danger" | "info";
  example: string;
  verdict: string;
}) {
  const badgeClasses = {
    success: "bg-theme-success/20 text-theme-success border-theme-success/30",
    danger: "bg-theme-danger/20 text-theme-danger border-theme-danger/30",
    info: "bg-theme-info/20 text-theme-info border-theme-info/30",
  };
  const iconVariant = badgeVariant === "danger" ? "danger" : badgeVariant === "success" ? "success" : "info";

  return (
    <div className="space-y-3 p-4 rounded-lg bg-theme-bg-elevated border border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconBox icon={icon} variant={iconVariant} />
          <h3 className="font-semibold text-theme-text">{title}</h3>
        </div>
        <Badge className={`border ${badgeClasses[badgeVariant]}`}>{badge}</Badge>
      </div>
      <div className="text-sm text-theme-text-muted italic border-l-2 border-theme-text-dim/30 pl-3 py-1">
        {example}
      </div>
      <div className="text-sm text-theme-text-muted">
        {verdict}
      </div>
    </div>
  );
}

function SourceCard({
  icon,
  title,
  description,
  points,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <Card className="border-theme-info/20 bg-theme-bg-card/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <IconBox icon={icon} variant="info" size="lg" />
            <h3 className="font-semibold text-theme-text">{title}</h3>
          </div>
          <p className="text-sm text-theme-text-muted leading-relaxed">{description}</p>
          <ul className="space-y-1.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-xs text-theme-text-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-theme-success mt-0.5 flex-shrink-0" />
                <span className="font-mono">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function GateColumn({
  title,
  subtitle,
  variant,
  rules,
}: {
  title: string;
  subtitle: string;
  variant: "success" | "info";
  rules: Array<{ label: string; desc: string }>;
}) {
  const variantClasses = {
    success: "border-theme-success/30",
    info: "border-theme-info/30",
  };

  return (
    <div className={`rounded-lg border ${variantClasses[variant]} bg-theme-bg-elevated p-5 space-y-4`}>
      <div>
        <h3 className="font-semibold text-theme-text">{title}</h3>
        <p className="text-xs text-theme-text-muted font-mono mt-1">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-start gap-2 text-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-theme-accent mt-2 flex-shrink-0" />
            <div>
              <div className="text-theme-text font-medium">{rule.label}</div>
              <div className="text-xs text-theme-text-muted">{rule.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DedupStep({
  number,
  icon,
  title,
  description,
  isLast = false,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <IconBox icon={icon} variant="primary" className="border" />
          <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-theme-accent text-theme-bg-card text-[10px] font-bold">
            {number}
          </div>
        </div>
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
