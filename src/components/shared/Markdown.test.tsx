// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Markdown } from './Markdown';
afterEach(cleanup);

it('highlights every line of a multiline token, including formatted text and code', () => {
  const expansion = '## Confirmation\nFirst line\nSecond **bold** line with `git status`\n\n- List entry\n\n```bash\ngit branch\n```';
  const parts = [{ text: 'Before\n\n' }, { text: expansion, token: '{{branch_confirmation}}' }, { text: '\n\nAfter' }];
  const { container } = render(<Markdown tokenParts={parts}>{parts.map(part => part.text).join('')}</Markdown>);
  const marks = container.querySelectorAll('mark');
  const highlighted = [...marks].map(mark => mark.textContent).join(' ');
  for (const text of ['Confirmation', 'First line', 'Second', 'bold', 'git status', 'List entry', 'git branch']) expect(highlighted).toContain(text);
  expect(screen.getByText('Before').closest('mark')).toBeNull();
  expect(screen.getByText('After').closest('mark')).toBeNull();
  expect(container.querySelector('strong mark')).not.toBeNull();
  expect(container.querySelector('p mark br')).not.toBeNull();
  expect([...marks].every(mark => mark.getAttribute('aria-label') === 'Inserted from {{branch_confirmation}}')).toBe(true);
});

it('keeps manual text unhighlighted when a token spans lines within one paragraph', () => {
  const parts = [{ text: 'Manual before ' }, { text: 'First\nSecond\nThird', token: '{{value}}' }, { text: ' manual after' }];
  const { container } = render(<Markdown tokenParts={parts}>{parts.map(part => part.text).join('')}</Markdown>);
  const highlighted = [...container.querySelectorAll('mark')].map(mark => mark.textContent).join('');
  expect(highlighted).toBe('FirstSecondThird');
});
