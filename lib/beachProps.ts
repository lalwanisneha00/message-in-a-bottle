import type { SpriteKey } from "./sprites";

export interface BeachProp {
  sprite: SpriteKey;
  leftPct: number;
  bottomPct: number;
  widthPx: number;
  flip?: boolean;
  swayDelay?: number;
}

// Positions are deliberately asymmetric (no mirrored pairs, no even
// spacing) so the beach doesn't read as a tiled/copy-pasted strip.
export const beachProps: BeachProp[] = [
  { sprite: "palmTree", leftPct: 8, bottomPct: 30, widthPx: 190, swayDelay: 0 },
  { sprite: "palmTree", leftPct: 15, bottomPct: 12, widthPx: 130, flip: true, swayDelay: 1.4 },
  { sprite: "palmTree", leftPct: 86, bottomPct: 22, widthPx: 170, swayDelay: 0.7 },

  { sprite: "sandcastle1", leftPct: 46, bottomPct: 8, widthPx: 130 },
  { sprite: "sandcastle2", leftPct: 68, bottomPct: 18, widthPx: 90, flip: true },

  { sprite: "starfish", leftPct: 27, bottomPct: 20, widthPx: 46 },
  { sprite: "starfish", leftPct: 92, bottomPct: 10, widthPx: 34, flip: true },

  { sprite: "crab", leftPct: 36, bottomPct: 10, widthPx: 42 },
  { sprite: "crab", leftPct: 60, bottomPct: 26, widthPx: 36, flip: true },
];

export interface CloudTrack {
  sprite: SpriteKey;
  topPct: number;
  widthPx: number;
  durationS: number;
  delayS: number;
}

export const cloudTracks: CloudTrack[] = [
  { sprite: "cloud1", topPct: 6, widthPx: 190, durationS: 150, delayS: 0 },
  { sprite: "cloud2", topPct: 18, widthPx: 220, durationS: 210, delayS: -60 },
  { sprite: "cloud3", topPct: 3, widthPx: 150, durationS: 120, delayS: -30 },
  { sprite: "cloud4", topPct: 28, widthPx: 220, durationS: 240, delayS: -140 },
  { sprite: "cloud5", topPct: 12, widthPx: 190, durationS: 180, delayS: -20 },
  { sprite: "cloud6", topPct: 22, widthPx: 320, durationS: 260, delayS: -90 },
  { sprite: "cloud7", topPct: 34, widthPx: 200, durationS: 140, delayS: -100 },
];
