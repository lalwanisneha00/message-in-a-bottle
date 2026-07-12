"use client";

/**
 * Generic low-res canvas sprite. Every hand-drawn prop (Bottle, Cork,
 * VintagePaper, ...) renders through this so scaling/crispness rules stay
 * in exactly one place. Pass `animate` for sprites that redraw every frame
 * (e.g. a wiggling cork); omit it for sprites that only need to draw once.
 */

import { useEffect, useRef } from "react";
import { useAnimationFrame } from "framer-motion";

export interface PixelSpriteProps {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, t: number) => void;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PixelSprite({ width, height, draw, animate = false, className, style }: PixelSpriteProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    if (animate) return;
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    drawRef.current(ctx, 0);
  }, [animate, width, height]);

  useAnimationFrame((t) => {
    if (!animate) return;
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    drawRef.current(ctx, t);
  });

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={`pixelated pointer-events-none ${className ?? ""}`}
      style={style}
    />
  );
}
