"use client";

// The receiver's "unroll the paper" gesture: swipe the rolled-paper
// sprite downward. Reveal grows in proportion to drag distance (top
// edge fixed, height growing via scaleY from the top), and crossing the
// threshold — by distance or a fast flick — completes into the unrolled
// vintage-paper sprite. A "Unroll" button appears after a few seconds of
// inactivity as a non-drag fallback.

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { sprites } from "../../lib/sprites";
import { playSfx } from "../../lib/audio";

const THRESHOLD = 90;
const FLICK_VELOCITY = 500;

export default function UnrollPaper({ onDone }: { onDone: () => void }) {
  const [unrolled, setUnrolled] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const y = useMotionValue(0);
  const scaleY = useTransform(y, [0, THRESHOLD], [1, 1.6]);
  const opacity = useTransform(y, [0, THRESHOLD], [1, 0.5]);

  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const complete = () => {
    if (unrolled) return;
    setUnrolled(true);
    playSfx("paperUnroll");
    setTimeout(onDone, 550);
  };

  if (unrolled) {
    return (
      <motion.img
        src={sprites.vintagePaper.src}
        alt="The unrolled message"
        className="pixel-sprite w-[90vw] max-w-[480px]"
        initial={{ opacity: 0.5, scaleY: 0.3 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ transformOrigin: "top" }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.img
        src={sprites.paperRoll.src}
        alt="The rolled message"
        tabIndex={0}
        role="button"
        aria-label="Unroll the paper"
        className="pixel-sprite w-40 cursor-grab touch-none select-none outline-none focus-visible:ring-4 focus-visible:ring-white/70 active:cursor-grabbing"
        style={{ y, scaleY, opacity, transformOrigin: "top" }}
        drag="y"
        dragConstraints={{ top: 0, bottom: THRESHOLD + 10 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.y > THRESHOLD || info.velocity.y > FLICK_VELOCITY) {
            complete();
          } else {
            animate(y, 0, { type: "spring", stiffness: 260, damping: 18 });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            complete();
          }
        }}
      />

      {showFallback && (
        <button
          onClick={complete}
          className="rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-6 py-3 font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Unroll the paper
        </button>
      )}
    </div>
  );
}
