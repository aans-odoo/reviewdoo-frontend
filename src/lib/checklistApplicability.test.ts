import { validateVersionRange } from './checklistVersions';
import { expect, it } from 'vitest';
import { describeApplicability } from './checklistApplicability';
it('shows version restrictions wherever applicability is rendered', () => {
  const describe = (min?: string | null, max?: string | null) => describeApplicability('code', ['javascript'], [], min, max).text;
  expect(describe()).toBe('Applies to JavaScript files.');
  expect(describe('17.0')).toContain('from version 17.0 onward');
  expect(describe(null, '19.0')).toContain('up to version 19.0');
  expect(describe('17.0', '19.0')).toContain('from version 17.0 to 19.0');
  expect(describe('19.0', '19.0')).toContain('on version 19.0');
  expect(describeApplicability('general', [], [], '19.0').text).toBe('Applies to every change from version 19.0 onward.');
});

it('validates branch ranges in the form', () => {
  expect(validateVersionRange({ minVersion: 'saas-19.2', maxVersion: 'master' })).toBeTruthy();
  expect(validateVersionRange({ minVersion: 'saas-19.10', maxVersion: 'saas-19.2' })).toBeTruthy();
  expect(validateVersionRange({ minVersion: '' })).toBeTruthy();
  expect(describeApplicability('code', ['javascript'], [], 'master', 'master').text).toContain('on version master');
});

it('moves the master display label without changing persisted releases', () => {
  expect(describeApplicability('general', [], [], 'saas-20.1', null, 'saas-20.1').text).toContain('master (saas-20.1)');
  expect(describeApplicability('general', [], [], 'saas-20.1', null, 'saas-20.2').text).not.toContain('master');
  expect(validateVersionRange({ minVersion: 'saas-20.5' }, 4)).toBeTruthy();
  expect(validateVersionRange({ minVersion: 'saas-20.5' }, 5)).toBeNull();
});

 it('uses current releases in version guidance and updates examples after a major release', () => {
  const current = { versions: ['19.0', 'saas-19.3', 'saas-19.4', '20.0'], nextRelease: 'saas-20.1' };
  for (const version of ['', 'invalid']) {
    const error = validateVersionRange({ minVersion: version }, 4, current);
    expect(error).toContain('saas-19.4 or 20.0');
    expect(error).not.toContain('saas-19.1');
  }
  expect(validateVersionRange({ maxVersion: 'master' }, 4, current)).toContain('saas-20.1');
  const future = { versions: [...current.versions, 'saas-20.5', '21.0'], nextRelease: 'saas-21.1' };
  expect(validateVersionRange({ maxVersion: '' }, 5, future)).toContain('saas-20.5 or 21.0');
  expect(validateVersionRange({ maxVersion: 'saas-21.6' }, 5, future)).toContain('saas-21.5');
  expect(validateVersionRange({ maxVersion: '' }, 4, { versions: [] })).not.toContain('19.0');
});
