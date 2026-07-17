import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
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
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
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
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {preserveLineBreaks(children)}
      </ReactMarkdown>
    </div>
  );
}
