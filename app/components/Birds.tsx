"use client";

// A handful of tiny V-shaped birds, drawn entirely in code (no sprite
// file) since none was supplied. Each bird flaps between a narrow and
// wide wingspan on its own randomized interval so the flock never reads
// as synchronized, and drifts across the sky on a slow looping path,
// alternating left-to-right and right-to-left tracks.

import { useEffect, useState } from "react";

interface BirdConfig {
  topPct: number;
  scale: number;
  durationS: number;
  delayS: number;
  reverse: boolean;
}

const BIRDS: BirdConfig[] = [
  { topPct: 9, scale: 1, durationS: 34, delayS: 0, reverse: false },
  { topPct: 16, scale: 0.75, durationS: 46, delayS: -14, reverse: false },
  { topPct: 6, scale: 0.6, durationS: 27, delayS: -20, reverse: true },
  { topPct: 22, scale: 0.85, durationS: 52, delayS: -33, reverse: false },
  { topPct: 13, scale: 0.65, durationS: 39, delayS: -9, reverse: true },
];

function Bird({ config }: { config: BirdConfig }) {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const flap = () => {
      if (!alive) return;
      setWide((w) => !w);
      timer = setTimeout(flap, 250 + Math.random() * 200);
    };

    timer = setTimeout(flap, Math.random() * 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${
        config.reverse ? "anim-bird-drift-rtl" : "anim-bird-drift-ltr"
      }`}
      style={{
        top: `${config.topPct}%`,
        left: 0,
        animationDuration: `${config.durationS}s`,
        animationDelay: `${config.delayS}s`,
      }}
    >
      <svg
        width={18 * config.scale}
        height={8 * config.scale}
        viewBox="0 0 18 8"
        fill="none"
      >
        <path
          d={wide ? "M0 6 Q9 -1 18 6" : "M0 5 Q9 2 18 5"}
          stroke="#2b4a5e"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          style={{ transition: "d 120ms ease-in-out" }}
        />
      </svg>
    </div>
  );
}

export default function Birds() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {BIRDS.map((config, i) => (
        <Bird key={i} config={config} />
      ))}
    </div>
  );
}
