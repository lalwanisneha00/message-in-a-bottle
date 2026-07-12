"use client";

/** The cork, always a separate sprite layered on the bottle's neck so it
 * can pop/wiggle/be dragged independently of the bottle body. */

import { drawRuns } from "@/lib/pixelArt/draw";
import { PALETTE } from "@/lib/pixelArt/palette";
import { expandProfile, profileWidth, silhouetteRuns } from "@/lib/pixelArt/silhouette";
import PixelSprite from "./PixelSprite";

const PROFILE_SEGMENTS: [rows: number, width: number][] = [
  [3, 14],
  [4, 13],
  [4, 12],
  [5, 11],
  [4, 10],
];
const WIDTHS = expandProfile(PROFILE_SEGMENTS);

export const CORK_W = profileWidth(WIDTHS);
export const CORK_H = WIDTHS.length;

export interface CorkProps {
  scale?: number;
  className?: string;
}

export default function Cork({ scale = 3, className }: CorkProps) {
  return (
    <PixelSprite
      width={CORK_W}
      height={CORK_H}
      className={className}
      style={{ width: CORK_W * scale, height: CORK_H * scale }}
      draw={(ctx) => {
        drawRuns(ctx, 0, 0, silhouetteRuns(WIDTHS, "sandShade", "ink"));
        ctx.fillStyle = PALETTE.ink;
        for (let y = 2; y < CORK_H - 2; y += 4) {
          ctx.fillRect(4, y, 1, 1);
          ctx.fillRect(9, y + 2, 1, 1);
        }
      }}
    />
  );
}
