import type { Root, RootContent, Element, Text } from 'hast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
  tokenParts?: Array<{ text: string; token?: string }>;
}

/** Mark expansions after Markdown parsing, without inserting HTML into the source. */
function tokenHighlights(parts: Array<{ text: string; token?: string }>) {
  let offset = 0;
  const ranges = parts.map(part => {
    const range = { start: offset, end: offset + part.text.length, token: part.token };
    offset = range.end;
    return range;
  }).filter(range => range.token);
  return () => (tree: Root) => {
    function visit(parent: { children: RootContent[] }, inheritedToken?: string) {
      parent.children = parent.children.flatMap<RootContent>(node => {
        if (node.type === 'element') {
          const start = node.position?.start.offset;
          const end = node.position?.end.offset;
          const token = start !== undefined && end !== undefined
            ? ranges.find(range => range.start <= start && range.end >= end)?.token
            : inheritedToken;
          visit(node, token);
          return [node];
        }
        if (node.type !== 'text') return [node];
        const start = node.position?.start.offset;
        const end = node.position?.end.offset;
        if (start === undefined || end === undefined) {
          // Inline/fenced code can produce text without its own source position.
          return inheritedToken ? [{ type: 'element', tagName: 'mark', properties: { title: inheritedToken }, children: [node] }] : [node];
        }
        const matches = ranges.filter(range => range.start < end && range.end > start);
        if (!matches.length) return [node];
        const result: Array<Text | Element> = [];
        let cursor = 0;
        for (const range of matches) {
          // Escaped Markdown/entities can differ in source and displayed length.
          const from = end - start === node.value.length ? Math.max(0, range.start - start) : 0;
          const to = end - start === node.value.length ? Math.min(node.value.length, range.end - start) : node.value.length;
          if (from < cursor) continue;
          if (from > cursor) result.push({ type: 'text', value: node.value.slice(cursor, from) });
          result.push({ type: 'element', tagName: 'mark', properties: { title: range.token }, children: [{ type: 'text', value: node.value.slice(from, to) }] });
          cursor = to;
        }
        if (cursor < node.value.length) result.push({ type: 'text', value: node.value.slice(cursor) });
        return result;
      });
    }
    visit(tree);
  };
}

/** Apply soft line breaks after highlighting, while source positions are intact. */
function previewLineBreaks() {
  return (tree: Root) => {
    function visit(parent: { children: RootContent[] }) {
      parent.children = parent.children.flatMap<RootContent>(node => {
        if (node.type === 'element') {
          if (node.tagName !== 'pre' && node.tagName !== 'code') visit(node);
          return [node];
        }
        if (node.type !== 'text' || !node.value.trim()) return [node];
        return node.value.split(/\r\n|\r|\n/).flatMap<RootContent>((value, index) => [
          ...(index ? [{ type: 'element' as const, tagName: 'br', properties: {}, children: [] }] : []),
          { type: 'text', value },
        ]);
      });
    }
    visit(tree);
  };
}

/**
 * Preserve author-intended vertical whitespace. Standard Markdown collapses
 * runs of blank lines into a single paragraph break, so every empty line the
 * user typed would disappear. We replace blank lines (outside fenced code
 * blocks) with a non-breaking space so they survive parsing; combined with
 * `remark-breaks` (single newline -> <br>) this makes the rendered output
 * match what the user typed line-for-line.
 */
function preserveLineBreaks(src: string): string {
  let inFence = false;
  return src
    .split("\n")
    .map((line) => {
      if (line.trim().startsWith("```")) {
        inFence = !inFence;
        return line;
      }
      if (!inFence && line.trim() === "") {
        return "\u00A0";
      }
      return line;
    })
    .join("\n");
}

/**
 * Renders user-authored markdown (guidelines, checklist items, etc.) with
 * theme-consistent styling. Long unbroken strings wrap instead of forcing
 * horizontal overflow so it stays safe inside constrained table cells.
 *
 * Only a safe subset of markdown is supported (no raw HTML), so content is
 * not passed through `dangerouslySetInnerHTML`.
 */
export function Markdown({ children, className, tokenParts }: MarkdownProps) {
  return (
    <TooltipProvider delayDuration={200}><div
      className={cn(
        "text-sm text-theme-text [overflow-wrap:anywhere]",
        // Spacing between block elements
        "[&>*]:my-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        // Headings
        "[&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:font-semibold",
        // Lists
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
        // Inline code
        "[&_code]:rounded [&_code]:bg-theme-bg-hover [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono",
        // Code blocks
        "[&_pre]:rounded [&_pre]:bg-theme-bg-hover [&_pre]:p-2 [&_pre]:overflow-x-auto [&_pre>code]:bg-transparent [&_pre>code]:p-0",
        // Links
        "[&_a]:text-theme-accent [&_a]:underline hover:[&_a]:opacity-80",
        // Blockquotes
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-theme-text-muted",
        // Tables
        "[&_table]:w-full [&_table]:text-xs [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={tokenParts ? [remarkGfm] : [remarkGfm, remarkBreaks]}
        rehypePlugins={tokenParts ? [rehypeHighlight, tokenHighlights(tokenParts), previewLineBreaks] : [rehypeHighlight]}
        components={{
          mark: ({ children: content, title }) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <mark tabIndex={0} className="rounded-sm bg-theme-primary/10 text-theme-primary-light outline-none focus-visible:ring-1 focus-visible:ring-theme-primary" aria-label={`Inserted from ${title}`}>{content}</mark>
              </TooltipTrigger>
              <TooltipContent><code>{title}</code></TooltipContent>
            </Tooltip>
          ),
          a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {tokenParts ? children : preserveLineBreaks(children)}
      </ReactMarkdown>
    </div></TooltipProvider>
  );
}
