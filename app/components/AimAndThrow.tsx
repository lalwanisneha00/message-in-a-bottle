"use client";

// The sender's throw: press "Send Bottle to Ocean" to arm it, then pull
// the bottle backward (away from the water, which sits above the sand in
// this scene) and release. The dotted trajectory preview shown while
// aiming and the actual flight both come from the same simulateThrow
// function, so the preview is never a lie. A pull too weak to clear the
// shoreline lands and settles back on the sand for another attempt.

import { useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import BottleDisplay from "./BottleDisplay";
import Instruction from "./Instruction";
import { MAX_PULL_DISTANCE, pullToVelocity, simulateThrow } from "../../lib/physics";

const WATER_DISTANCE = 260;
const BOTTLE_WIDTH = 145;
const ORIGIN_X = BOTTLE_WIDTH / 2;
const ORIGIN_Y = 122;

type Phase = "ready" | "aiming" | "flying";

export default function AimAndThrow({
  onReachedWater,
}: {
  onReachedWater: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  const previewPoints =
    phase === "aiming" && Math.hypot(pull.x, pull.y) > 6
      ? simulateThrow(pullToVelocity(pull))
      : [];

  const launch = (releasePull: { x: number; y: number }) => {
    const magnitude = Math.hypot(releasePull.x, releasePull.y);

    if (magnitude < 16) {
      animate(x, 0, { type: "spring", stiffness: 320, damping: 22 });
      animate(y, 0, { type: "spring", stiffness: 320, damping: 22 });
      setPull({ x: 0, y: 0 });
      return;
    }

    setPhase("flying");
    const velocity = pullToVelocity(releasePull);
    const fullPath = simulateThrow(velocity);
    const waterIndex = fullPath.findIndex((p) => p.y < -WATER_DISTANCE);
    const reachedWater = waterIndex !== -1;
    const path = reachedWater ? fullPath.slice(0, waterIndex + 1) : fullPath;

    const xs = path.map((p) => p.x);
    const ys = path.map((p) => p.y);
    const rotations = path.map((p, i) => {
      const prev = path[Math.max(0, i - 1)];
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    });

    const duration = path.length * 0.03;

    animate(x, xs, { duration, ease: "linear" });
    animate(rotate, rotations, { duration, ease: "linear" });
    animate(y, ys, {
      duration,
      ease: "linear",
      onComplete: () => {
        if (reachedWater) {
          onReachedWater();
          return;
        }

        animate(x, 0, { type: "spring", stiffness: 130, damping: 11 });
        animate(y, 0, { type: "spring", stiffness: 130, damping: 9 });
        animate(rotate, 0, { type: "spring", stiffness: 130, damping: 10 });
        setPhase("ready");
        setPull({ x: 0, y: 0 });
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: BOTTLE_WIDTH, height: 245 }}>
        {previewPoints.map((p, i) => (
          <div
            key={i}
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white"
            style={{
              left: ORIGIN_X + p.x,
              top: ORIGIN_Y + p.y,
              opacity: Math.max(0, 0.55 - i / previewPoints.length),
            }}
          />
        ))}

        <motion.div
          drag={phase === "aiming"}
          dragConstraints={{
            left: -MAX_PULL_DISTANCE,
            right: MAX_PULL_DISTANCE,
            top: -8,
            bottom: MAX_PULL_DISTANCE,
          }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{ x, y, rotate, width: BOTTLE_WIDTH, position: "absolute", left: 0, bottom: 0 }}
          className={phase === "aiming" ? "cursor-grab touch-none active:cursor-grabbing" : ""}
          onDrag={() => setPull({ x: x.get(), y: Math.max(0, y.get()) })}
          onDragEnd={(_, info) =>
            launch({ x: info.offset.x, y: Math.max(0, info.offset.y) })
          }
        >
          <BottleDisplay
            contents="sealed"
            className="w-full"
            still={phase !== "ready"}
            alt={phase === "aiming" ? "Pull back and release to throw" : "Sealed bottle, ready to send"}
          />
        </motion.div>
      </div>

      {phase === "ready" && (
        <button
          onClick={() => setPhase("aiming")}
          className="rounded-lg border-2 border-[#134e4a] bg-[#2dd4bf] px-6 py-3 font-bold text-[#062e2a] shadow-[3px_3px_0_#134e4a] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Send Bottle to Ocean
        </button>
      )}
      {phase === "aiming" && <Instruction text="Pull back and release" />}
    </div>
  );
}
