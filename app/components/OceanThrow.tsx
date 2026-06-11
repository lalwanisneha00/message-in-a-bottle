"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface OceanThrowProps {
  onFinished: () => Promise<void>;
}

export default function OceanThrow({
  onFinished,
}: OceanThrowProps) {
  const [throwing, setThrowing] =
    useState(false);

  const handleThrow = async () => {
    setThrowing(true);

    setTimeout(async () => {
      await onFinished();
    }, 2500);
  };

  return (
    <div className="relative flex flex-col items-center justify-center">

      <h2 className="mb-6 text-3xl font-bold text-white">
        Send It To Sea
      </h2>

      <div className="relative w-full max-w-4xl h-[400px]">

        {/* Ocean */}

        <div
  className="
  absolute
  bottom-0
  h-[55%]
  w-full
  bg-cyan-500/20
  rounded-t-[100px]
  "
/>

        <motion.img
          src="/bottle-final.png"
          alt=""
          className="
absolute
bottom-16
left-1/2
-translate-x-1/2
w-40
cursor-pointer
"
          animate={
  throwing
    ? {
        x: [0, -20, 15, -10, 0],
        y: -280,
        scale: 0.08,
        opacity: 0,
        rotate: [-5, 5, -3, 3, 0],
      }
              : {
                  y: [0, -8, 0],
                }
          }
          transition={{
            duration: throwing ? 2.5 : 3,
            repeat: throwing
              ? 0
              : Infinity,
          }}
          onClick={() => {
            if (!throwing)
              handleThrow();
          }}
        />

      </div>

      {!throwing && (
        <p className="mt-6 text-white">
          Click the bottle to throw it
        </p>
      )}

      {throwing && (
        <p className="mt-6 text-cyan-200">
          Your bottle is drifting away...
        </p>
      )}
    </div>
  );
}