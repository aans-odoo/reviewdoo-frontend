import { compareVersions } from './checklistVersions';

export interface AppliesToFilters {
  scope: string;
  languages: string[];
  filePatterns: string[];
  version: string;
}
export const EMPTY_APPLIES_TO: AppliesToFilters = { scope: '', languages: [], filePatterns: [], version: '' };
export function appliesToFilterCount(filters: AppliesToFilters) {
  return Number(!!filters.scope) + Number(!!filters.languages.length) + Number(!!filters.filePatterns.length) + Number(!!filters.version);
}

export function matchesAppliesTo(item: { scope?: string; languages?: string[]; filePatterns?: string[]; minVersion?: string | null; maxVersion?: string | null }, filters: AppliesToFilters) {
  return (!filters.scope || (item.scope ?? 'code') === filters.scope)
    && (!filters.languages.length || filters.languages.some(language => item.languages?.includes(language)))
    && (!filters.filePatterns.length || filters.filePatterns.some(pattern => item.filePatterns?.includes(pattern)))
    && (!filters.version || ((!item.minVersion || compareVersions(item.minVersion, filters.version) <= 0)
      && (!item.maxVersion || compareVersions(item.maxVersion, filters.version) >= 0)));
}
