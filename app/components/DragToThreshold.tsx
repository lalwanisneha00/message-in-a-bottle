"use client";

// A sprite the user drags upward past a distance threshold to trigger
// onComplete (cork popping out, cork seating into a neck, paper sliding
// in or out of a bottle) — the same "stuck, then releases" drag mechanic
// used by every bottle interaction in both experiences. Below the
// threshold it springs back to its resting position.

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function DragToThreshold({
  spriteSrc,
  widthPx,
  style,
  threshold = -70,
  onComplete,
  label,
}: {
  spriteSrc: string;
  widthPx: number;
  style: React.CSSProperties;
  threshold?: number;
  onComplete: () => void;
  label: string;
}) {
  const controls = useAnimation();
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <motion.img
      src={spriteSrc}
      alt={label}
      draggable={false}
      className="pixel-sprite absolute cursor-grab active:cursor-grabbing touch-none select-none"
      style={{ width: widthPx, ...style }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: threshold - 20, bottom: 40 }}
      dragElastic={0.3}
      dragMomentum={false}
      whileDrag={{ scale: 1.06 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < threshold) {
          setDone(true);
          onComplete();
        } else {
          controls.start({
            y: 0,
            transition: { type: "spring", stiffness: 280, damping: 15 },
          });
        }
      }}
    />
  );
}
