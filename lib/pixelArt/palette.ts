/**
 * The one and only colour palette for the entire app. Every pixel-art
 * component (BeachScene and all interactive props) imports from here so
 * the whole experience shares one cohesive look. Exactly 16 colours —
 * several are intentionally reused for a second purpose (noted inline).
 */
export const PALETTE = {
  ink: "#241b2e", // outlines / deepest shadow, used everywhere
  skyTop: "#2b2158",
  skyMid: "#8a4a72",
  skyWarm: "#e2703f",
  sun: "#ffe066",
  sunRim: "#ffa63c", // also the horizon glow band
  cloud: "#ffdcc0",
  cloudShade: "#d98f7d",
  oceanFar: "#0d3f57", // also shadow under palm crowns / glass shading
  oceanMid: "#146a86",
  oceanNear: "#2c9cb0",
  foam: "#eef7f2",
  sand: "#e7c17e",
  sandShade: "#b98a4d", // also wood: trunks / driftwood / boat hull / cork
  foliage: "#2f7a4f",
  sparkle: "#fff8e8", // also paper / parchment highlight
} as const;

export type ColorKey = keyof typeof PALETTE;
