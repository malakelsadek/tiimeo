"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "@/lib/settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Hydrate from localStorage post-mount — the server has no localStorage,
    // so reading it during render would mismatch hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}
