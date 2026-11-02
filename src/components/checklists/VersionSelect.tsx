import { versionExamples } from '@/lib/checklistVersions';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { releaseLabel, type ReleaseCatalog } from '@/hooks/useReleaseCatalog';
export function VersionSelect({ id, value, onChange, catalog }: { id: string; value: string; onChange: (value: string) => void; catalog?: ReleaseCatalog }) {
  const [custom, setCustom] = useState(false);
  const versions = catalog ? [catalog.nextRelease, ...catalog.versions.slice().reverse()] : [];
  const isCustom = custom || (!!value && !versions.includes(value));
  return <div className="space-y-2">
    <Select value={isCustom ? 'custom' : value} onValueChange={v => { setCustom(v === 'custom'); onChange(v === 'custom' ? '' : v); }}>
      <SelectTrigger id={id}><SelectValue placeholder="Choose a release" /></SelectTrigger>
      <SelectContent>
        {versions.map(v => v === catalog?.nextRelease ? (
          <SelectItem
            key={v}
            value={v}
            className="flex-col items-start gap-0.5 py-2"
            adornment={
              <span className="whitespace-normal text-xs leading-relaxed text-theme-text-muted">
                Applies to {v}, including after it’s released.
              </span>
            }
          >
            {releaseLabel(v, catalog.nextRelease)}
          </SelectItem>
        ) : <SelectItem key={v} value={v}>{v}</SelectItem>)}
        <SelectItem value="custom">Custom version…</SelectItem>
      </SelectContent>
    </Select>
    {isCustom && <Input aria-label="Custom numbered release" placeholder={versionExamples(catalog).join(" or ") || "Enter a numbered release"} value={value} onChange={e => onChange(e.target.value)} required />}
  </div>;
}
