"use client";

import { motion } from "framer-motion";

export default function IntroLogo() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.img
        src="/logo.png"
        alt="Message In The Bottle"
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
  );
}