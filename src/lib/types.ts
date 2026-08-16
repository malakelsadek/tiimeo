export interface CalendarInfo {
  id: string;
  summary: string;
  colorIndex: number;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
}

export type EventStatus = "current" | "upcoming" | "past";

export interface StatusedEvent extends CalendarEvent {
  status: EventStatus;
}
