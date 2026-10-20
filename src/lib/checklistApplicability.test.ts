import { validateVersionRange } from './checklistVersions';
import { expect, it } from 'vitest';
import { describeApplicability } from './checklistApplicability';
it('shows version restrictions wherever applicability is rendered', () => {
  const describe = (min?: string | null, max?: string | null) => describeApplicability('code', ['javascript'], [], min, max).text;
  expect(describe()).toBe('Applies to JavaScript files.');
  expect(describe('17.0')).toContain('Odoo 17.0 and later');
  expect(describe(null, '19.0')).toContain('Odoo 19.0 and earlier');
  expect(describe('17.0', '19.0')).toContain('Odoo 17.0–19.0 (inclusive)');
  expect(describe('19.0', '19.0')).toContain('Odoo 19.0 only');
  expect(describeApplicability('general', [], [], '19.0').text).toBe('Applies to every change. Odoo 19.0 and later.');
});

it('validates branch ranges in the form', () => {
  expect(validateVersionRange({ minVersion: 'saas-19.2', maxVersion: 'master' })).toBeNull();
  expect(validateVersionRange({ minVersion: 'saas-19.10', maxVersion: 'saas-19.2' })).toBeTruthy();
  expect(validateVersionRange({ minVersion: '' })).toBeTruthy();
  expect(describeApplicability('code', ['javascript'], [], 'master', 'master').text).toContain('Odoo master only');
});
