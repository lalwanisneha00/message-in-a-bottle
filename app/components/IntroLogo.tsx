"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              src="/sprites/Logo.png"
              alt="Message In A Bottle"
              className="w-[280px] md:w-[420px]"
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1.2,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
