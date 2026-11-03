/** Shared endpoint for setup instructions, snippets, and connection checks. */
export function getMcpUrl() {
  return `${(import.meta.env.VITE_API_URL || window.location.origin).replace(/\/+$/, "")}/mcp`;
}
