"use client";

// Full-bleed, continuously-animated beach environment: layered sky, drifting
// clouds, a scrolling ocean band, and a sand layer scattered with props
// (palms, sandcastles, crabs, starfish). Renders behind whatever is passed
// as children. Used by both the sender and receiver experiences so the two
// flows always sit on the same living backdrop.

import { useState } from "react";
import { motion } from "framer-motion";
import { sprites } from "../../lib/sprites";
import { beachProps, cloudTracks } from "../../lib/beachProps";
import Birds from "./Birds";

function Clouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cloudTracks.map((cloud, i) => {
        const sprite = sprites[cloud.sprite];
        return (
          <img
            key={i}
            src={sprite.src}
            alt=""
            aria-hidden
            className="pixel-sprite anim-cloud-drift absolute"
            style={{
              top: `${cloud.topPct}%`,
              width: cloud.widthPx,
              animationDuration: `${cloud.durationS}s`,
              animationDelay: `${cloud.delayS}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function Ocean() {
  const ocean = sprites.ocean;
  const tileWidth = Math.round((ocean.width / ocean.height) * 140);

  return (
    <div className="absolute left-0 right-0 top-[30%] h-[16%] overflow-hidden">
      <motion.div
        className="flex h-full w-[200%]"
        animate={{ x: [0, -tileWidth] }}
        transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1].map((i) => (
          <img
            key={i}
            src={ocean.src}
            alt=""
            aria-hidden
            className="pixel-sprite h-full"
            style={{ width: tileWidth, objectFit: "cover" }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-x-0 top-1/3 h-6 bg-white/40 mix-blend-screen"
        animate={{ opacity: [0.15, 0.5, 0.15] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Starfish({
  leftPct,
  bottomPct,
  widthPx,
  flip,
}: {
  leftPct: number;
  bottomPct: number;
  widthPx: number;
  flip?: boolean;
}) {
  return (
    <img
      src={sprites.starfish.src}
      alt=""
      aria-hidden
      className="pixel-sprite anim-starfish-wobble absolute"
      style={{
        left: `${leftPct}%`,
        bottom: `${bottomPct}%`,
        width: widthPx,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    />
  );
}

function Crab({
  leftPct,
  bottomPct,
  widthPx,
  flip,
}: {
  leftPct: number;
  bottomPct: number;
  widthPx: number;
  flip?: boolean;
}) {
  const [repeatDelay] = useState(() => 4 + Math.random() * 8);

  return (
    <motion.img
      src={sprites.crab.src}
      alt=""
      aria-hidden
      className="pixel-sprite absolute"
      style={{
        left: `${leftPct}%`,
        bottom: `${bottomPct}%`,
        width: widthPx,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      animate={{ x: [0, 0, 14, 14, 0, 0] }}
      transition={{
        duration: 9,
        times: [0, 0.5, 0.58, 0.85, 0.93, 1],
        repeat: Infinity,
        repeatDelay,
        ease: "easeInOut",
      }}
    />
  );
}

function Sand() {
  const sand = sprites.sand;
  return (
    <div
      className="absolute left-0 right-0 bottom-0 top-[43%] overflow-hidden bg-[#e0a868]"
      style={{
        backgroundImage: `url(${sand.src})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center 58%",
        backgroundSize: "auto 650%",
      }}
    >
      {beachProps.map((prop, i) => {
        if (prop.sprite === "starfish") {
          return <Starfish key={i} {...prop} />;
        }
        if (prop.sprite === "crab") {
          return <Crab key={i} {...prop} />;
        }

        const sprite = sprites[prop.sprite];
        const isPalm = prop.sprite === "palmTree";

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${prop.leftPct}%`,
              bottom: `${prop.bottomPct}%`,
              width: prop.widthPx,
              transform: prop.flip ? "scaleX(-1)" : undefined,
              transformOrigin: "50% 100%",
            }}
          >
            <img
              src={sprite.src}
              alt=""
              aria-hidden
              className={`pixel-sprite w-full ${isPalm ? "anim-palm-sway" : ""}`}
              style={
                isPalm
                  ? {
                      transformOrigin: "50% 100%",
                      animationDuration: `${5 + (prop.swayDelay ?? 0)}s`,
                      animationDelay: `${prop.swayDelay ?? 0}s`,
                    }
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}

export default function BeachScene({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${sprites.sky.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Clouds />
      <Birds />
      <Ocean />
      <Sand />

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
