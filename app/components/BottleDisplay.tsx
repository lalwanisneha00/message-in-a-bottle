"use client";

// Presentational bottle sprite. `contents` selects which stage of the
// empty -> paper -> sealed -> floating progression to render; `floating`
// swaps the idle bob for the wider open-water rocking motion.

import { sprites } from "../../lib/sprites";

export type BottleContents = "empty" | "paper" | "sealed" | "floating";

const spriteForContents = {
  empty: sprites.bottleEmpty,
  paper: sprites.bottleWithPaper,
  sealed: sprites.bottleSealed,
  floating: sprites.bottleFloating,
} as const;

export default function BottleDisplay({
  contents,
  floating = false,
  still = false,
  className = "",
  alt = "",
}: {
  contents: BottleContents;
  floating?: boolean;
  still?: boolean;
  className?: string;
  alt?: string;
}) {
  const sprite = spriteForContents[contents];
  const motionClass = still
    ? ""
    : floating
      ? "anim-bottle-float"
      : "anim-bottle-idle";

  return (
    <img
      src={sprite.src}
      alt={alt}
      draggable={false}
      className={`pixel-sprite pointer-events-none select-none ${motionClass} ${className}`}
    />
  );
}
