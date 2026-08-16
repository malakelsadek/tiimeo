"use client";

import { useEffect } from "react";
import type { ThemeOption } from "@/lib/settings";

export function useTheme(theme: ThemeOption) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
