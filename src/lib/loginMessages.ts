/**
 * Contextual messages shown on the login page when an anonymous visitor is
 * redirected there from a login-required page. This keeps the "why am I here?"
 * copy in one place and lets any page contribute its own message simply by
 * adding an entry keyed by its route path.
 *
 * Matching is by exact path first, then by longest matching prefix, so nested
 * routes (e.g. "/ai-config/anything") inherit the parent's message.
 */
export const LOGIN_MESSAGES: Record<string, string> = {
  "/ai-config": "Log in to set up your AI configuration.",
  "/users": "Log in as an admin to manage users.",
  "/mcp-clients": "Log in as an admin to manage MCP clients.",
  "/smtp-config": "Log in as an admin to configure email (SMTP).",
};

/** Fallback shown when a page redirects to login without a specific message. */
export const DEFAULT_LOGIN_MESSAGE = "Sign in to your account";

/**
 * Resolves the login message for a given path. Returns `undefined` when no
 * message is registered, so callers can fall back to the default.
 */
export function getLoginMessage(pathname: string): string | undefined {
  if (LOGIN_MESSAGES[pathname]) return LOGIN_MESSAGES[pathname];

  const match = Object.keys(LOGIN_MESSAGES)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  return match ? LOGIN_MESSAGES[match] : undefined;
}
