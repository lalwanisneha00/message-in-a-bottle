"use client";

// The vintage-paper writing surface. Holds the textarea, a live character
// counter near the limit, and the "Roll Message" action that hands the
// finished text back to SenderExperience.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sprites } from "../../lib/sprites";

const MAX_LENGTH = 2000;
const DRAFT_KEY = "mitb-draft-message";

export default function WritingPaper({
  initialValue,
  onRoll,
}: {
  initialValue: string;
  onRoll: (message: string) => void;
}) {
  const [message, setMessage] = useState(
    () =>
      (typeof window !== "undefined" && sessionStorage.getItem(DRAFT_KEY)) ||
      initialValue
  );
  const nearLimit = message.length > MAX_LENGTH * 0.9;

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, message);
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className="relative mx-auto w-[92vw] max-w-[520px]"
    >
      <img
        src={sprites.vintagePaper.src}
        alt=""
        aria-hidden
        draggable={false}
        className="pixel-sprite w-full select-none"
      />

      <textarea
        value={message}
        maxLength={MAX_LENGTH}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        aria-label="Your message"
        className="absolute left-[15%] top-[16%] h-[64%] w-[70%] resize-none bg-transparent text-lg leading-relaxed text-[#4a2f16] outline-none placeholder:text-[#8a6a45] sm:text-xl"
        style={{ fontFamily: "'Segoe Print', 'Bradley Hand', cursive" }}
      />

      {nearLimit && (
        <div className="absolute bottom-[10%] right-[16%] text-xs text-[#8a4a1f]">
          {message.length}/{MAX_LENGTH}
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => {
            if (!message.trim()) return;
            sessionStorage.removeItem(DRAFT_KEY);
            onRoll(message);
          }}
          disabled={!message.trim()}
          className="rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-6 py-3 font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Roll Message
        </button>
      </div>
    </motion.div>
  );
}
