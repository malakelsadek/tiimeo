"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TokenState } from "@/lib/google-auth";
import { fetchAllEvents, fetchCalendars, GoogleApiError } from "@/lib/calendar-api";
import type { CalendarEvent, CalendarInfo } from "@/lib/types";
import { startOfDay } from "@/lib/time";

const REFRESH_INTERVAL_MS = 3 * 60_000;

export function useCalendarEvents(token: TokenState | null, onAuthError: () => void) {
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const calendarsRef = useRef<CalendarInfo[]>([]);
  const [prevTokenKey, setPrevTokenKey] = useState<string | null>(null);

  // Reset stale data as soon as the token identity changes (sign-in/out),
  // rather than in an effect — this runs during render, so the very first
  // paint after a token change never shows the previous account's events.
  const tokenKey = token?.accessToken ?? null;
  if (prevTokenKey !== tokenKey) {
    setPrevTokenKey(tokenKey);
    setCalendars([]);
    setEvents([]);
  }

  const sync = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let cals = calendarsRef.current;
      if (cals.length === 0) {
        cals = await fetchCalendars(token.accessToken);
        calendarsRef.current = cals;
        setCalendars(cals);
      }
      const timeMin = startOfDay(new Date());
      const timeMax = new Date(timeMin.getTime() + 2 * 86400000); // today + tomorrow
      const fetched = await fetchAllEvents(token.accessToken, cals, timeMin, timeMax);
      setEvents(fetched);
      setLastSynced(new Date());
    } catch (e) {
      if (e instanceof GoogleApiError && e.status === 401) {
        onAuthError();
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to sync calendar");
    } finally {
      setLoading(false);
    }
  }, [token, onAuthError]);

  useEffect(() => {
    calendarsRef.current = [];
    if (!token) return;
    // Kicks off the initial fetch for this token; sync() sets `loading`
    // synchronously before its first await, which is the standard
    // data-fetching-effect shape (see react.dev/learn/synchronizing-with-effects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    sync();
    const interval = setInterval(sync, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.accessToken]);

  return { calendars, events, loading, error, lastSynced, refresh: sync };
}
