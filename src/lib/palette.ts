// Fixed-order categorical palette (validated for CVD-safety), from the
// tiimeo dataviz reference palette. Never cycle — assign in this order,
// fold overflow into the last slot.
export const CATEGORICAL_SLOTS = [
  "series-1", // blue
  "series-2", // orange
  "series-3", // aqua
  "series-4", // yellow
  "series-5", // magenta
  "series-6", // green
  "series-7", // violet
  "series-8", // red
] as const;

export function colorIndexForCalendar(index: number): number {
  return Math.min(index, CATEGORICAL_SLOTS.length - 1);
}

export function seriesVar(colorIndex: number): string {
  return `var(--${CATEGORICAL_SLOTS[colorIndexForCalendar(colorIndex)]})`;
}
