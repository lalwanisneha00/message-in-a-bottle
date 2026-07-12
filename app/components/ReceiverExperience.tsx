"use client";

// Owns the receiver flow's state machine:
// approaching -> hauling -> landed -> uncorking -> extracting -> unrolling
// -> reading (or notFound if no message was retrieved).
// `message` is exactly what the server component fetched via the
// unmodified Supabase call in app/message/[id]/page.tsx — null means no
// row was found for this id, rendered in-world rather than as an error.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import IntroLogo from "./IntroLogo";
import BeachScene from "./BeachScene";
import BottleDisplay from "./BottleDisplay";
import DragToThreshold from "./DragToThreshold";
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

      {stage === "uncorking" && (
        <div className="relative" style={{ width: 190, height: 320 }}>
          <BottleDisplay
            contents="paper"
            className="absolute bottom-0 left-1/2 w-full -translate-x-1/2"
            alt="Bottle with the cork still in"
          />
          <DragToThreshold
            spriteSrc={sprites.cork.src}
            widthPx={64}
            style={{ left: "50%", marginLeft: -32, top: 60 }}
            threshold={-70}
            label="Pull the cork out"
            onComplete={() => setStage("extracting")}
          />
          <Instruction text="Pull the cork out" />
        </div>
      )}

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
            onComplete={() => setStage("unrolling")}
          />
          <Instruction text="Pull the message out" />
        </div>
      )}

      {stage === "unrolling" && (
        <UnrollTransition onDone={() => setStage("reading")} />
      )}

      {stage === "reading" && <Reading message={message} />}
    </div>
  );
}

function Approach({ onArrived }: { onArrived: () => void }) {
  return (
    <motion.div
      style={{ width: 150 }}
      initial={{ y: -180, scale: 0.3, opacity: 0.5 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{ duration: 3, ease: "easeOut" }}
      onAnimationComplete={onArrived}
    >
      <BottleDisplay contents="floating" className="w-full" floating alt="A bottle drifting toward shore" />
    </motion.div>
  );
}

function Haul({ onLanded }: { onLanded: () => void }) {
  const [settled, setSettled] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        style={{ width: 150 }}
        drag
        dragElastic={0.15}
        dragMomentum={false}
        dragConstraints={{ left: -60, right: 60, top: -20, bottom: 140 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 && !settled) {
            setSettled(true);
            onLanded();
          }
        }}
        whileDrag={{ scale: 1.05 }}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <BottleDisplay contents="floating" className="w-full" floating alt="Drag this bottle onto the beach" />
      </motion.div>
      <Instruction text="Drag the bottle onto the beach" />
    </div>
  );
}

function Landed({ onSettled }: { onSettled: () => void }) {
  useEffect(() => {
    const t = setTimeout(onSettled, 650);
    return () => clearTimeout(t);
  }, [onSettled]);

  return (
    <motion.div
      style={{ width: 170 }}
      initial={{ scaleY: 0.92, rotate: -3 }}
      animate={{ scaleY: [0.92, 1.04, 1], rotate: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BottleDisplay contents="paper" className="w-full" still alt="Bottle, landed on the sand" />
    </motion.div>
  );
}

function UnrollTransition({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.img
      src={sprites.vintagePaper.src}
      alt=""
      aria-hidden
      className="pixel-sprite w-[90vw] max-w-[480px]"
      initial={{ opacity: 0, scaleY: 0.2 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ transformOrigin: "top" }}
    />
  );
}

function Reading({ message }: { message: string }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  const shown = skipped ? message : message.slice(0, revealedCount);
  const complete = shown.length >= message.length;

  useEffect(() => {
    if (skipped) return;
    const charsPerTick = Math.max(1, Math.ceil(message.length / 160));
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        const next = c + charsPerTick;
        if (next >= message.length) clearInterval(interval);
        return next;
      });
    }, 28);
    return () => clearInterval(interval);
  }, [message, skipped]);

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
