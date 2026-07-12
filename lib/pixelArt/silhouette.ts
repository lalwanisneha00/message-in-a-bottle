import type { ColorKey } from "./palette";
import type { Run } from "./draw";

/** Expands compact [rows, width] segments into a per-row width profile. */
export function expandProfile(segments: [rows: number, width: number][]): number[] {
  const out: number[] = [];
  for (const [rows, w] of segments) for (let i = 0; i < rows; i++) out.push(w);
  return out;
}

/**
 * Turns a per-row width profile into centered Runs with a 1px outline —
 * the standard "chunky stair-stepped outline" shape every prop is built
 * from (bottle, cork, paper, ...).
 */
export function silhouetteRuns(widths: number[], fill: ColorKey, outline: ColorKey = "ink"): Run[] {
  const maxW = Math.max(...widths);
  const runs: Run[] = [];
  widths.forEach((w, y) => {
    if (w <= 0) return;
    const dx = (maxW - w) / 2;
    runs.push({ dx, dy: y, w, h: 1, color: outline });
    if (w > 2) {
      runs.push({ dx: dx + 1, dy: y, w: w - 2, h: 1, color: fill });
    }
  });
  return runs;
}

export function profileWidth(widths: number[]): number {
  return Math.max(...widths);
}
