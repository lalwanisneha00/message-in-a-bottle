export const Z = {
  sky: 0,
  scene: 5,
  content: 20,
  overlay: 30,
} as const;

/**
 * Geometry of BeachScene's internal 320x180 pixel canvas, expressed as
 * percentages so DOM-positioned interactive elements (bottle, cork, paper —
 * built on top of the canvas) can line up with the painted horizon/shore.
 * Keep these in sync with HORIZON_Y / SHORE_Y in BeachScene.tsx.
 */
export const HORIZON_Y_PCT = (100 / 180) * 100; // sky meets ocean
export const WATERLINE_Y_PCT = (160 / 180) * 100; // ocean meets sand
export const HORIZON_X_PCT = 50;

export function pctToPx(pct: number, size: number): number {
  return (pct / 100) * size;
}
