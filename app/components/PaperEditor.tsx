"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaperEditorProps {
  onRoll: (message: string) => void;
}

export default function PaperEditor({
  onRoll,
}: PaperEditorProps) {
  const [message, setMessage] = useState("");
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    if (!message.trim()) return;

    setRolling(true);

    setTimeout(() => {
      onRoll(message);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center">

      <AnimatePresence>

        {!rolling ? (
          <motion.div
            key="paper"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              scaleX: 0.15,
              scaleY: 0.7,
              rotate: 12,
              opacity: 0,
            }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <img
              src="/old-paper.png"
              alt="Paper"
              className="w-[320px] md:w-[450px] pointer-events-none"
            />

            <textarea
  value={message}
  onChange={(e) =>
    setMessage(e.target.value)
  }
  placeholder="Write your message..."
  className="
  absolute
  top-[18%]
  left-[22%]
  w-[68%]
  h-[60%]
  resize-none
  bg-transparent
  outline-none
  text-black
  text-xl
  font-serif
  leading-relaxed
  "
/>

          </motion.div>
        ) : (
          <motion.img
            key="roll"
            src="/paper-roll.png"
            alt="Paper Roll"
            className="w-40"
            initial={{
              opacity: 0,
              scale: 0.4,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
          />
        )}

      </AnimatePresence>

      {!rolling && (
        <button
          onClick={handleRoll}
          className="
          mt-6
          rounded-xl
          bg-amber-600
          px-6
          py-3
          text-white
          font-semibold
          hover:bg-amber-700
          "
        >
          Roll Message
        </button>
      )}
    </div>
  );
}