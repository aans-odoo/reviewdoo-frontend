import { useEffect, useState } from 'react';
import api from '@/lib/api';
export interface ReleaseCatalog {
  versions: string[];
  nextRelease: string;
  repositories: string[];
  minorReleaseCount: number;
  fetchedAt: string;
}
let cached: ReleaseCatalog | undefined;
let pending: Promise<ReleaseCatalog> | undefined;
function load() {
  if (cached && Date.now() - Date.parse(cached.fetchedAt) < 300000) return Promise.resolve(cached);
  if (!pending) pending = api.get('/app-settings/releases').then(r => { cached = r.data; return r.data as ReleaseCatalog; }).finally(() => { pending = undefined; });
  return pending;
}
export function useReleaseCatalog() {
  const [catalog, setCatalog] = useState(cached);
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    load().then(value => { if (active) setCatalog(value); }).catch(() => { if (active) { setCatalog(undefined); setError('Cannot load active versions. Retry or enter a numbered release.'); } });
    const timer = setTimeout(() => retry(n => n + 1), 300000);
    return () => { active = false; clearTimeout(timer); };
  }, [attempt]);
  return { catalog, error, retry: () => retry(n => n + 1) };
}
export function releaseLabel(version: string, nextRelease?: string) {
  return version === nextRelease ? `master (${version})` : version;
}
