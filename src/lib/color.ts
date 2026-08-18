// Picks readable text (black or white) for an arbitrary background hex,
// using the standard WCAG relative-luminance formula. Needed because custom
// themes let the user pick any bar/accent color, and a hardcoded text color
// would go unreadable against a dark pick.
export function contrastTextColor(hex: string): "#000000" | "#ffffff" {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.4 ? "#000000" : "#ffffff";
}
