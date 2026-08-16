"use client";

import { useEffect, useRef } from "react";
import type { StatusedEvent } from "@/lib/types";
import type { Settings } from "@/lib/settings";
import { fireEventAlert } from "@/lib/notifications";

// Fires once per event, when the countdown to its start crosses the
// configured lead time. A small negative floor guards against missing the
// window entirely if the tab was backgrounded through the exact second.
const LATE_FIRE_FLOOR_MS = -5_000;

export function useEventAlerts(next: StatusedEvent | null, now: Date, settings: Settings) {
  const alertedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.alertsEnabled || !next) return;

    const msUntilStart = next.start.getTime() - now.getTime();
    const leadMs = settings.leadMinutes * 60_000;
    if (msUntilStart > leadMs || msUntilStart < LATE_FIRE_FLOOR_MS) return;
    if (alertedIds.current.has(next.id)) return;

    alertedIds.current.add(next.id);
    fireEventAlert(next, settings.sound);
  }, [now, next, settings.alertsEnabled, settings.leadMinutes, settings.sound]);
}
