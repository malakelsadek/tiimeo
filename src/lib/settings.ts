export type SoundOption = "none" | "chime" | "beep" | "bell";
export type ThemeOption = "midnight" | "forest" | "plum";

export interface Settings {
  alertsEnabled: boolean;
  leadMinutes: number;
  sound: SoundOption;
  theme: ThemeOption;
}

export const LEAD_MINUTE_OPTIONS = [1, 5, 10, 15] as const;
export const SOUND_OPTIONS: { value: SoundOption; label: string }[] = [
  { value: "none", label: "None" },
  { value: "chime", label: "Chime" },
  { value: "beep", label: "Beep" },
  { value: "bell", label: "Bell" },
];
export const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: "midnight", label: "Midnight" },
  { value: "forest", label: "Forest" },
  { value: "plum", label: "Plum" },
];

export const DEFAULT_SETTINGS: Settings = {
  alertsEnabled: false,
  leadMinutes: 5,
  sound: "chime",
  theme: "midnight",
};

const STORAGE_KEY = "tiimeo.settings";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private browsing, quota) — settings just won't persist.
  }
}
