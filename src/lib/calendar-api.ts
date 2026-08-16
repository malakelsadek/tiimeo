import type { CalendarEvent, CalendarInfo } from "./types";
import { colorIndexForCalendar } from "./palette";

const API_BASE = "https://www.googleapis.com/calendar/v3";

class GoogleApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiGet(path: string, token: string, params: Record<string, string>) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GoogleApiError(res.status, `Calendar API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

export { GoogleApiError };

interface RawCalendarListItem {
  id: string;
  summary: string;
  selected?: boolean;
  primary?: boolean;
  deleted?: boolean;
}

export async function fetchCalendars(token: string): Promise<CalendarInfo[]> {
  const data = await apiGet("/users/me/calendarList", token, { minAccessRole: "reader" });
  const items = (data.items ?? []) as RawCalendarListItem[];
  const visible = items.filter((c) => c.selected !== false && !c.deleted);
  // Primary calendar first, then alphabetical — keeps color assignment stable.
  visible.sort((a, b) => {
    if (a.primary) return -1;
    if (b.primary) return 1;
    return a.summary.localeCompare(b.summary);
  });
  return visible.map((c, i) => ({
    id: c.id,
    summary: c.summary,
    colorIndex: colorIndexForCalendar(i),
  }));
}

interface RawEventItem {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}

export async function fetchEventsForCalendar(
  token: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const data = await apiGet(`/calendars/${encodeURIComponent(calendarId)}/events`, token, {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });
  const items = (data.items ?? []) as RawEventItem[];
  const events: CalendarEvent[] = [];
  for (const item of items) {
    if (item.status === "cancelled") continue;
    if (!item.start || !item.end) continue;
    const allDay = Boolean(item.start.date && !item.start.dateTime);
    const start = new Date(item.start.dateTime ?? item.start.date!);
    const end = new Date(item.end.dateTime ?? item.end.date!);
    events.push({
      id: item.id,
      calendarId,
      title: item.summary?.trim() || "(No title)",
      start,
      end,
      allDay,
      location: item.location,
    });
  }
  return events;
}

export async function fetchAllEvents(
  token: string,
  calendars: CalendarInfo[],
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const results = await Promise.allSettled(
    calendars.map((c) => fetchEventsForCalendar(token, c.id, timeMin, timeMax))
  );
  const events: CalendarEvent[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") events.push(...r.value);
  }
  events.sort((a, b) => a.start.getTime() - b.start.getTime());
  return events;
}
