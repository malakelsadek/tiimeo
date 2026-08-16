"use client";

import type { SoundOption } from "./settings";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

// Must be called from a real user gesture (tap/click) to unlock audio on
// mobile browsers, before any timer-driven alert tries to play a sound.
export function primeAudio() {
  const c = getContext();
  if (c && c.state === "suspended") c.resume();
}

function tone(c: AudioContext, freq: number, startAt: number, duration: number, gainPeak = 0.2) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(gainPeak, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

export function playAlertSound(sound: SoundOption) {
  if (sound === "none") return;
  const c = getContext();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  const now = c.currentTime;

  if (sound === "beep") {
    tone(c, 660, now, 0.15, 0.25);
  } else if (sound === "chime") {
    tone(c, 880, now, 0.35, 0.2);
    tone(c, 1174.66, now + 0.12, 0.4, 0.2);
  } else if (sound === "bell") {
    tone(c, 987.77, now, 1.1, 0.22);
    tone(c, 1975.53, now, 1.1, 0.06);
  }
}
