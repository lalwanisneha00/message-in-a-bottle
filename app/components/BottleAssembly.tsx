"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface BottleAssemblyProps {
  onComplete: () => void;
}

export default function BottleAssembly({
  onComplete,
}: BottleAssemblyProps) {
  const [paperInserted, setPaperInserted] =
    useState(false);

  const [corkPlaced, setCorkPlaced] =
    useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-10">

      <h2 className="text-3xl font-bold text-white drop-shadow-lg">
        Build Your Bottle
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-12">

        {/* PAPER */}

        {!paperInserted && (
          <motion.img
            drag
            dragSnapToOrigin={false}
            whileDrag={{ scale: 1.1 }}
            src="/paper-roll.png"
            alt=""
            className="w-28 cursor-grab"
            onDragEnd={() => {
              setPaperInserted(true);
            }}
          />
        )}

        {/* BOTTLE */}

       <motion.img
  src={
    corkPlaced
      ? "/bottle-final.png"
      : paperInserted
      ? "/bottle-paper.png"
      : "/bottle-empty.png"
  }
  alt=""
  className="w-48 md:w-60"
  animate={{
    y: [0, -8, 0],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
  }}
/>

        {/* CORK */}

        {paperInserted && !corkPlaced && (
          <motion.img
            drag
            dragSnapToOrigin={false}
            whileDrag={{ scale: 1.1 }}
            src="/cork.png"
            alt=""
            className="w-20 cursor-grab"
            onDragEnd={() => {
              setCorkPlaced(true);
            }}
          />
        )}
      </div>

      {/* STATUS */}

      {!paperInserted && (
        <p className="text-white text-lg">
          Drag the rolled paper into the bottle
        </p>
      )}

      {paperInserted && !corkPlaced && (
        <p className="text-white text-lg">
          Drag the cork onto the bottle
        </p>
      )}

     {paperInserted && corkPlaced && (
  <div className="flex flex-col items-center">

    <p className="mt-4 text-green-300 text-xl">
      Bottle Sealed
    </p>

    <button
      onClick={onComplete}
      className="
      mt-6
      rounded-xl
      bg-emerald-600
      px-6
      py-3
      text-white
      font-semibold
      hover:bg-emerald-700
      "
    >
      Send To Ocean →
    </button>

  </div>
)}
    </div>
  );
}