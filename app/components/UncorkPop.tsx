"use client";

// The receiver's uncorking gesture: the cork is only allowed to move a
// short visual distance while dragged (a "stuck" feel), but the actual
// pointer travel needed to trigger the pop is much further — so tugging
// gently just wobbles it, and a real pull sends it flying. Reports drag
// tension (0-1) via onTension so the parent bottle can react (a slight
// lift/rotate as if being tugged) before the pop happens. A fallback
// button and keyboard (Enter/ArrowUp) path complete it without a drag.

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { sprites } from "../../lib/sprites";
import { playSfx, duckAmbient } from "../../lib/audio";

const RAW_POP_THRESHOLD = -95;
const FLICK_VELOCITY = -650;
const VISUAL_TRAVEL = 22;

export default function UncorkPop({
  widthPx,
  style,
  onPopped,
  onTension,
}: {
  widthPx: number;
  style: React.CSSProperties;
  onPopped: () => void;
  onTension?: (t: number) => void;
}) {
  const controls = useAnimation();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const fly = async () => {
    onTension?.(0);
    playSfx("corkPop");
    duckAmbient();
    await controls.start({
      y: -70,
      rotate: 200,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    });
    onPopped();
  };

  return (
    <>
      <motion.img
        src={sprites.cork.src}
        alt="Pull the cork upward"
        tabIndex={0}
        role="button"
        aria-label="Pull the cork out"
        draggable={false}
        className="pixel-sprite absolute cursor-grab touch-none select-none outline-none focus-visible:ring-4 focus-visible:ring-white/70 active:cursor-grabbing"
        style={{ width: widthPx, ...style }}
        animate={controls}
        drag="y"
        dragConstraints={{ top: -VISUAL_TRAVEL, bottom: 6 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDrag={(_, info) => {
          onTension?.(Math.min(1, Math.max(0, -info.offset.y / 90)));
        }}
        onDragEnd={(_, info) => {
          if (info.offset.y < RAW_POP_THRESHOLD || info.velocity.y < FLICK_VELOCITY) {
            fly();
          } else {
            onTension?.(0);
            controls.start({
              y: 0,
              transition: { type: "spring", stiffness: 320, damping: 16 },
            });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") {
            e.preventDefault();
            fly();
          }
        }}
      />

      {showFallback && (
        <button
          onClick={fly}
          className="absolute left-1/2 -bottom-24 w-max -translate-x-1/2 rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-4 py-2 text-sm font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-y-[2px] active:shadow-none"
        >
          Pull the cork out
        </button>
      )}
    </>
  );
}
