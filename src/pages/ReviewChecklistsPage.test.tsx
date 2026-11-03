// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReviewChecklistsPage } from './ReviewChecklistsPage';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ isAdmin: false }) }));
vi.mock('@/hooks/useKeyPoolStatus', () => ({ useKeyPoolStatus: () => ({ hasActiveKey: true }) }));
vi.mock('@/hooks/useReleaseCatalog', () => ({
  useReleaseCatalog: () => ({ catalog: { versions: ['18.0', '19.0'], nextRelease: '20.0', minorReleaseCount: 4 } }),
  releaseLabel: (version: string) => version,
}));
vi.mock('@/hooks/useCategories', () => ({ useCategories: () => ({ categories: [{ id: 'quality', name: 'Quality' }], refresh: vi.fn() }) }));
vi.mock('@/components/checklists/ReviewChecklistFormDialog', () => ({ ReviewChecklistFormDialog: () => null }));
// Keep the page and every filter control real; isolate table rendering/navigation.
vi.mock('@/components/shared/DataTable', () => ({ DataTable: (props: any) => <>
  <output data-testid="results">{JSON.stringify({ ids: props.data.map((row: any) => row.id), total: props.totalItems, offset: props.offset })}</output>
  <button onClick={() => props.onRangeChange({ offset: 10, limit: 10 })}>Next range</button>
  {props.onSort && <button onClick={() => props.onSort('severity', 'asc')}>Sort severity</button>}
</> }));

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});
afterEach(cleanup);
const base = { id: 'match', scope: 'code', languages: ['python'], filePatterns: ['models/**'], minVersion: '18.0', maxVersion: '19.0', category: 'Quality', severity: 'major' };
const rows = [base,
  { ...base, id: 'scope', scope: 'comment' },
  { ...base, id: 'language', languages: ['xml'] },
  { ...base, id: 'file', filePatterns: ['tests/**'] },
  { ...base, id: 'version', minVersion: '20.0', maxVersion: null },
  { ...base, id: 'category', category: 'Other' },
  { ...base, id: 'severity', severity: 'minor' },
];
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.get).mockResolvedValue({ data: { items: [], total: 0 } });
  vi.mocked(api.post).mockResolvedValue({ data: { results: rows } });
});
async function mount() {
  render(<MemoryRouter><ReviewChecklistsPage /></MemoryRouter>);
  await screen.findByTestId('results');
}
async function select(trigger: HTMLElement, option: string) {
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('option', { name: option }));
}
async function setApplicability(keys: string[]) {
  fireEvent.click(screen.getByLabelText('Applies to'));
  if (keys.includes('scope')) await select(screen.getByLabelText('Scope'), 'Code');
  if (keys.includes('languages')) {
    fireEvent.click(screen.getByRole('button', { name: 'Any language' }));
    fireEvent.click(screen.getByRole('button', { name: 'Python' }));
    fireEvent.mouseDown(screen.getByLabelText('File patterns'));
  }
  if (keys.includes('filePatterns')) {
    fireEvent.change(screen.getByLabelText('File patterns'), { target: { value: 'models/**' } });
    fireEvent.keyDown(screen.getByLabelText('File patterns'), { key: 'Enter' });
  }
  if (keys.includes('version')) await select(screen.getByLabelText('Applies on version'), '19.0');
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
}
const expected = { scope: 'code', languages: '["python"]', filePatterns: '["models/**"]', version: '19.0' };
it.each(['scope', 'languages', 'filePatterns', 'version'])('applies %s independently through the real dropdown', async key => {
  await mount();
  await setApplicability([key]);
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10, [key]: expected[key as keyof typeof expected] } }));
});
it('combines all applicability fields with category, severity and text; resets pagination and all filters', async () => {
  await mount();
  await setApplicability(Object.keys(expected));
  await select(within(screen.getByText('Category', { selector: 'label' }).parentElement!).getByRole('combobox'), 'Quality');
  await select(within(screen.getByText('Severity', { selector: 'label' }).parentElement!).getByRole('combobox'), 'major');
  fireEvent.change(screen.getByPlaceholderText('Search checklists by text...'), { target: { value: ' unsafe ' } });
  fireEvent.keyDown(screen.getByPlaceholderText('Search checklists by text...'), { key: 'Enter' });
  const params = { offset: 0, limit: 10, ...expected, category: 'Quality', severity: 'major', search: 'unsafe' };
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params }));
  await screen.findByTestId('results');
  fireEvent.click(screen.getByText('Next range'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { ...params, offset: 10 } }));
  await screen.findByTestId('results');
  fireEvent.click(screen.getByText('Sort severity'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { ...params, sortBy: 'severity', sortOrder: 'asc' } }));
  fireEvent.click(screen.getByText('Reset filter'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10, sortBy: 'severity', sortOrder: 'asc' } }));
});
it.each(Array.from({ length: 16 }, (_, mask) => ({ keys: Object.keys(expected).filter((_, bit) => mask & (1 << bit)) })))('filters semantic results with applicability $keys and category/severity', async ({ keys }) => {
  await mount();
  await select(screen.getAllByRole('combobox')[0], 'Semantic');
  fireEvent.change(screen.getByPlaceholderText('Semantic search checklists...'), { target: { value: 'unsafe' } });
  fireEvent.keyDown(screen.getByPlaceholderText('Semantic search checklists...'), { key: 'Enter' });
  await waitFor(() => expect(screen.getByTestId('results').textContent).toContain('match'));
  const calls = vi.mocked(api.get).mock.calls.length;
  if (keys.length) await setApplicability(keys);
  await select(within(screen.getByText('Category', { selector: 'label' }).parentElement!).getByRole('combobox'), 'Quality');
  await select(within(screen.getByText('Severity', { selector: 'label' }).parentElement!).getByRole('combobox'), 'major');
  const rejected = new Set(['category', 'severity', ...keys.map(key => ({ scope: 'scope', languages: 'language', filePatterns: 'file', version: 'version' })[key])]);
  expect(JSON.parse(screen.getByTestId('results').textContent!).ids).toEqual(rows.filter(row => !rejected.has(row.id)).map(row => row.id));
  expect(api.get).toHaveBeenCalledTimes(calls);
  expect(api.post).toHaveBeenCalledTimes(1);
});
it('discards unapplied edits, clears only applicability, and removes file criteria for general scope', async () => {
  await mount();
  await setApplicability(Object.keys(expected));
  await select(within(screen.getByText('Category', { selector: 'label' }).parentElement!).getByRole('combobox'), 'Quality');
  fireEvent.click(screen.getByLabelText('Applies to'));
  await select(screen.getByLabelText('Scope'), 'General');
  expect(screen.queryByLabelText('File patterns')).toBeNull();
  fireEvent.keyDown(screen.getByRole('region', { name: 'Filter by applicability' }), { key: 'Escape' });
  fireEvent.click(screen.getByLabelText('Applies to'));
  expect(screen.getByLabelText('File patterns')).toBeTruthy();
  await select(screen.getByLabelText('Scope'), 'General');
  fireEvent.click(screen.getByText('Apply filters'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10, scope: 'general', version: '19.0', category: 'Quality' } }));
  fireEvent.click(screen.getByLabelText('Applies to'));
  fireEvent.click(within(screen.getByRole('region', { name: 'Filter by applicability' })).getByText('Clear', { exact: true }));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10, category: 'Quality' } }));
});
it('keeps the newest filter results when an older request finishes later', async () => {
  await mount();
  let resolveOld!: (value: any) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  await setApplicability(['scope']);
  vi.mocked(api.get).mockResolvedValue({ data: { items: [{ ...base, id: 'new-result' }], total: 1 } });
  await setApplicability(['version']);
  await waitFor(() => expect(screen.getByTestId('results').textContent).toContain('new-result'));
  await act(async () => resolveOld({ data: { items: [{ ...base, id: 'stale-result' }], total: 20 } }));
  const result = JSON.parse(screen.getByTestId('results').textContent!);
  expect(result.ids).toEqual(['new-result']);
  expect(result.total).toBe(1);
});
it('does not let a pending list request overwrite a subsequent semantic search', async () => {
  await mount();
  let resolveOld!: (value: any) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  await setApplicability(['scope']);
  await select(screen.getAllByRole('combobox')[0], 'Semantic');
  fireEvent.change(screen.getByPlaceholderText('Semantic search checklists...'), { target: { value: 'unsafe' } });
  fireEvent.keyDown(screen.getByPlaceholderText('Semantic search checklists...'), { key: 'Enter' });
  await waitFor(() => expect(screen.getByTestId('results').textContent).toContain('match'));
  const result = screen.getByTestId('results').textContent;
  await act(async () => resolveOld({ data: { items: [], total: 0 } }));
  expect(screen.getByTestId('results').textContent).toBe(result);
});
it('keeps multiple languages and patterns intact, including commas, and supports removing values', async () => {
  await mount();
  fireEvent.click(screen.getByLabelText('Applies to'));
  fireEvent.click(screen.getByRole('button', { name: 'Any language' }));
  fireEvent.click(screen.getByRole('button', { name: 'Python' }));
  fireEvent.click(screen.getByRole('button', { name: 'XML' }));
  fireEvent.mouseDown(screen.getByLabelText('File patterns'));
  for (const value of ['models/**', '**/*.{js,ts}']) {
    fireEvent.change(screen.getByLabelText('File patterns'), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Add pattern' }));
  }
  fireEvent.click(screen.getByText('Apply filters'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10, languages: '["python","xml"]', filePatterns: '["models/**","**/*.{js,ts}"]' } }));
  fireEvent.click(screen.getByLabelText('Applies to'));
  fireEvent.click(screen.getByRole('button', { name: 'Remove Python' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove models/**' }));
  fireEvent.click(screen.getByText('Apply filters'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10, languages: '["xml"]', filePatterns: '["**/*.{js,ts}"]' } }));
});
it('blocks invalid custom versions and allows clearing a valid version', async () => {
  await mount();
  fireEvent.click(screen.getByLabelText('Applies to'));
  await select(screen.getByLabelText('Applies on version'), 'Custom version…');
  fireEvent.change(screen.getByLabelText('Custom numbered release'), { target: { value: 'invalid' } });
  expect((screen.getByText('Apply filters') as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Custom numbered release'), { target: { value: '17.0' } });
  fireEvent.click(screen.getByText('Apply filters'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10, version: '17.0' } }));
  fireEvent.click(screen.getByLabelText('Applies to'));
  fireEvent.click(screen.getByText('Clear version'));
  fireEvent.click(screen.getByText('Apply filters'));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/review-checklists', { params: { offset: 0, limit: 10 } }));
});
it.each(['Scope', 'Applies on version'])('closes only the nested %s menu on Escape', async label => {
  await mount();
  fireEvent.click(screen.getByLabelText('Applies to'));
  fireEvent.keyDown(screen.getByLabelText(label), { key: 'ArrowDown' });
  fireEvent.keyDown(await screen.findByRole('listbox'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  expect(screen.getByRole('region', { name: 'Filter by applicability' })).toBeTruthy();
  fireEvent.keyDown(screen.getByLabelText(label), { key: 'Escape' });
  expect(screen.queryByRole('region', { name: 'Filter by applicability' })).toBeNull();
});
it('dismisses the nested version menu before the parent on outside pointer presses', async () => {
  await mount();
  fireEvent.click(screen.getByLabelText('Applies to'));
  fireEvent.keyDown(screen.getByLabelText('Applies on version'), { key: 'ArrowDown' });
  await screen.findByRole('listbox');
  // Radix installs its outside-pointer listener after the opening event.
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
  fireEvent.pointerDown(document.body, { pointerType: 'mouse' });
  await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  expect(screen.getByRole('region', { name: 'Filter by applicability' })).toBeTruthy();
  fireEvent.pointerDown(document.body, { pointerType: 'mouse' });
  expect(screen.queryByRole('region', { name: 'Filter by applicability' })).toBeNull();
});
