import type { CalendarEvent, StatusedEvent } from "./types";
import { withStatus, startOfDay, endOfDay } from "./time";

export interface FreeBlock {
  start: Date;
  end: Date;
}

export interface Schedule {
  allDayToday: CalendarEvent[];
  timed: StatusedEvent[];
  current: StatusedEvent[];
  next: StatusedEvent | null;
  upcomingToday: StatusedEvent[];
  // Set only when nothing is happening right now: the gap surrounding `now`,
  // bounded by the most recent event's end and the next event's start.
  freeBlock: FreeBlock | null;
}

export function isToday(d: Date, now: Date): boolean {
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function deriveSchedule(events: CalendarEvent[], now: Date): Schedule {
  const allDayToday = events.filter((e) => e.allDay && isToday(e.start, now));
  const timedSource = events.filter((e) => !e.allDay);
  const timed = withStatus(timedSource, now).sort((a, b) => a.start.getTime() - b.start.getTime());

  const current = timed.filter((e) => e.status === "current");
  const upcoming = timed.filter((e) => e.status === "upcoming");
  const next = upcoming[0] ?? null;
  const upcomingToday = upcoming.filter((e) => isToday(e.start, now));

  let freeBlock: FreeBlock | null = null;
  if (current.length === 0) {
    const past = timed.filter((e) => e.status === "past" && isToday(e.end, now));
    const freeStart = past.length
      ? new Date(Math.max(...past.map((e) => e.end.getTime())))
      : startOfDay(now);
    const freeEnd = next ?? null;
    freeBlock = { start: freeStart, end: freeEnd ? freeEnd.start : endOfDay(now) };
  }

  return { allDayToday, timed, current, next, upcomingToday, freeBlock };
}
