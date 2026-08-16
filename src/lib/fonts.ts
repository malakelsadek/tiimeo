import type { FontOption } from "./settings";

// Two of these (orbitron, vt323) resolve to CSS variables set on <html> by
// next/font/google in layout.tsx — self-hosted at build time, no runtime
// fetch from Google. The rest are zero-cost system stacks.
export const FONT_FAMILIES: Record<FontOption, string> = {
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  orbitron: "var(--font-orbitron), sans-serif",
  vt323: "var(--font-vt323), monospace",
};
