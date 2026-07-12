"use client";

// Splash gate: shows the Logo.png title card full-screen for 2 seconds on
// first mount, then fades it out to reveal `children`. Used at the top of
// both SenderExperience and ReceiverExperience so every fresh page load
// (sender or receiver) opens on the same title card.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sprites } from "../../lib/sprites";

const INTRO_DURATION_MS = 2000;

export default function IntroLogo({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), INTRO_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#4ebce6]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              src={sprites.logo.src}
              alt="Message In A Bottle"
              className="pixel-sprite h-full w-full object-cover sm:h-auto sm:w-full sm:max-w-2xl sm:object-contain"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
