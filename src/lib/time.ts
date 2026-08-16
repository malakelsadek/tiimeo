import type { CalendarEvent, EventStatus, StatusedEvent } from "./types";

export function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

export function endOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(23, 59, 59, 999);
  return n;
}

export function statusOf(e: CalendarEvent, now: Date): EventStatus {
  if (now < e.start) return "upcoming";
  if (now >= e.end) return "past";
  return "current";
}

export function withStatus(events: CalendarEvent[], now: Date): StatusedEvent[] {
  return events.map((e) => ({ ...e, status: statusOf(e, now) }));
}

export function formatClock(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDayLabel(d: Date, now: Date): string {
  const a = startOfDay(d).getTime();
  const b = startOfDay(now).getTime();
  const diffDays = Math.round((a - b) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// Countdown text like "1h 24m 03s" / "24m 03s" / "48s"
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }
  if (m > 0) {
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }
  return `${s}s`;
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
