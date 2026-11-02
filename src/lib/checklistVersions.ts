// Numeric components preserve release ordering (saas-19.10 comes after saas-19.2).
export const ODOO_VERSION_PATTERN = /^(?:[1-9]\d{0,2}\.0|saas-[1-9]\d{0,2}\.[1-9]\d{0,2})$/;

export function compareVersions(a: string, b: string): number {
  if (a === b) return 0;
  if (a === 'master') return 1;
  if (b === 'master') return -1;
  const [aMajor, aMinor] = a.replace(/^saas-/, '').split('.').map(Number);
  const [bMajor, bMinor] = b.replace(/^saas-/, '').split('.').map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}


export interface VersionMessageContext {
  versions: string[];
  nextRelease?: string;
}

/** Use the newest major and the last SaaS release before it as familiar examples. */
export function versionExamples(context?: VersionMessageContext): string[] {
  const versions = context?.versions.filter(version => ODOO_VERSION_PATTERN.test(version)) ?? [];
  const major = versions.filter(version => !version.startsWith('saas-')).sort(compareVersions).pop();
  if (!major) return versions.sort(compareVersions).slice(-2);
  const previousMinor = versions.filter(version => version.startsWith('saas-') && compareVersions(version, major) < 0).sort(compareVersions).pop();
  return previousMinor ? [previousMinor, major] : [major];
}

export function validateVersionRange(value: { minVersion?: unknown; maxVersion?: unknown }, minorCount = 999, context: VersionMessageContext | undefined = undefined): string | null {
  const examples = versionExamples(context);
  const exampleHint = examples.length ? `, such as ${examples.join(" or ")}` : " (use a major release number or a saas-prefixed minor release)";
  for (const key of ['minVersion', 'maxVersion'] as const) {
    const version = value[key];
    const label = key === 'minVersion' ? 'From' : 'Up to';
    if (version === '') {
      return `Choose a version for “${label}”, or enter a custom version ${examples.length ? `such as ${examples.join(" or ")}` : "using a major release number or a saas-prefixed minor release"}.`;
    }
    if (version === 'master') {
      return `To use master, select it from the version list. For a custom version, enter its release number${context?.nextRelease ? `, such as ${context.nextRelease}` : exampleHint}.`;
    }
    if (version != null && (typeof version !== 'string' || !ODOO_VERSION_PATTERN.test(version))) {
      return `Enter a valid “${label}” version, ${examples.length ? `such as ${examples.join(" or ")}` : "using a major release number or a saas-prefixed minor release"}.`;
    }
    if (typeof version === 'string' && version.startsWith('saas-') && Number(version.split('.')[1]) > minorCount) {
      const major = version.slice(5).split('.')[0];
      return `The “${label}” version supports SaaS releases from saas-${major}.1 to saas-${major}.${minorCount}. For the next major release, enter ${Number(major) + 1}.0.`;
    }
  }
  if (typeof value.minVersion === 'string' && typeof value.maxVersion === 'string' && compareVersions(value.minVersion, value.maxVersion) > 0) {
    return 'The “From” version must be the same as or earlier than the “Up to” version.';
  }
  return null;
}
