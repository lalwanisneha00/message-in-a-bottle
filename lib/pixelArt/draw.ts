import { PALETTE, type ColorKey } from "./palette";

/** Rounds to a whole pixel — every drawn coordinate must pass through this. */
export function px(n: number): number {
  return Math.round(n);
}

// Ordered 4x4 Bayer matrix -> deterministic hard-edged "gradient" dithering.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
export function ditherThreshold(x: number, y: number): number {
  return (BAYER_4X4[y & 3][x & 3] + 0.5) / 16;
}

export function fillRow(ctx: CanvasRenderingContext2D, y: number, w: number, color: ColorKey) {
  ctx.fillStyle = PALETTE[color];
  ctx.fillRect(0, y, w, 1);
}

/** Fakes a smooth gradient between two colours over `rows` rows using dithering. */
export function ditherBand(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  rows: number,
  colorA: ColorKey,
  colorB: ColorKey,
  xOffset = 0
) {
  for (let r = 0; r < rows; r++) {
    const mix = r / rows;
    const y = y0 + r;
    for (let x = 0; x < w; x++) {
      const useB = ditherThreshold(x0 + x + xOffset, y) < mix;
      ctx.fillStyle = PALETTE[useB ? colorB : colorA];
      ctx.fillRect(x0 + x, y, 1, 1);
    }
  }
}

/** Scatters a low-density fleck colour over a base area (grain / texture). */
export function speckle(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  rows: number,
  base: ColorKey,
  fleck: ColorKey,
  density: number,
  seed = 0
) {
  for (let r = 0; r < rows; r++) {
    const y = y0 + r;
    for (let x = 0; x < w; x++) {
      const n = ditherThreshold(x0 + x + seed, y + seed * 3);
      ctx.fillStyle = PALETTE[n < density ? fleck : base];
      ctx.fillRect(x0 + x, y, 1, 1);
    }
  }
}

/** A single hard-edged rectangle "run" — the basic unit every sprite is built from. */
export interface Run {
  dx: number;
  dy: number;
  w: number;
  h: number;
  color: ColorKey;
}

export function drawRuns(ctx: CanvasRenderingContext2D, ox: number, oy: number, runs: Run[]) {
  for (const r of runs) {
    ctx.fillStyle = PALETTE[r.color];
    ctx.fillRect(px(ox) + r.dx, px(oy) + r.dy, r.w, r.h);
  }
}

/** Procedural hard-edged circle (used for the sun) with a dithered rim. */
export function drawDitheredCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  core: ColorKey,
  rim: ColorKey,
  rimWidth = 2.2,
  rimBias = 0.6
) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) continue;
      const isRim = d > r - rimWidth;
      const useRim = isRim && ditherThreshold(cx + dx, cy + dy) < rimBias;
      ctx.fillStyle = PALETTE[useRim ? rim : core];
      ctx.fillRect(px(cx) + dx, px(cy) + dy, 1, 1);
    }
  }
}
