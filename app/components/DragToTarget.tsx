"use client";

// A sprite the user can drag freely anywhere on screen (both axes, not
// locked to a single direction) that completes as soon as it's dragged
// close enough to a target point — used where the drag start position
// isn't already aligned with the target on one axis (e.g. the paper
// roll starting beside the bottle rather than directly above its
// mouth), so a single-axis threshold drag can never actually reach it.
// Always reachable without a pointer: a fallback button appears after
// a few seconds of inactivity, and the sprite is keyboard-focusable
// (Enter/Space completes it immediately).

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { playSfx } from "../../lib/audio";
import type { SoundKey } from "../../lib/sounds";

export default function DragToTarget({
  spriteSrc,
  widthPx,
  restLeft,
  restTop,
  rotate,
  targetLeft,
  targetTop,
  snapRadius = 46,
  onComplete,
  label,
  sound,
}: {
  spriteSrc: string;
  widthPx: number;
  restLeft: number;
  restTop: number;
  rotate?: string;
  targetLeft: number;
  targetTop: number;
  snapRadius?: number;
  onComplete: () => void;
  label: string;
  sound?: SoundKey;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [done, setDone] = useState(false);
  const [near, setNear] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const requiredDX = targetLeft - restLeft;
  const requiredDY = targetTop - restTop;

  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  const complete = () => {
    setDone(true);
    if (sound) playSfx(sound);
    onComplete();
  };

  const distanceToTarget = () => Math.hypot(x.get() - requiredDX, y.get() - requiredDY);

  return (
    <>
      <motion.img
        src={spriteSrc}
        alt={label}
        tabIndex={0}
        role="button"
        aria-label={label}
        draggable={false}
        className="pixel-sprite absolute cursor-grab touch-none select-none outline-none focus-visible:ring-4 focus-visible:ring-white/70 active:cursor-grabbing"
        style={{
          width: widthPx,
          left: restLeft,
          top: restTop,
          rotate,
          x,
          y,
          filter: near ? "brightness(1.35) drop-shadow(0 0 6px white)" : undefined,
        }}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDrag={() => {
          const dist = distanceToTarget();
          setNear(dist < snapRadius * 1.6);
          if (dist < snapRadius) complete();
        }}
        onDragEnd={() => {
          if (done) return;
          setNear(false);
          animate(x, 0, { type: "spring", stiffness: 260, damping: 18 });
          animate(y, 0, { type: "spring", stiffness: 260, damping: 18 });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            complete();
          }
        }}
      />

      {showFallback && (
        <button
          onClick={complete}
          className="absolute left-1/2 -bottom-24 w-max -translate-x-1/2 rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-4 py-2 text-sm font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-y-[2px] active:shadow-none"
        >
          {label}
        </button>
      )}
    </>
  );
}
