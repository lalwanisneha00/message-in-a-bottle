"use client";

// The "roll the paper" gesture: swipe the unrolled vintage-paper sprite
// upward. Its vertical scale compresses live in proportion to drag
// distance (a cheap but readable stand-in for the top edge curling), and
// crossing the threshold — by drag distance or a fast flick — cross-fades
// into the rolled-paper sprite. A "Roll" button appears after a few
// seconds of inactivity as a non-drag fallback, also reachable by
// keyboard (focus + Enter/ArrowUp).

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { sprites } from "../../lib/sprites";
import { playSfx } from "../../lib/audio";

const THRESHOLD = -90;
const FLICK_VELOCITY = -500;

export default function RollingPaper({ onDone }: { onDone: () => void }) {
  const [rolled, setRolled] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const y = useMotionValue(0);
  const scaleY = useTransform(y, [THRESHOLD, 0], [0.55, 1]);
  const opacity = useTransform(y, [THRESHOLD, 0], [0.4, 1]);

  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const complete = () => {
    if (rolled) return;
    setRolled(true);
    playSfx("paperRoll");
    setTimeout(onDone, 550);
  };

  if (rolled) {
    return (
      <motion.img
        src={sprites.paperRoll.src}
        alt="Your message, rolled"
        className="pixel-sprite w-40"
        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-6">
      <motion.img
        src={sprites.vintagePaper.src}
        alt="Your written message"
        tabIndex={0}
        role="button"
        aria-label="Roll the paper closed"
        className="pixel-sprite w-[70vw] max-w-[380px] cursor-grab touch-none select-none outline-none focus-visible:ring-4 focus-visible:ring-white/70 active:cursor-grabbing"
        style={{ y, scaleY, opacity, transformOrigin: "50% 100%" }}
        drag="y"
        dragConstraints={{ top: THRESHOLD - 10, bottom: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.y < THRESHOLD || info.velocity.y < FLICK_VELOCITY) {
            complete();
          } else {
            animate(y, 0, { type: "spring", stiffness: 260, damping: 18 });
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
          className="rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-6 py-3 font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Roll the paper
        </button>
      )}
    </div>
  );
}
