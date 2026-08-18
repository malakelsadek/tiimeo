export type SoundOption = "none" | "chime" | "beep" | "bell";
export type ThemeOption = "midnight" | "forest" | "plum" | "sunset" | "amber" | "rose" | "custom";
export type BarStyle = "solid" | "glow" | "minimal";
export type FontOption =
  | "system"
  | "mono"
  | "serif"
  | "orbitron"
  | "vt323"
  | "rajdhani"
  | "spacemono"
  | "bebasneue";

export interface CustomColors {
  background: string;
  text: string;
  bar: string;
  clock: string;
}

export interface Settings {
  alertsEnabled: boolean;
  leadMinutes: number;
  sound: SoundOption;
  theme: ThemeOption;
  customColors: CustomColors;
  barStyle: BarStyle;
  font: FontOption;
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
  { value: "sunset", label: "Sunset" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "custom", label: "Custom" },
];
export const BAR_STYLE_OPTIONS: { value: BarStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "glow", label: "Glow" },
  { value: "minimal", label: "Minimal" },
];
export const FONT_OPTIONS: { value: FontOption; label: string }[] = [
  { value: "system", label: "System" },
  { value: "mono", label: "Mono" },
  { value: "serif", label: "Serif" },
  { value: "orbitron", label: "Orbitron" },
  { value: "vt323", label: "Terminal" },
  { value: "rajdhani", label: "Rajdhani" },
  { value: "spacemono", label: "Space Mono" },
  { value: "bebasneue", label: "Bebas Neue" },
];

export const DEFAULT_CUSTOM_COLORS: CustomColors = {
  background: "#000000",
  text: "#ffffff",
  bar: "#3987e5",
  clock: "#ffffff",
};

export const DEFAULT_SETTINGS: Settings = {
  alertsEnabled: false,
  leadMinutes: 5,
  sound: "chime",
  theme: "midnight",
  customColors: DEFAULT_CUSTOM_COLORS,
  barStyle: "solid",
  font: "system",
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
