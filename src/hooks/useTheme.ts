"use client";

import { useEffect } from "react";
import type { Settings } from "@/lib/settings";
import { contrastTextColor } from "@/lib/color";

const CUSTOM_PROPS = ["--surface-0", "--surface-1", "--text-primary", "--accent", "--bar-color", "--clock-color", "--on-accent"];

export function useTheme(settings: Settings) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;

    if (settings.theme !== "custom") {
      for (const prop of CUSTOM_PROPS) root.style.removeProperty(prop);
      return;
    }

    const { background, text, bar, clock } = settings.customColors;
    root.style.setProperty("--surface-0", background);
    root.style.setProperty("--surface-1", `color-mix(in srgb, ${background} 88%, white)`);
    root.style.setProperty("--text-primary", text);
    root.style.setProperty("--accent", bar);
    root.style.setProperty("--bar-color", bar);
    root.style.setProperty("--clock-color", clock);
    root.style.setProperty("--on-accent", contrastTextColor(bar));
  }, [settings.theme, settings.customColors]);
}
