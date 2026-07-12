// Expected sound file locations. None of these exist in public/sounds/
// yet — this manifest documents the contract for when they're added.
// Every playback path in lib/audio.ts treats a missing/failed file as a
// silent no-op, never an error.

export const sounds = {
  ambientWaves: "/sounds/ambient-waves.mp3",
  ambientGull: "/sounds/ambient-gull.mp3",
  paperRustle: "/sounds/paper-rustle.mp3",
  paperRoll: "/sounds/paper-roll.mp3",
  paperUnroll: "/sounds/paper-unroll.mp3",
  corkSeat: "/sounds/cork-seat.mp3",
  corkPop: "/sounds/cork-pop.mp3",
  glassClink: "/sounds/glass-clink.mp3",
  splash: "/sounds/splash.mp3",
  droplet: "/sounds/droplet.mp3",
  click: "/sounds/click.mp3",
} as const;

export type SoundKey = keyof typeof sounds;
