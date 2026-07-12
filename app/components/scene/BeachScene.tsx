"use client";

/**
 * BeachScene — the entire shared sunset-beach environment, hand-drawn in
 * code as genuine low-resolution pixel art. No image assets of any kind.
 *
 * TECHNIQUE (shared with every other pixel-art component via lib/pixelArt/)
 * - Everything is painted onto a tiny 320x180 canvas (GRID_W x GRID_H),
 *   then blown up to fill its container with CSS (`image-rendering:
 *   pixelated`), so every drawn pixel becomes one big crisp square.
 * - Only the 16 colours in lib/pixelArt/palette.ts exist anywhere.
 * - There are no CSS gradients, blurs, shadows or opacity fades. "Smooth"
 *   colour transitions are faked with ordered (Bayer) dithering — see
 *   lib/pixelArt/draw.ts `ditherBand`.
 * - Every drawn coordinate is rounded to a whole pixel (`px()`). Sub-pixel
 *   positions are what make pixel art shimmer, so they're banned here.
 * - Water/foam/sparkle animate by stepping between a handful of discrete
 *   frames, never by interpolating smoothly.
 * - Clouds/birds/boat scroll via a requestAnimationFrame-driven loop
 *   (Framer Motion's `useAnimationFrame`) with seamless modulo wrapping.
 *   The sun's gentle bob is driven by an actual Framer Motion motion
 *   value (spring/eased), read and rounded to a whole pixel every frame —
 *   the same pattern the interactive props (Bottle/Cork/VintagePaper)
 *   use, layered above this canvas via the `children` slot.
 *
 * Layers are drawn bottom-to-top in the animation loop below, each in its
 * own clearly labelled function — tweak any single layer without
 * touching the others.
 */

import { useEffect, useRef } from "react";
import { animate, useAnimationFrame, useMotionValue } from "framer-motion";
import { PALETTE } from "@/lib/pixelArt/palette";
import { drawDitheredCircle, drawRuns, ditherBand, ditherThreshold, fillRow, px, speckle, type Run } from "@/lib/pixelArt/draw";

/* ============================================================
   INTERNAL RESOLUTION — the whole scene lives on this tiny grid.
   ============================================================ */
const GRID_W = 320;
const GRID_H = 180;
const HORIZON_Y = 100; // sky/ocean boundary row
const SHORE_Y = 160; // ocean/beach boundary row

const SUN_X = 226;
const SUN_Y = 88;
const SUN_R = 13;

/* ============================================================
   SPRITES — declared as small lists of rectangle "runs" rather than
   hand-drawn bitmaps, so they stay easy to nudge pixel by pixel.
   ============================================================ */

// -- Clouds: three flat-stacked variants, wide in the middle, shaded underneath
const CLOUD_SHAPES: Run[][] = [
  [
    { dx: 3, dy: 0, w: 6, h: 1, color: "cloud" },
    { dx: 0, dy: 1, w: 12, h: 1, color: "cloud" },
    { dx: -2, dy: 2, w: 16, h: 1, color: "cloud" },
    { dx: 0, dy: 3, w: 12, h: 1, color: "cloudShade" },
  ],
  [
    { dx: 2, dy: 0, w: 4, h: 1, color: "cloud" },
    { dx: 0, dy: 1, w: 8, h: 1, color: "cloud" },
    { dx: -1, dy: 2, w: 10, h: 1, color: "cloud" },
    { dx: 0, dy: 3, w: 8, h: 1, color: "cloudShade" },
  ],
  [
    { dx: 4, dy: 0, w: 8, h: 1, color: "cloud" },
    { dx: 1, dy: 1, w: 14, h: 1, color: "cloud" },
    { dx: -2, dy: 2, w: 20, h: 1, color: "cloud" },
    { dx: 0, dy: 3, w: 15, h: 1, color: "cloudShade" },
  ],
];
const CLOUD_TILE = 220;
const CLOUD_INSTANCES = [
  { x: 20, y: 22, shape: 0 },
  { x: 90, y: 44, shape: 1 },
  { x: 150, y: 16, shape: 2 },
  { x: 190, y: 55, shape: 1 },
];

// -- Birds: two flap frames, a tiny stair-stepped "V"
const BIRD_FRAMES: Run[][] = [
  [
    { dx: 0, dy: 1, w: 2, h: 1, color: "ink" },
    { dx: 2, dy: 0, w: 2, h: 1, color: "ink" },
    { dx: 4, dy: 0, w: 2, h: 1, color: "ink" },
    { dx: 6, dy: 1, w: 2, h: 1, color: "ink" },
  ],
  [
    { dx: 0, dy: 0, w: 2, h: 1, color: "ink" },
    { dx: 2, dy: 1, w: 2, h: 1, color: "ink" },
    { dx: 4, dy: 1, w: 2, h: 1, color: "ink" },
    { dx: 6, dy: 0, w: 2, h: 1, color: "ink" },
  ],
];
const BIRDS = [
  { y: 34, speed: 0.017, phase: 0 },
  { y: 50, speed: 0.013, phase: 90 },
  { y: 27, speed: 0.021, phase: 200 },
];

// -- Sailboat silhouette on the horizon
const BOAT_SHAPE: Run[] = [
  { dx: 0, dy: 6, w: 14, h: 2, color: "ink" },
  { dx: 6, dy: 0, w: 1, h: 6, color: "ink" },
  { dx: 7, dy: 1, w: 4, h: 1, color: "sand" },
  { dx: 7, dy: 2, w: 3, h: 1, color: "sand" },
  { dx: 7, dy: 3, w: 2, h: 1, color: "sand" },
  { dx: 7, dy: 4, w: 1, h: 1, color: "sand" },
];

// -- Palm trees: leaning, stair-stepped trunk + swaying frond cluster
const PALMS = [
  { x: 34, phase: 0 },
  { x: 276, phase: 2.4 },
];
function palmTrunkRuns(): Run[] {
  return [
    { dx: 0, dy: -24, w: 2, h: 6, color: "sandShade" },
    { dx: 1, dy: -18, w: 2, h: 6, color: "sandShade" },
    { dx: 2, dy: -12, w: 2, h: 6, color: "sandShade" },
    { dx: 1, dy: -6, w: 2, h: 6, color: "sandShade" },
  ];
}
function palmFrondRuns(sway: number): Run[] {
  return [
    { dx: -10 + sway, dy: -26, w: 8, h: 1, color: "foliage" },
    { dx: 3 + sway, dy: -28, w: 9, h: 1, color: "foliage" },
    { dx: 4 + sway, dy: -30, w: 7, h: 1, color: "foliage" },
    { dx: -8 + sway, dy: -30, w: 6, h: 1, color: "foliage" },
    { dx: -1, dy: -27, w: 4, h: 3, color: "oceanFar" },
  ];
}

// -- Small beach decorations
const SHELLS = [
  { x: 64, y: 172 },
  { x: 248, y: 176 },
];
const SHELL_SHAPE: Run[] = [
  { dx: 0, dy: 1, w: 3, h: 1, color: "foam" },
  { dx: 1, dy: 0, w: 1, h: 2, color: "foam" },
];
const ROCK: Run[] = [
  { dx: 0, dy: 1, w: 5, h: 2, color: "ink" },
  { dx: 1, dy: 0, w: 3, h: 1, color: "ink" },
];
const DRIFTWOOD: Run[] = [
  { dx: 0, dy: 0, w: 9, h: 1, color: "sandShade" },
  { dx: 2, dy: -1, w: 1, h: 1, color: "sandShade" },
];

/* ============================================================
   ANIMATION TIMING — everything below steps between discrete
   frames rather than interpolating.
   ============================================================ */
const WAVE_FRAME_MS = 300; // shoreline foam frame duration
const WAVE_FRAME_COUNT = 4;
const SPARKLE_FRAME_MS = 220;
const CLOUD_SPEED = 0.004; // px / ms
const BIRD_MARGIN = 16;
const BOAT_SPEED = 0.01;
const BOAT_MARGIN = 20;

// Four shoreline foam patterns — small x-offset "teeth" along the shore line
const WAVE_PATTERNS: number[][] = [
  [0, 1, 0, 2, 1, 0, 1, 2, 0, 1],
  [1, 0, 2, 1, 0, 1, 0, 2, 1, 0],
  [0, 2, 1, 0, 1, 2, 0, 1, 0, 2],
  [2, 0, 1, 1, 0, 2, 1, 0, 2, 1],
];

/* ============================================================
   LAYER: SKY
   ============================================================ */
function drawSky(ctx: CanvasRenderingContext2D) {
  for (let y = 0; y < 25; y++) fillRow(ctx, y, GRID_W, "skyTop");
  ditherBand(ctx, 0, 25, GRID_W, 20, "skyTop", "skyMid");
  for (let y = 45; y < 65; y++) fillRow(ctx, y, GRID_W, "skyMid");
  ditherBand(ctx, 0, 65, GRID_W, 20, "skyMid", "skyWarm");
  for (let y = 85; y < 94; y++) fillRow(ctx, y, GRID_W, "skyWarm");
  ditherBand(ctx, 0, 94, GRID_W, 6, "skyWarm", "sunRim");
}

/* ============================================================
   LAYER: SUN (dithered rim, gentle Framer-Motion-driven bob)
   ============================================================ */
function drawSun(ctx: CanvasRenderingContext2D, bob: number) {
  drawDitheredCircle(ctx, SUN_X, SUN_Y + px(bob), SUN_R, "sun", "sunRim");
}

/* ============================================================
   LAYER: CLOUDS (slow parallax, seamless tiling scroll)
   ============================================================ */
function drawClouds(ctx: CanvasRenderingContext2D, t: number) {
  const scroll = (t * CLOUD_SPEED) % CLOUD_TILE;
  for (const c of CLOUD_INSTANCES) {
    for (const rep of [-1, 0, 1]) {
      const x = c.x - scroll + rep * CLOUD_TILE;
      if (x < -24 || x > GRID_W + 24) continue;
      drawRuns(ctx, x, c.y, CLOUD_SHAPES[c.shape]);
    }
  }
}

/* ============================================================
   LAYER: BIRDS (medium parallax, wrap around, 2-frame flap)
   ============================================================ */
function drawBirds(ctx: CanvasRenderingContext2D, t: number) {
  const flap = Math.floor(t / 260) % 2;
  const span = GRID_W + BIRD_MARGIN * 2;
  for (const b of BIRDS) {
    const raw = (((t * b.speed + b.phase) % span) + span) % span;
    const x = raw - BIRD_MARGIN;
    drawRuns(ctx, x, b.y, BIRD_FRAMES[flap]);
  }
}

/* ============================================================
   LAYER: BOAT (slow drift along the horizon, wraps around)
   ============================================================ */
function drawBoat(ctx: CanvasRenderingContext2D, t: number) {
  const span = GRID_W + BOAT_MARGIN * 2;
  const raw = (((t * BOAT_SPEED) % span) + span) % span;
  const x = raw - BOAT_MARGIN;
  drawRuns(ctx, x, 90, BOAT_SHAPE);
}

/* ============================================================
   LAYER: OCEAN (depth bands, sun reflection shimmer, sparkle, foam)
   ============================================================ */
function drawOcean(ctx: CanvasRenderingContext2D, t: number) {
  const sparkleFrame = Math.floor(t / SPARKLE_FRAME_MS);
  const waveFrame = Math.floor(t / WAVE_FRAME_MS) % WAVE_FRAME_COUNT;

  ditherBand(ctx, 0, HORIZON_Y, GRID_W, 6, "sunRim", "oceanFar");
  for (let y = HORIZON_Y + 6; y < 120; y++) fillRow(ctx, y, GRID_W, "oceanFar");
  ditherBand(ctx, 0, 120, GRID_W, 16, "oceanFar", "oceanMid");
  for (let y = 136; y < 148; y++) fillRow(ctx, y, GRID_W, "oceanMid");
  ditherBand(ctx, 0, 148, GRID_W, 8, "oceanMid", "oceanNear");
  for (let y = 156; y < SHORE_Y; y++) fillRow(ctx, y, GRID_W, "oceanNear");

  // Sun's reflection: short flickering dashes directly below the sun,
  // stepping between two states per wave-frame (never a smooth fade).
  const flicker = waveFrame % 2 === 0;
  for (let y = HORIZON_Y + 2; y < SHORE_Y - 2; y += 4) {
    const width = 10 - Math.floor((y - HORIZON_Y) / 14);
    if (width <= 0) continue;
    const jitter = flicker ? 1 : -1;
    ctx.fillStyle = PALETTE.sunRim;
    ctx.fillRect(px(SUN_X - width / 2 + jitter), y, width, 1);
  }

  // Sparkle: sparse twinkling highlights, frame-stepped via seed offset
  for (let y = HORIZON_Y + 4; y < SHORE_Y; y += 2) {
    for (let x = 0; x < GRID_W; x += 3) {
      const n = ditherThreshold(x + sparkleFrame, y - sparkleFrame);
      if (n > 0.93) {
        ctx.fillStyle = PALETTE.sparkle;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Shoreline foam: 4-frame stepped zig-zag right at the sand boundary
  const pattern = WAVE_PATTERNS[waveFrame];
  for (let i = 0; i < pattern.length; i++) {
    const x = i * (GRID_W / pattern.length);
    const h = 2 + pattern[i];
    ctx.fillStyle = PALETTE.foam;
    ctx.fillRect(px(x), SHORE_Y - h, GRID_W / pattern.length - 2, h);
  }
}

/* ============================================================
   LAYER: BEACH (sand band, wet-sand blend, grain texture)
   ============================================================ */
function drawBeach(ctx: CanvasRenderingContext2D, t: number) {
  const seed = Math.floor(t / WAVE_FRAME_MS);
  ditherBand(ctx, 0, SHORE_Y - 2, GRID_W, 6, "foam", "sand");
  for (let y = SHORE_Y + 4; y < GRID_H; y++) fillRow(ctx, y, GRID_W, "sand");
  speckle(ctx, 0, SHORE_Y + 4, GRID_W, GRID_H - SHORE_Y - 4, "sand", "sandShade", 0.1, seed % 3);
}

/* ============================================================
   LAYER: PALM TREES (stair-stepped lean, whole-pixel sway)
   ============================================================ */
function drawPalmTrees(ctx: CanvasRenderingContext2D, t: number) {
  for (const p of PALMS) {
    const sway = px(Math.sin(t / 1500 + p.phase) * 1.4);
    drawRuns(ctx, p.x, GRID_H - 6, palmTrunkRuns());
    drawRuns(ctx, p.x + 2, GRID_H - 6, palmFrondRuns(sway));
  }
}

/* ============================================================
   LAYER: BEACH DECORATIONS (static, for atmosphere)
   ============================================================ */
function drawDecorations(ctx: CanvasRenderingContext2D) {
  for (const s of SHELLS) drawRuns(ctx, s.x, s.y, SHELL_SHAPE);
  drawRuns(ctx, 150, 174, ROCK);
  drawRuns(ctx, 205, 171, DRIFTWOOD);
}

/* ============================================================
   COMPONENT
   ============================================================ */
export default function BeachScene({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sunBob = useMotionValue(0);

  useEffect(() => {
    const controls = animate(sunBob, [0, -2, 0, 1, 0], {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [sunBob]);

  useAnimationFrame((t) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    drawSky(ctx);
    drawSun(ctx, sunBob.get());
    drawClouds(ctx, t);
    drawBirds(ctx, t);
    drawBoat(ctx, t);
    drawOcean(ctx, t);
    drawBeach(ctx, t);
    drawPalmTrees(ctx, t);
    drawDecorations(ctx);
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: PALETTE.skyTop }}>
      <canvas
        ref={canvasRef}
        width={GRID_W}
        height={GRID_H}
        className="pixelated pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative min-h-screen" style={{ zIndex: 20 }}>
        {children}
      </div>
    </div>
  );
}
