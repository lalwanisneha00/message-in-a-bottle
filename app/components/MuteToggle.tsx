"use client";

// Persistent mute/unmute control, fixed top-right on both experiences.
// State is remembered across visits via localStorage (see lib/audio.ts).

import { useMuted } from "../../hooks/useMuted";

export default function MuteToggle() {
  const [muted, toggle] = useMuted();

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      aria-pressed={muted}
      className="fixed right-4 top-4 z-[100] flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5c3a1e] bg-[#c98a3f]/90 text-lg shadow-[2px_2px_0_#5c3a1e] backdrop-blur-sm transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
    >
      <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
