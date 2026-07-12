"use client";

/**
 * The glass bottle prop, drawn as pixel art. Two states: empty, or with
 * the rolled paper visible through the glass. Both sender and receiver
 * flows use this same component (and the same two states) — see the
 * bottle-state note in the project plan for why only two states are
 * needed (the cork is always a separate layered sprite, see Cork.tsx).
 */

import { drawRuns } from "@/lib/pixelArt/draw";
import { PALETTE } from "@/lib/pixelArt/palette";
import { expandProfile, profileWidth, silhouetteRuns } from "@/lib/pixelArt/silhouette";
import PixelSprite from "./PixelSprite";

const PROFILE_SEGMENTS: [rows: number, width: number][] = [
  [8, 10], // neck
  [4, 16],
  [4, 22],
  [4, 28], // shoulder flare
  [51, 30], // body
  [4, 26], // base taper
  [4, 20],
  [3, 12],
  [2, 6], // bottom nub
];
const WIDTHS = expandProfile(PROFILE_SEGMENTS);

export const BOTTLE_W = profileWidth(WIDTHS);
export const BOTTLE_H = WIDTHS.length;
export const BOTTLE_ANCHORS = {
  mouth: { x: BOTTLE_W / 2, y: 0 },
  neck: { x: BOTTLE_W / 2, y: 6 },
};

export interface BottleProps {
  withPaper?: boolean;
  scale?: number;
  className?: string;
}

export default function Bottle({ withPaper = false, scale = 3, className }: BottleProps) {
  return (
    <PixelSprite
      width={BOTTLE_W}
      height={BOTTLE_H}
      className={className}
      style={{ width: BOTTLE_W * scale, height: BOTTLE_H * scale }}
      draw={(ctx) => {
        drawRuns(ctx, 0, 0, silhouetteRuns(WIDTHS, "oceanNear", "ink"));

        // Glass shine: a dashed highlight streak down the left side of the body
        ctx.fillStyle = PALETTE.foam;
        for (let y = 14; y < 68; y += 3) ctx.fillRect(6, y, 1, 1);

        if (withPaper) {
          drawRuns(ctx, 0, 0, [
            { dx: 9, dy: 30, w: 12, h: 30, color: "sand" },
            { dx: 10, dy: 31, w: 10, h: 28, color: "sparkle" },
          ]);
          ctx.fillStyle = PALETTE.sandShade;
          ctx.fillRect(10, 43, 10, 1); // thread tie hint
        }
      }}
    />
  );
}
