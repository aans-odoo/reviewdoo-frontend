import { cn } from '@/lib/utils';
import { useId, useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, selectTriggerClassName } from '@/components/ui/select';
import { MultiSelect } from '@/components/shared/MultiSelect';
import { ChipInput } from '@/components/shared/ChipInput';
import { VersionSelect } from './VersionSelect';
import { LANGUAGE_OPTIONS, SCOPE_USES_FILES } from '@/lib/checklistApplicability';
import { validateVersionRange } from '@/lib/checklistVersions';
import { useReleaseCatalog } from '@/hooks/useReleaseCatalog';
import { type AppliesToFilters, EMPTY_APPLIES_TO, appliesToFilterCount } from '@/lib/appliesToFilters';

export function AppliesToFilter({ value, onChange }: { value: AppliesToFilters; onChange: (value: AppliesToFilters) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [panelHeight, setPanelHeight] = useState(480);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const { catalog, error, retry } = useReleaseCatalog();
  const count = appliesToFilterCount(value);
  const versionError = draft.version ? validateVersionRange({ minVersion: draft.version }, catalog?.minorReleaseCount, catalog) : null;
  const usesFiles = !draft.scope || SCOPE_USES_FILES.has(draft.scope);

  useEffect(() => {
    if (!open) return;
    const resize = () => setPanelHeight(Math.max(180, window.innerHeight - (trigger.current?.getBoundingClientRect().bottom ?? 0) - 24));
    resize();
    window.addEventListener('resize', resize);
    const dismiss = (event: PointerEvent) => {
      // Let an open nested Select consume the first outside press. Read this
      // in capture phase, before Radix closes it and updates aria-expanded.
      if (root.current?.querySelector('[role="combobox"][aria-expanded="true"]')) return;
      const target = event.target as Element;
      // Select menus render in a portal outside the panel.
      if (!root.current?.contains(target) && !target.closest('[data-radix-popper-content-wrapper]')) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss, true);
    return () => { document.removeEventListener('pointerdown', dismiss, true); window.removeEventListener('resize', resize); };
  }, [open]);

  return <div ref={root} className="relative space-y-2" onKeyDown={event => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      setOpen(false);
      trigger.current?.focus();
    }
  }}>
    <Label htmlFor={`${id}-trigger`}>Applies to</Label>
    <button type="button" ref={trigger} id={`${id}-trigger`} className={cn(selectTriggerClassName, "w-40 gap-3")} aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => {
      if (!open) setDraft(value);
      setOpen(!open);
    }}>
      <span>{count ? `${count} active filter${count === 1 ? '' : 's'}` : 'All'}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-theme-text-dim" />
    </button>
    {open && <section id={`${id}-panel`} aria-label="Filter by applicability" style={{ maxHeight: panelHeight }} className="absolute left-0 z-40 w-[min(24rem,calc(100vw-6.5rem))] overflow-y-auto space-y-4 rounded-lg border border-border bg-theme-bg-card p-4 shadow-lg">
      <p className="text-sm text-theme-text-muted">Match all filled fields. Within languages or file patterns, match any selected value.</p>
      <div className="space-y-2">
        <Label htmlFor={`${id}-scope`}>Scope</Label>
        <Select value={draft.scope || 'all'} onValueChange={scope => setDraft({ ...draft, scope: scope === 'all' ? '' : scope, ...(!SCOPE_USES_FILES.has(scope) && scope !== 'all' ? { languages: [], filePatterns: [] } : {}) })}>
          <SelectTrigger id={`${id}-scope`}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any scope</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="commit_message">Commit</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {usesFiles && <>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Languages</legend>
          <MultiSelect options={LANGUAGE_OPTIONS} selected={draft.languages} onChange={languages => setDraft({ ...draft, languages })} placeholder="Any language" />
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor={`${id}-files`}>File patterns</Label>
          <ChipInput id={`${id}-files`} values={draft.filePatterns} onChange={filePatterns => setDraft({ ...draft, filePatterns })} placeholder="e.g. *_plugin.js, interaction/**" hint="Match saved patterns exactly. Press Enter to add each pattern." />
        </div>
      </>}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${id}-version`}>Applies on version</Label>
          {draft.version && <button type="button" className="text-xs text-theme-text-muted underline" onClick={() => setDraft({ ...draft, version: '' })}>Clear version</button>}
        </div>
        <VersionSelect id={`${id}-version`} value={draft.version} onChange={version => setDraft({ ...draft, version })} catalog={catalog} />
        <p className="text-xs text-theme-text-muted">Includes checklists with no version restriction. Leave empty for any version.</p>
        {error && <p role="status" className="text-xs text-theme-text-muted">{error} <button type="button" onClick={retry} className="underline">Retry</button></p>}
        {versionError && <p role="alert" className="text-xs text-theme-danger">{versionError}</p>}
      </div>
      <div className="flex justify-between gap-2 border-t border-border pt-3">
        <Button variant="ghost" onClick={() => { setDraft(EMPTY_APPLIES_TO); onChange(EMPTY_APPLIES_TO); }}>Clear</Button>
        <Button disabled={!!versionError} onClick={() => { onChange(draft); setOpen(false); trigger.current?.focus(); }}>Apply filters</Button>
      </div>
    </section>}
  </div>;
}
