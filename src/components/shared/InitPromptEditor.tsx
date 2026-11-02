import { Markdown } from './Markdown';
import { Eye, Pencil, Loader2, Braces, MousePointerClick, TextCursor } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert } from './Alert';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/errors';

export function InitPromptEditor({ value, onChange, onSave, labelAccessory }: { labelAccessory?: ReactNode; value: string; onChange: (value: string) => void; onSave: (value: string) => void }) {
  const input = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({ start: value.length, end: value.length });
  const [tokens, setTokens] = useState<{ token: string; description: string }[]>([]);
  const [previewParts, setPreviewParts] = useState<Array<{ text: string; token?: string }>>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.get('/app-settings/prompt-tokens').then(r => { if (active) setTokens(r.data.tokens); }).catch(() => { if (active) setError('Could not load token options. Reload this page to retry.'); });
    return () => { active = false; };
  }, []);
  function insert(token: string) {
    const { start, end } = selection.current;
    const next = value.slice(0, start) + token + value.slice(end);
    onChange(next);
    selection.current = { start: start + token.length, end: start + token.length };
    requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(selection.current.start, selection.current.end); });
  }
  async function showPreview() {
    setLoading(true); setError('');
    try { const result = await api.post('/app-settings/preview-prompt', { initPrompt: value }); setPreview(result.data.text); setPreviewParts(result.data.parts ?? [{ text: result.data.text }]); }
    catch (e) { setError(getApiErrorMessage(e, 'Live preview failed. Retry shortly.')); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2.5">
          <Label htmlFor={preview === null ? 'init-prompt' : undefined}>Prompt text</Label>
          {labelAccessory}
        </div>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading}
                aria-pressed={preview !== null}
                aria-controls="init-prompt-content"
                aria-label={preview !== null ? 'Edit prompt' : 'Preview with live values'}
                onClick={() => preview !== null ? setPreview(null) : showPreview()}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
                  {loading ? (
                    <span className="block h-4 w-4 origin-center animate-spin">
                      <Loader2 className="block h-4 w-4" />
                    </span>
                  ) : preview !== null ? <Pencil className="block h-4 w-4" /> : <Eye className="block h-4 w-4" />}
                </span>
                {loading ? 'Loading preview…' : preview !== null ? 'Edit prompt' : 'Live preview'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{preview !== null ? 'Return to the prompt editor' : 'Preview the prompt with current values from Runbot'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}
      <div id="init-prompt-content">
        {preview === null ? (
          <Textarea
            ref={input}
            id="init-prompt"
            className="min-h-[320px] font-mono text-xs"
            value={value}
            onChange={e => onChange(e.target.value)}
            onSelect={e => { selection.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }; }}
            onBlur={e => onSave(e.target.value)}
          />
        ) : (
          <div className="min-h-[320px] max-h-[600px] overflow-auto rounded-[10px] border border-border bg-theme-bg-elevated px-3.5 py-2.5 text-sm text-theme-text" role="region" aria-label="Live init prompt preview">
            <Markdown tokenParts={previewParts}>{preview}</Markdown>
          </div>
        )}
      </div>
      {preview === null && (
        <section aria-labelledby="prompt-variables-heading" className="space-y-2.5 bg-theme-bg-elevated/60 rounded-sm overflow-hidden !pt-0">
          <div className="flex items-center justify-between gap-4 bg-theme-bg-elevated px-4 py-2">
            <h3 id="prompt-variables-heading" className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-text-muted">
              <Braces className="h-3.5 w-3.5 text-theme-primary-light" aria-hidden="true" />
              Available variables
            </h3>
            <span className="text-xs text-theme-text-muted flex items-center"><MousePointerClick className='size-4 mr-2'/> Click to insert at the cursor <TextCursor className='size-3.5 text-primary-foreground/30 animate-pulse'/></span>
          </div>
          <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap gap-1.5 px-4 pt-2 pb-3">
              {tokens.map(({ token, description }) => (
                <Tooltip key={token}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 rounded-md border-border-light bg-theme-bg-elevated px-2.5 text-xs text-theme-text-muted transition-colors hover:border-theme-primary/40 hover:bg-theme-primary/10 hover:text-theme-primary-light"
                      aria-label={`Insert ${token}: ${description}`}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => insert(token)}
                    >
                      <code>{token}</code>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{description}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </section>
      )}
    </div>
  );
}
