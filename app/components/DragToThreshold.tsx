"use client";

// A sprite the user drags upward past a distance threshold to trigger
// onComplete (cork seating into a neck, paper sliding in or out of a
// bottle) — the same "stuck, then releases" drag mechanic used by
// several bottle interactions. Below the threshold it springs back to
// its resting position. Always reachable without a pointer: a fallback
// button appears after a few seconds of inactivity, and the sprite
// itself is keyboard-focusable (Enter/ArrowUp completes it).

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { playSfx } from "../../lib/audio";
import type { SoundKey } from "../../lib/sounds";

export default function DragToThreshold({
  spriteSrc,
  widthPx,
  style,
  threshold = -70,
  onComplete,
  label,
  sound,
}: {
  spriteSrc: string;
  widthPx: number;
  style: React.CSSProperties;
  threshold?: number;
  onComplete: () => void;
  label: string;
  sound?: SoundKey;
}) {
  const controls = useAnimation();
  const [done, setDone] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

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
        style={{ width: widthPx, ...style }}
        animate={controls}
        drag="y"
        dragConstraints={{ top: threshold - 20, bottom: 40 }}
        dragElastic={0.3}
        dragMomentum={false}
        whileDrag={{ scale: 1.06 }}
        onDragEnd={(_, info) => {
          if (info.offset.y < threshold) {
            complete();
          } else {
            controls.start({
              y: 0,
              transition: { type: "spring", stiffness: 280, damping: 15 },
            });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") {
            e.preventDefault();
            complete();
          }
        }}
      />

      {showFallback && (
        <button
          onClick={complete}
          className="absolute left-1/2 -bottom-24 w-max -translate-x-1/2 rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-4 py-2 text-sm font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-y-[calc(2px)] active:shadow-none"
        >
          {label}
        </button>
      )}
    </>
  );
}
