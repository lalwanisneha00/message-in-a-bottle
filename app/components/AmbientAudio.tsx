"use client";

// Unlocks audio on the first pointer/keyboard interaction anywhere on the
// page (never calls .play() before a real user gesture, respecting
// autoplay policy) and pauses ambient sound while the tab is hidden.
// Renders nothing — this is wiring, not UI. Mount once per experience.

import { useEffect } from "react";
import { unlockAudio, handlePageVisibility } from "../../lib/audio";

export default function AmbientAudio() {
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("visibilitychange", handlePageVisibility);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", handlePageVisibility);
    };
  }, []);

  return null;
}
