/**
 * Shared "where it applies" logic for review checklists.
 *
 * This is the single source of truth for the plain-English restatement of what
 * a checklist matches, used both in the create/edit dialog (live preview under
 * the scope picker) and in the checklists table (the "Applies to" column). It
 * mirrors the backend matcher used by `get_review_checklists`.
 */

export interface LanguageOption {
  value: string;
  label: string;
}

/** Selectable languages, with their display labels. */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "xml", label: "XML" },
  { value: "css", label: "CSS" },
];

/**
 * Scopes matched by language/file pattern. `code` and `comment` are narrowed
 * by files (comment/docstring conventions can be language-specific), while
 * `commit_message` and `general` always apply regardless of files.
 */
export const SCOPE_USES_FILES = new Set(["code", "comment"]);

/** Maps a language value to its display label, falling back to the raw value. */
function languageLabel(value: string): string {
  return LANGUAGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export interface Applicability {
  text: string;
  tone: "info" | "warn";
}

/**
 * Plain-English restatement of what a checklist will match, mirroring the
 * backend matcher. `tone: "warn"` flags an accidental catch-all (a file scope
 * with nothing to narrow it) — e.g. a `code` item with no language selected.
 */
export function describeApplicability(
  scope: string,
  languages: string[],
  filePatterns: string[]
): Applicability {
  if (scope === "commit_message")
    return { text: "Always checked against the commit message.", tone: "info" };
  if (scope === "general")
    return { text: "Always applies to every change.", tone: "info" };

  const isComment = scope === "comment";
  const langLabels = languages.map(languageLabel);

  // `code` is matched by language, so a language is mandatory.
  if (!isComment && langLabels.length === 0) {
    return {
      text: "Select at least one language — code checklists are matched to a diff by language.",
      tone: "warn",
    };
  }

  // A file pattern narrows the language rule to a subset of those files (AND),
  // rather than widening the match.
  const base = langLabels.length ? `${langLabels.join(", ")} files` : "any changed file";
  const patPart = filePatterns.length ? ` matching ${filePatterns.join(", ")}` : "";
  const target = `${base}${patPart}`;

  return {
    text: isComment
      ? `Checked against comments in ${target}.`
      : `Applies to ${target}.`,
    tone: "info",
  };
}
