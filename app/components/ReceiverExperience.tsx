"use client";

// Owns the receiver flow's state machine:
// approaching -> hauling -> landed -> uncorking -> extracting -> unrolling
// -> reading (or notFound if no message was retrieved).
// `message` is exactly what the server component fetched via the
// unmodified Supabase call in app/message/[id]/page.tsx — null means no
// row was found for this id, rendered in-world rather than as an error.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import IntroLogo from "./IntroLogo";
import BeachScene from "./BeachScene";
import BottleDisplay from "./BottleDisplay";
import DragToThreshold from "./DragToThreshold";
import UncorkPop from "./UncorkPop";
import UnrollPaper from "./UnrollPaper";
import Instruction from "./Instruction";
import { sprites } from "../../lib/sprites";

type Stage =
  | "approaching"
  | "hauling"
  | "landed"
  | "uncorking"
  | "extracting"
  | "unrolling"
  | "reading";

export default function ReceiverExperience({
  message,
}: {
  message: string | null;
}) {
  if (message === null) {
    return (
      <IntroLogo>
        <BeachScene>
          <NotFound />
        </BeachScene>
      </IntroLogo>
    );
  }

  return (
    <IntroLogo>
      <BeachScene>
        <ReceiverFlow message={message} />
      </BeachScene>
    </IntroLogo>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div style={{ width: 170 }}>
        <BottleDisplay contents="empty" className="w-full" alt="An empty, uncorked bottle" />
      </div>
      <p className="max-w-xs rounded-md bg-black/30 px-4 py-3 text-lg font-semibold text-white">
        This bottle is empty — the sea kept the message.
      </p>
      <Link
        href="/"
        className="rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-6 py-3 font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        Send Your Own Bottle
      </Link>
    </div>
  );
}

function ReceiverFlow({ message }: { message: string }) {
  const [stage, setStage] = useState<Stage>("approaching");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {stage === "approaching" && (
        <Approach onArrived={() => setStage("hauling")} />
      )}

      {stage === "hauling" && <Haul onLanded={() => setStage("landed")} />}

      {stage === "landed" && (
        <Landed onSettled={() => setStage("uncorking")} />
      )}

      {stage === "uncorking" && <Uncorking onPopped={() => setStage("extracting")} />}

      {stage === "extracting" && (
        <div className="relative" style={{ width: 190, height: 320 }}>
          <BottleDisplay
            contents="empty"
            className="absolute bottom-0 left-1/2 w-full -translate-x-1/2"
            alt="Bottle, uncorked"
          />
          <DragToThreshold
            spriteSrc={sprites.paperRoll.src}
            widthPx={80}
            style={{ left: "50%", marginLeft: -40, top: 90, rotate: "8deg" }}
            threshold={-90}
            label="Pull the message out"
            sound="paperRustle"
            onComplete={() => setStage("unrolling")}
          />
          <Instruction text="Pull the message out" />
        </div>
      )}

      {stage === "unrolling" && <UnrollPaper onDone={() => setStage("reading")} />}

      {stage === "reading" && <Reading message={message} />}
    </div>
  );
}

function Approach({ onArrived }: { onArrived: () => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      style={{ width: 150 }}
      initial={{ y: -180, scale: 0.3, opacity: 0.5 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{ duration: reducedMotion ? 0.5 : 3, ease: "easeOut" }}
      onAnimationComplete={onArrived}
    >
      <BottleDisplay contents="floating" className="w-full" floating alt="A bottle drifting toward shore" />
    </motion.div>
  );
}

function Haul({ onLanded }: { onLanded: () => void }) {
  const [settled, setSettled] = useState(false);
  const [wet, setWet] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        style={{ width: 150 }}
        drag
        dragElastic={0.35}
        dragTransition={{ power: 0.15, timeConstant: 260 }}
        dragMomentum={false}
        dragConstraints={{ left: -60, right: 60, top: -20, bottom: 140 }}
        onDrag={(_, info) => setWet(info.offset.y < 90)}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 && !settled) {
            setSettled(true);
            onLanded();
          }
        }}
        whileDrag={{ scale: 1.04 }}
        className="relative cursor-grab touch-none active:cursor-grabbing"
      >
        {wet &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white/70"
              animate={{ x: -10 - i * 6, y: [0, -6, 0], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        <BottleDisplay contents="floating" className="w-full" floating alt="Drag this bottle onto the beach" />
      </motion.div>
      <Instruction text="Drag the bottle onto the beach — it's heavier than it looks" />
    </div>
  );
}

function Landed({ onSettled }: { onSettled: () => void }) {
  useEffect(() => {
    const t = setTimeout(onSettled, 900);
    return () => clearTimeout(t);
  }, [onSettled]);

  return (
    <div className="relative" style={{ width: 170 }}>
      <motion.div
        initial={{ scaleY: 0.92, rotate: -3 }}
        animate={{ scaleY: [0.92, 1.04, 1], rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BottleDisplay contents="paper" className="w-full" still alt="Bottle, landed on the sand" />
      </motion.div>

      {Array.from({ length: 6 }).map((_, i) => {
        const left = 20 + i * 22;
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute top-[70%] h-1.5 w-1.5 rounded-full bg-[#8fd3ea]"
            style={{ left }}
            initial={{ y: 0, opacity: 0.9 }}
            animate={{ y: 60 + (i % 3) * 10, opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease: "easeIn" }}
          />
        );
      })}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.span
          key={`patch-${i}`}
          className="pointer-events-none absolute top-[92%] h-2 w-4 rounded-full bg-black/20 blur-[1px]"
          style={{ left: 16 + i * 32 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, delay: 0.6 + i * 0.1, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Uncorking({ onPopped }: { onPopped: () => void }) {
  const [tension, setTension] = useState(0);

  return (
    <div className="relative" style={{ width: 190, height: 320 }}>
      <motion.div
        className="absolute bottom-0 left-1/2 w-full -translate-x-1/2"
        animate={{ y: -tension * 5, rotate: tension * 3 }}
        transition={{ duration: 0.1 }}
      >
        <BottleDisplay
          contents="paper"
          className="w-full"
          still
          alt="Bottle with the cork still in"
        />
      </motion.div>
      <UncorkPop
        widthPx={64}
        style={{ left: "50%", marginLeft: -32, top: 60 }}
        onPopped={onPopped}
        onTension={setTension}
      />
      <Instruction text="Pull the cork out" />
    </div>
  );
}

function Reading({ message }: { message: string }) {
  const reducedMotion = useReducedMotion();
  const [revealedCount, setRevealedCount] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  const instant = skipped || reducedMotion;
  const shown = instant ? message : message.slice(0, revealedCount);
  const complete = shown.length >= message.length;

  useEffect(() => {
    if (instant) return;
    const charsPerTick = Math.max(1, Math.ceil(message.length / 160));
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        const next = c + charsPerTick;
        if (next >= message.length) clearInterval(interval);
        return next;
      });
    }, 28);
    return () => clearInterval(interval);
  }, [message, instant]);

  useEffect(() => {
    if (!complete) return;
    const t = setTimeout(() => setCtaVisible(true), 300);
    return () => clearTimeout(t);
  }, [complete]);

  return (
    <div className="relative w-[92vw] max-w-[520px]" onClick={() => setSkipped(true)}>
      <img
        src={sprites.vintagePaper.src}
        alt=""
        aria-hidden
        draggable={false}
        className="pixel-sprite w-full select-none"
      />

      <div
        className="absolute left-[15%] top-[16%] h-[64%] w-[70%] overflow-auto whitespace-pre-wrap text-lg leading-relaxed text-[#4a2f16] sm:text-xl"
        style={{ fontFamily: "'Segoe Print', 'Bradley Hand', cursive" }}
      >
        {shown}
      </div>

      {ctaVisible && (
        <motion.div
          className="mt-4 flex justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/"
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border-2 border-[#5c3a1e] bg-[#c98a3f] px-6 py-3 font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Send Your Own Bottle
          </Link>
        </motion.div>
      )}
    </div>
  );
}
