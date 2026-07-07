/**
 * IDE-specific MCP configuration definitions.
 *
 * Add new IDEs here — the rest of the UI picks them up automatically.
 */

export interface IdeConfig {
  /** Display name shown in the dropdown */
  label: string;
  /** Unique key used as the select value */
  id: string;
  /** Description shown below the snippet */
  description: string;
  /** Build the JSON config object given the MCP endpoint URL */
  buildConfig: (mcpUrl: string) => object;
}

export const IDE_CONFIGS: IdeConfig[] = [
  {
    id: "kiro",
    label: "Kiro / Codex / Claude Desktop",
    description:
      "For IDEs that support Streamable HTTP MCP servers natively.",
    buildConfig: (mcpUrl) => ({
      mcpServers: {
        reviewdoo: {
          url: mcpUrl,
        },
      },
    }),
  },
  {
    id: "antigravity",
    label: "Antigravity",
    description:
      "Antigravity uses serverUrl instead of url for remote MCP servers.",
    buildConfig: (mcpUrl) => ({
      mcpServers: {
        reviewdoo: {
          serverUrl: mcpUrl,
        },
      },
    }),
  },
];

export const DEFAULT_IDE_ID = IDE_CONFIGS[0].id;

export function getIdeConfig(id: string): IdeConfig {
  return IDE_CONFIGS.find((c) => c.id === id) ?? IDE_CONFIGS[0];
}
