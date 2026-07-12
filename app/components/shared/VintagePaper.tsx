"use client";

/**
 * The unrolled vintage letter — off-white parchment with torn stair-
 * stepped corners, grain speckle, and a couple of coffee-stain blobs.
 * The message text itself is real HTML (handwriting font) laid over
 * this sprite by the caller, not drawn as pixels.
 */

import { drawDitheredCircle, drawRuns, speckle } from "@/lib/pixelArt/draw";
import { PALETTE } from "@/lib/pixelArt/palette";
import PixelSprite from "./PixelSprite";

export const PAPER_W = 100;
export const PAPER_H = 130;

const CORNER_NOTCH = 6;

function tornCorners(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < CORNER_NOTCH; i++) {
    const w = CORNER_NOTCH - i;
    ctx.clearRect(0, i, w, 1); // top-left
    ctx.clearRect(PAPER_W - w, i, w, 1); // top-right
    ctx.clearRect(0, PAPER_H - 1 - i, w, 1); // bottom-left
    ctx.clearRect(PAPER_W - w, PAPER_H - 1 - i, w, 1); // bottom-right
  }
}

export interface VintagePaperProps {
  scale?: number;
  className?: string;
}

export default function VintagePaper({ scale = 3, className }: VintagePaperProps) {
  return (
    <PixelSprite
      width={PAPER_W}
      height={PAPER_H}
      className={className}
      style={{ width: PAPER_W * scale, height: PAPER_H * scale }}
      draw={(ctx) => {
        ctx.clearRect(0, 0, PAPER_W, PAPER_H);

        ctx.fillStyle = PALETTE.sand;
        ctx.fillRect(0, 0, PAPER_W, PAPER_H);

        drawRuns(ctx, 0, 0, [
          { dx: 0, dy: 0, w: PAPER_W, h: 1, color: "ink" },
          { dx: 0, dy: PAPER_H - 1, w: PAPER_W, h: 1, color: "ink" },
          { dx: 0, dy: 0, w: 1, h: PAPER_H, color: "ink" },
          { dx: PAPER_W - 1, dy: 0, w: 1, h: PAPER_H, color: "ink" },
        ]);

        speckle(ctx, 2, 2, PAPER_W - 4, PAPER_H - 4, "sand", "sandShade", 0.05, 1);

        drawDitheredCircle(ctx, 22, 26, 6, "sandShade", "sand", 3, 0.5);
        drawDitheredCircle(ctx, 76, 98, 5, "sandShade", "sand", 3, 0.5);

        tornCorners(ctx);
      }}
    />
  );
}
