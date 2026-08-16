"use client";

import { useEffect } from "react";
import type { StatusedEvent } from "@/lib/types";
import { formatDuration } from "@/lib/time";

const BASE_TITLE = "tiimeo";

export function useDocumentTitle(current: StatusedEvent[], next: StatusedEvent | null, now: Date) {
  useEffect(() => {
    if (current.length > 0) {
      const remaining = formatDuration(current[0].end.getTime() - now.getTime());
      document.title = `${remaining} · ${current[0].title}`;
    } else if (next) {
      const until = formatDuration(next.start.getTime() - now.getTime());
      document.title = `Free · ${until} until ${next.title}`;
    } else {
      document.title = BASE_TITLE;
    }
    return () => {
      document.title = BASE_TITLE;
    };
  }, [current, next, now]);
}
