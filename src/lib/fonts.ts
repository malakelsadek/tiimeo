import type { FontOption } from "./settings";

// Several of these resolve to CSS variables set on <html> by next/font/google
// in layout.tsx — self-hosted at build time, no runtime fetch from Google.
// The rest (system, mono, serif) are zero-cost system stacks.
export const FONT_FAMILIES: Record<FontOption, string> = {
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  orbitron: "var(--font-orbitron), sans-serif",
  vt323: "var(--font-vt323), monospace",
  rajdhani: "var(--font-rajdhani), sans-serif",
  spacemono: "var(--font-space-mono), monospace",
  bebasneue: "var(--font-bebas-neue), sans-serif",
};
