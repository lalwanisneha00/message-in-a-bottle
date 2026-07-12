"use client";

// A single always-visible instruction line, announced to screen readers
// as it changes so each new step of either flow gets spoken aloud.

export default function Instruction({ text }: { text: string }) {
  return (
    <p
      aria-live="polite"
      className="absolute -bottom-12 left-1/2 w-max -translate-x-1/2 rounded-md bg-black/30 px-4 py-2 text-center text-white"
    >
      {text}
    </p>
  );
}
