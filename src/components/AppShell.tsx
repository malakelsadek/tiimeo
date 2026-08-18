"use client";

import { useCallback, useMemo, useState } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useNow } from "@/hooks/useNow";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEventAlerts } from "@/hooks/useEventAlerts";
import { deriveSchedule } from "@/lib/schedule";
import { FONT_FAMILIES } from "@/lib/fonts";
import SignInScreen from "./SignInScreen";
import CountdownScreen from "./CountdownScreen";
import SettingsPanel from "./SettingsPanel";
import { RefreshIcon, GearIcon } from "./icons";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function AppShell() {
  const { token, status, error, signIn, signOut } = useGoogleAuth(CLIENT_ID);
  const onAuthError = useCallback(() => signOut(), [signOut]);
  const { calendars, events, loading, error: syncError, refresh } = useCalendarEvents(token, onAuthError);
  const now = useNow();
  const { settings, update: updateSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  useTheme(settings);

  const colorIndexById = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of calendars) map.set(c.id, c.colorIndex);
    return map;
  }, [calendars]);
  const colorIndexFor = useCallback((calendarId: string) => colorIndexById.get(calendarId) ?? 0, [
    colorIndexById,
  ]);

  const schedule = useMemo(() => deriveSchedule(events, now), [events, now]);

  useDocumentTitle(schedule.current, schedule.next, now);
  useEventAlerts(schedule.next, now, settings);

  if (!token) {
    return (
      <SignInScreen
        onSignIn={signIn}
        loading={status === "loading"}
        error={error}
        configured={Boolean(CLIENT_ID)}
      />
    );
  }

  if (showSettings) {
    return (
      <div className="relative flex min-h-dvh flex-1 flex-col">
        <SettingsPanel
          settings={settings}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
          onSignOut={signOut}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col">
      <div
        className="absolute right-2 flex items-center gap-1"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
      >
        <button
          onClick={() => refresh()}
          aria-label="Refresh"
          className="rounded-full p-3"
          style={{ color: "var(--text-muted)" }}
        >
          <RefreshIcon className={loading ? "animate-spin" : undefined} />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className="rounded-full p-3"
          style={{ color: "var(--text-muted)" }}
        >
          <GearIcon />
        </button>
      </div>

      <main
        className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)",
        }}
      >
        {syncError ? (
          <p className="mb-6 text-xs" style={{ color: "var(--series-8)" }}>
            {syncError}
          </p>
        ) : null}
        <CountdownScreen
          current={schedule.current}
          next={schedule.next}
          freeBlock={schedule.freeBlock}
          now={now}
          colorIndexFor={colorIndexFor}
          countdownFont={FONT_FAMILIES[settings.font]}
          barStyle={settings.barStyle}
        />
      </main>
    </div>
  );
}
