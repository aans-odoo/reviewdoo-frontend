// Numeric components preserve release ordering (saas-19.10 comes after saas-19.2).
export const ODOO_VERSION_PATTERN = /^(?:master|[1-9]\d{0,2}\.0|saas-[1-9]\d{0,2}\.[1-9]\d{0,2})$/;

export function compareVersions(a: string, b: string): number {
  if (a === b) return 0;
  if (a === 'master') return 1;
  if (b === 'master') return -1;
  const [aMajor, aMinor] = a.replace(/^saas-/, '').split('.').map(Number);
  const [bMajor, bMinor] = b.replace(/^saas-/, '').split('.').map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

export function validateVersionRange(value: { minVersion?: unknown; maxVersion?: unknown }): string | null {
  for (const key of ['minVersion', 'maxVersion'] as const) {
    const version = value[key];
    if (version != null && (typeof version !== 'string' || !ODOO_VERSION_PATTERN.test(version))) {
      return `${key} must be an Odoo branch such as 19.0, saas-19.1 or master, or null`;
    }
  }
  if (typeof value.minVersion === 'string' && typeof value.maxVersion === 'string' && compareVersions(value.minVersion, value.maxVersion) > 0) {
    return 'From version must not exceed up to version';
  }
  return null;
}
