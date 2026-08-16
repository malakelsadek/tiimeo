import type { StatusedEvent } from "./types";
import type { SoundOption } from "./settings";
import { formatClock } from "./time";
import { playAlertSound } from "./sound";

export type PermissionResult = NotificationPermission | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestAlertPermission(): Promise<PermissionResult> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export function fireEventAlert(event: StatusedEvent, sound: SoundOption) {
  if (notificationsSupported() && Notification.permission === "granted") {
    try {
      new Notification(event.title, {
        body: `Starts at ${formatClock(event.start)}`,
        tag: event.id,
      });
    } catch {
      // Some browsers (notably iOS Safari) advertise the API but throw on use.
    }
  }
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
  playAlertSound(sound);
}
