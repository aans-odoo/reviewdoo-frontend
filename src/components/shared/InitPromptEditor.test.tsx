// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InitPromptEditor } from './InitPromptEditor';
import api from '@/lib/api';
vi.mock('@/lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
afterEach(cleanup);
it('inserts a token over the cursor selection, saves it and previews server-rendered values', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { tokens: [{ token: '{{next_release}}', description: 'Next release' }] } });
  vi.mocked(api.post).mockResolvedValue({ data: { text: 'Hello saas-20.1 world', parts: [{ text: 'Hello ' }, { text: 'saas-20.1', token: '{{next_release}}' }, { text: ' world' }] } });
  const save = vi.fn();
  function Harness() { const [value, setValue] = useState('Hello INSERT world'); return <InitPromptEditor value={value} onChange={setValue} onSave={save} />; }
  render(<Harness />);
  const input = screen.getByLabelText('Prompt text') as HTMLTextAreaElement;
  input.focus(); input.setSelectionRange(6, 12); fireEvent.select(input);
  fireEvent.click(await screen.findByRole('button', { name: 'Insert {{next_release}}: Next release' }));
  expect(input.value).toBe('Hello {{next_release}} world');
  fireEvent.blur(input);
  expect(save).toHaveBeenCalledWith('Hello {{next_release}} world');
  fireEvent.click(screen.getByRole('button', { name: 'Preview with live values' }));
  const inserted = await screen.findByLabelText('Inserted from {{next_release}}');
  expect(inserted.textContent).toBe('saas-20.1');
  fireEvent.focus(inserted);
  expect((await screen.findByRole('tooltip')).textContent).toBe('{{next_release}}');
  expect(api.post).toHaveBeenCalledWith('/app-settings/preview-prompt', { initPrompt: 'Hello {{next_release}} world' });
  fireEvent.click(screen.getByRole('button', { name: 'Edit prompt' }));
  await waitFor(() => expect((screen.getByLabelText('Prompt text') as HTMLTextAreaElement).value).toBe('Hello {{next_release}} world'));
});

it('renders Markdown formatting around highlighted token expansions', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { tokens: [] } });
  vi.mocked(api.post).mockResolvedValue({ data: {
    text: '# Review\n\n- Target **saas-20.1**',
    parts: [{ text: '# Review\n\n- Target **' }, { text: 'saas-20.1', token: '{{next_release}}' }, { text: '**' }],
  } });
  render(<InitPromptEditor value="# Review" onChange={vi.fn()} onSave={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Preview with live values' }));
  await screen.findByRole('heading', { name: 'Review' });
  const inserted = screen.getByLabelText('Inserted from {{next_release}}');
  expect(inserted.closest('strong')).not.toBeNull();
  expect(inserted.closest('li')).not.toBeNull();
  expect(screen.queryByText('Highlighted text comes from variables. Hover to see the variable name.')).toBeNull();
});
