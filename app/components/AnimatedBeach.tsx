"use client";

import { motion } from "framer-motion";

export default function AnimatedBeach({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background */}

      <img
        src="/beach.png"
        alt="Beach"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Cloud 1 */}

<motion.div
  className="absolute top-10 left-[-150px]"
  animate={{
    x: [0, 1700],
  }}
  transition={{
    duration: 50,
    repeat: Infinity,
    ease: "linear",
  }}
>
  <div className="h-14 w-32 rounded-full bg-white/90 blur-sm" />
</motion.div>

{/* Cloud 2 */}

<motion.div
  className="absolute top-28 left-[-250px]"
  animate={{
    x: [0, 1900],
  }}
  transition={{
    duration: 65,
    repeat: Infinity,
    ease: "linear",
  }}
>
  <div className="h-20 w-44 rounded-full bg-white/80 blur-sm" />
</motion.div>

{/* Cloud 3 */}

<motion.div
  className="absolute top-48 left-[-350px]"
  animate={{
    x: [0, 2100],
  }}
  transition={{
    duration: 80,
    repeat: Infinity,
    ease: "linear",
  }}
>
  <div className="h-12 w-28 rounded-full bg-white/75 blur-sm" />
</motion.div>

      {/* Ocean shimmer */}

      <motion.div
        className="absolute bottom-[30%] left-0 h-6 w-full bg-white/10"
        animate={{
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Palm sway left */}

      <motion.div
        className="absolute left-[8%] top-[15%] h-[350px] w-[200px]"
        animate={{
          rotate: [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* Palm sway right */}

      <motion.div
        className="absolute right-[8%] top-[15%] h-[350px] w-[200px]"
        animate={{
          rotate: [1.5, -1.5, 1.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* Birds */}

     

      {/* Content */}

      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}