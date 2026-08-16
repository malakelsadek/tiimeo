"use client";

import { useState } from "react";
import {
  FONT_OPTIONS,
  LEAD_MINUTE_OPTIONS,
  SOUND_OPTIONS,
  THEME_OPTIONS,
  type Settings,
} from "@/lib/settings";
import { FONT_FAMILIES } from "@/lib/fonts";
import { requestAlertPermission } from "@/lib/notifications";
import { playAlertSound, primeAudio } from "@/lib/sound";
import { CloseIcon } from "./icons";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
  onSignOut: () => void;
}

function Pill({
  active,
  onClick,
  children,
  fontFamily,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  fontFamily?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
      style={{
        background: active ? "var(--accent)" : "var(--surface-1)",
        color: active ? "#000000" : "var(--text-secondary)",
        fontFamily,
      }}
    >
      {children}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

export default function SettingsPanel({ settings, onChange, onClose, onSignOut }: Props) {
  const [permissionNote, setPermissionNote] = useState<string | null>(null);

  const handleToggleAlerts = async () => {
    if (settings.alertsEnabled) {
      onChange({ alertsEnabled: false });
      return;
    }
    primeAudio();
    const result = await requestAlertPermission();
    if (result === "granted") {
      setPermissionNote(null);
      onChange({ alertsEnabled: true });
    } else if (result === "unsupported") {
      setPermissionNote("Notifications aren't supported here — sound and vibration will still play.");
      onChange({ alertsEnabled: true });
    } else {
      setPermissionNote("Notification permission was denied — enable it in your browser settings to get alerts.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-7 overflow-y-auto px-6 py-12 text-center">
      <button
        onClick={onClose}
        aria-label="Close settings"
        className="absolute right-2 rounded-full p-3"
        style={{ color: "var(--text-muted)", top: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
      >
        <CloseIcon />
      </button>

      <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
        Settings
      </p>

      <Section label="Alerts">
        <Pill active={settings.alertsEnabled} onClick={handleToggleAlerts}>
          {settings.alertsEnabled ? "On" : "Off"}
        </Pill>
        {permissionNote ? (
          <p className="max-w-xs text-xs" style={{ color: "var(--series-8)" }}>
            {permissionNote}
          </p>
        ) : null}
      </Section>

      <Section label="Lead time">
        <div className="flex flex-wrap justify-center gap-2">
          {LEAD_MINUTE_OPTIONS.map((m) => (
            <Pill key={m} active={settings.leadMinutes === m} onClick={() => onChange({ leadMinutes: m })}>
              {m}m
            </Pill>
          ))}
        </div>
      </Section>

      <Section label="Sound">
        <div className="flex flex-wrap justify-center gap-2">
          {SOUND_OPTIONS.map((s) => (
            <Pill
              key={s.value}
              active={settings.sound === s.value}
              onClick={() => {
                primeAudio();
                onChange({ sound: s.value });
                playAlertSound(s.value);
              }}
            >
              {s.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section label="Theme">
        <div className="flex flex-wrap justify-center gap-2">
          {THEME_OPTIONS.map((t) => (
            <Pill key={t.value} active={settings.theme === t.value} onClick={() => onChange({ theme: t.value })}>
              {t.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section label="Font">
        <div className="flex flex-wrap justify-center gap-2">
          {FONT_OPTIONS.map((f) => (
            <Pill
              key={f.value}
              active={settings.font === f.value}
              onClick={() => onChange({ font: f.value })}
              fontFamily={FONT_FAMILIES[f.value]}
            >
              {f.label}
            </Pill>
          ))}
        </div>
      </Section>

      <button onClick={onSignOut} className="text-xs" style={{ color: "var(--text-muted)" }}>
        Sign out
      </button>
    </div>
  );
}
