// Module-level audio manager: a plain HTMLAudioElement per sound (no
// external dependency — there's nothing in public/sounds/ yet to justify
// pulling in Howler, and this stays a thin, easy swap if that changes).
// Mute state and "has the user interacted yet" are inherently global, so
// this is a singleton rather than something threaded through props.
//
// Every entry point here is safe to call even when a file 404s: playback
// failures are caught and logged once per key, never thrown.

import { sounds, type SoundKey } from "./sounds";

const AMBIENT_VOLUME = 0.35;

const warned = new Set<SoundKey>();
const cache = new Map<SoundKey, HTMLAudioElement>();
const listeners = new Set<(muted: boolean) => void>();

let muted =
  typeof window !== "undefined" && localStorage.getItem("mitb-muted") === "1";
let unlocked = false;
let ambientEl: HTMLAudioElement | null = null;

function getAudio(key: SoundKey): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  let el = cache.get(key);
  if (!el) {
    el = new Audio(sounds[key]);
    el.preload = "none";
    el.addEventListener("error", () => {
      if (!warned.has(key)) {
        warned.add(key);
        console.warn(`[audio] "${key}" (${sounds[key]}) failed to load — continuing without sound.`);
      }
    });
    cache.set(key, el);
  }
  return el;
}

function fadeTo(el: HTMLAudioElement, target: number, ms: number) {
  const start = el.volume;
  const clampedTarget = Math.min(1, Math.max(0, target));
  const startTime = performance.now();
  function step(now: number) {
    const t = Math.min(1, Math.max(0, (now - startTime) / ms));
    el.volume = Math.min(1, Math.max(0, start + (clampedTarget - start) * t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function playSfx(key: SoundKey, volume = 1) {
  if (muted || !unlocked) return;
  const el = getAudio(key);
  if (!el) return;
  try {
    const instance = el.cloneNode(true) as HTMLAudioElement;
    instance.volume = volume;
    instance.play().catch(() => {});
  } catch {
    // missing file / decode failure — already logged once by the error listener
  }
}

export function unlockAudio() {
  if (unlocked || typeof window === "undefined") return;
  unlocked = true;

  ambientEl = getAudio("ambientWaves");
  if (ambientEl && !muted) {
    ambientEl.loop = true;
    ambientEl.volume = 0;
    ambientEl.play().catch(() => {});
    fadeTo(ambientEl, AMBIENT_VOLUME, 1500);
  }
}

export function duckAmbient(restoreDelayMs = 400) {
  if (!ambientEl) return;
  fadeTo(ambientEl, AMBIENT_VOLUME * 0.3, 120);
  setTimeout(() => {
    if (ambientEl && !muted) fadeTo(ambientEl, AMBIENT_VOLUME, 500);
  }, restoreDelayMs);
}

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") {
    localStorage.setItem("mitb-muted", next ? "1" : "0");
  }
  if (ambientEl) {
    fadeTo(ambientEl, next ? 0 : AMBIENT_VOLUME, 300);
  }
  listeners.forEach((l) => l(muted));
}

export function subscribeMuted(listener: (muted: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function handlePageVisibility() {
  if (typeof document === "undefined") return;
  if (document.hidden) {
    ambientEl?.pause();
  } else if (unlocked && !muted) {
    ambientEl?.play().catch(() => {});
  }
}
