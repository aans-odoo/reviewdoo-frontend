import { expect, it } from 'vitest';
import { EMPTY_APPLIES_TO, matchesAppliesTo } from './appliesToFilters';

const item = { scope: 'code', languages: ['python'], filePatterns: ['models/**'], minVersion: '19.0', maxVersion: 'saas-19.4' };
it('combines fields with AND and values within a field with OR', () => {
  const filters = { scope: 'code', languages: ['javascript', 'python'], filePatterns: ['models/**', 'tests/**'], version: 'saas-19.2' };
  expect(matchesAppliesTo(item, filters)).toBe(true);
  expect(matchesAppliesTo(item, { ...filters, scope: 'comment' })).toBe(false);
  expect(matchesAppliesTo(item, { ...filters, languages: ['xml'] })).toBe(false);
  expect(matchesAppliesTo(item, { ...filters, filePatterns: ['models/*'] })).toBe(false);
  expect(matchesAppliesTo(item, { ...filters, version: '20.0' })).toBe(false);
});
it('includes unbounded versions and inclusive bounds with numeric release ordering', () => {
  for (const version of ['19.0', 'saas-19.4']) expect(matchesAppliesTo(item, { ...EMPTY_APPLIES_TO, version })).toBe(true);
  expect(matchesAppliesTo({ minVersion: '9.0' }, { ...EMPTY_APPLIES_TO, version: '19.0' })).toBe(true);
  expect(matchesAppliesTo({}, { ...EMPTY_APPLIES_TO, version: '19.0' })).toBe(true);
  expect(matchesAppliesTo({ maxVersion: 'saas-19.2' }, { ...EMPTY_APPLIES_TO, version: 'saas-19.10' })).toBe(false);
  expect(matchesAppliesTo(item, EMPTY_APPLIES_TO)).toBe(true);
});
