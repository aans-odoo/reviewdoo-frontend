import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  FileCode,
  Network,
  Sparkles,
} from "lucide-react";

/**
 * The Reviewdoo review-flow diagram, shared between the About page and the
 * How-to-Use page so both render an identical picture of the init workflow:
 * the IDE runs `init`, calls Reviewdoo over MCP for the relevant review
 * checklists, gets them back, and reviews the code locally.
 *
 * Self-contained (no props) so the two pages stay in sync by construction.
 */
export function ReviewFlowDiagram() {
  return (
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
                  <span className="text-sm font-medium text-theme-text">Run init</span>
                  <Sparkles className="h-4 w-4 text-theme-primary-light" />
                </div>
                {/* Arrow line */}
                <div className="flex-1 flex items-center px-4">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-theme-primary/50 to-theme-info/50" />
                  <ArrowRight className="h-5 w-5 text-theme-accent -ml-2" />
                </div>
                {/* Right muted text */}
                <div className="text-xs text-theme-text-muted italic">@reviewdoo init</div>
              </div>
              {/* Connecting dotted line to next step */}
              <div className="absolute -right-6 top-[50%] h-20 w-3 border-r border-b border-t border-dashed border-theme-text-dim/30" />
            </div>

            {/* Step 2: IDE → Reviewdoo */}
            <div className="relative">
              <div className="flex items-center">
                {/* Left muted text */}
                <div className="text-xs text-theme-text-muted italic text-center">Request relevant <br />review checklists</div>
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
                <div className="text-xs text-theme-text-muted italic text-center">Receive relevant<br />review checklists</div>
              </div>
              {/* Connecting dotted line to next step */}
              <div className="absolute -right-6 top-[50%] h-20 w-3 border-r border-b border-t border-dashed border-theme-text-dim/30" />
            </div>

            {/* Step 4: IDE processes */}
            <div className="relative">
              <div className="flex flex-col items-end gap-1">
                {/* Right label */}
                <div className="flex items-center gap-2 pr-5 pl-4 py-2 rounded-lg bg-theme-info/10 border border-theme-info/30 relative">
                  <div className="absolute -right-4 flex h-6 w-6 items-center justify-center rounded-full bg-theme-accent border-2 border-theme-bg-card text-theme-bg-card text-xs font-bold">
                    4
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-theme-success" />
                  <span className="text-sm font-medium text-theme-text">Check for violations</span>
                </div>
                <div className="text-xs text-theme-text-muted italic">Flags anything that breaks a review checklist</div>
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
            <div className="text-xs text-theme-text-muted">Antigravity, Codex, Kiro, etc.</div>
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
  );
}
