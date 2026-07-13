"use client";

// Owns the sender flow's state machine:
// idle -> writing -> rolling -> inserting -> corking -> ready (aim + throw)
// -> drifting -> saving -> shared | error
// Each stage renders exactly one interactive element on top of the
// always-animating BeachScene, and the message survives a failed save
// (kept in state, never discarded) so retrying never loses the letter.

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import IntroLogo from "./IntroLogo";
import BeachScene from "./BeachScene";
import BottleDisplay from "./BottleDisplay";
import DragToThreshold from "./DragToThreshold";
import DragToTarget from "./DragToTarget";
import AimAndThrow from "./AimAndThrow";
import WritingPaper from "./WritingPaper";
import RollingPaper from "./RollingPaper";
import Instruction from "./Instruction";
import { sprites } from "../../lib/sprites";
import { supabase } from "../../lib/supabase";
import { playSfx, duckAmbient } from "../../lib/audio";
import { SHORE_ANCHOR_VH } from "../../lib/motion";

type Stage =
  | "idle"
  | "writing"
  | "rolling"
  | "inserting"
  | "corking"
  | "ready"
  | "drifting"
  | "saving"
  | "shared"
  | "error";

export default function SenderExperience() {
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const savePromiseRef = useRef<Promise<{ id: string } | null> | null>(null);

  const saveMessage = async () => {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ message }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    return data as { id: string };
  };

  const startDrift = () => {
    savePromiseRef.current = saveMessage();
    setStage("drifting");
  };

  const finishDrift = async () => {
    setStage("saving");
    const result = await savePromiseRef.current;
    if (!result) {
      setStage("error");
      return;
    }
    setGeneratedLink(`${window.location.origin}/message/${result.id}`);
    setStage("shared");
  };

  const retry = () => {
    savePromiseRef.current = saveMessage();
    setStage("saving");
    finishDrift();
  };

  const resetAll = () => {
    setMessage("");
    setGeneratedLink("");
    setStage("idle");
  };

  return (
    <IntroLogo>
      <BeachScene>
        <div className="flex min-h-screen items-center justify-center p-4">
          {stage === "idle" && (
            <button
              onClick={() => setStage("writing")}
              className="rounded-lg border-2 border-[#134e4a] bg-[#2dd4bf] px-8 py-4 text-lg font-bold text-[#062e2a] shadow-[3px_3px_0_#134e4a] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Send Your Message
            </button>
          )}

          {stage === "writing" && (
            <WritingPaper
              initialValue={message}
              onRoll={(msg) => {
                setMessage(msg);
                setStage("rolling");
              }}
            />
          )}

          {stage === "rolling" && (
            <div className="relative">
              <RollingPaper message={message} onDone={() => setStage("inserting")} />
              <Instruction text="Swipe the paper up to roll it" />
            </div>
          )}

          {stage === "inserting" && (
            <div
              className="relative"
              style={{
                width: 145,
                height: 245,
                transform: `translateY(${SHORE_ANCHOR_VH}vh)`,
              }}
            >
              <BottleDisplay
                contents="empty"
                className="absolute bottom-0 left-1/2 w-full -translate-x-1/2"
                alt="Empty bottle waiting for your message"
              />
              <DragToTarget
                spriteSrc={sprites.paperRoll.src}
                widthPx={60}
                restLeft={-55}
                restTop={115}
                rotate="20deg"
                targetLeft={43}
                targetTop={10}
                label="Drag the rolled message into the bottle"
                sound="paperRustle"
                onComplete={() => setStage("corking")}
              />
              <Instruction text="Drag the paper anywhere onto the bottle's mouth" />
            </div>
          )}

          {stage === "corking" && (
            <div
              className="relative"
              style={{
                width: 145,
                height: 245,
                transform: `translateY(${SHORE_ANCHOR_VH}vh)`,
              }}
            >
              <BottleDisplay
                contents="paper"
                className="absolute bottom-0 left-1/2 w-full -translate-x-1/2"
                alt="Bottle holding your message"
              />
              <DragToThreshold
                spriteSrc={sprites.cork.src}
                widthPx={48}
                style={{ left: "50%", marginLeft: -24, top: 46, rotate: "0deg" }}
                threshold={-60}
                label="Drag the cork onto the bottle"
                sound="corkSeat"
                onComplete={() => setStage("ready")}
              />
              <Instruction text="Drag the cork onto the bottle" />
            </div>
          )}

          {stage === "ready" && (
            <div style={{ transform: `translateY(${SHORE_ANCHOR_VH}vh)` }}>
              <AimAndThrow onReachedWater={startDrift} />
            </div>
          )}

          {stage === "drifting" && (
            <DriftToHorizon onDriftComplete={finishDrift} />
          )}

          {stage === "saving" && (
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-white"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
              <p className="font-semibold">Sending your bottle out to sea...</p>
            </div>
          )}

          {stage === "shared" && (
            <ShareCard
              link={generatedLink}
              copied={copied}
              onCopy={() => {
                navigator.clipboard?.writeText(generatedLink).then(
                  () => setCopied(true),
                  () => {}
                );
                setTimeout(() => setCopied(false), 2000);
              }}
              onShare={
                typeof navigator !== "undefined" && "share" in navigator
                  ? () =>
                      navigator.share({
                        title: "Message in a Bottle",
                        text: "Someone sent you a message in a bottle.",
                        url: generatedLink,
                      })
                  : undefined
              }
              onReset={resetAll}
            />
          )}

          {stage === "error" && (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-black/40 p-8 text-center text-white">
              <h2 className="text-2xl font-bold">The tide brought it back</h2>
              <p className="max-w-xs text-white/80">
                Your message is safe. Let&apos;s try sending it again.
              </p>
              <button
                onClick={retry}
                className="rounded-lg border-2 border-[#134e4a] bg-[#2dd4bf] px-6 py-3 font-bold text-[#062e2a] shadow-[3px_3px_0_#134e4a]"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </BeachScene>
    </IntroLogo>
  );
}

function DriftToHorizon({ onDriftComplete }: { onDriftComplete: () => void }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    playSfx("splash");
    duckAmbient();
  }, []);

  return (
    <div className="relative flex h-[60vh] w-full items-end justify-center">
      {/* splash: a burst of droplets and expanding rings where the bottle hit the water */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute bottom-16 h-1.5 w-1.5 rounded-full bg-white/90"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * 46,
              y: -Math.abs(Math.sin(angle)) * 40 - 10,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        );
      })}
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute bottom-16 rounded-full border-2 border-white/70"
          initial={{ width: 10, height: 10, opacity: 0.7 }}
          animate={{ width: 90, height: 90, opacity: 0 }}
          transition={{ duration: 0.9, delay: i * 0.15, ease: "easeOut" }}
        />
      ))}

      <motion.div
        style={{ width: 120 }}
        initial={{ y: -40, scale: 1, opacity: 1 }}
        animate={{ y: -260, scale: 0.35, opacity: 0.5 }}
        transition={{ duration: reducedMotion ? 0.6 : 3.4, ease: "easeOut" }}
        onAnimationComplete={onDriftComplete}
      >
        <BottleDisplay contents="floating" className="w-full" floating alt="" />
      </motion.div>
    </div>
  );
}

function ShareCard({
  link,
  copied,
  onCopy,
  onShare,
  onReset,
}: {
  link: string;
  copied: boolean;
  onCopy: () => void;
  onShare?: () => void;
  onReset: () => void;
}) {
  return (
    <div className="w-[92vw] max-w-md rounded-2xl border-4 border-[#5c3a1e] bg-[#c98a3f] p-6 text-center shadow-[6px_6px_0_rgba(0,0,0,0.3)]">
      <h2 className="text-2xl font-bold text-[#3a2410]">Bottle Sent!</h2>
      <p className="mt-2 text-[#4a2f16]">Share this link:</p>

      <div className="mt-3 break-all rounded-lg bg-[#3a2410]/10 p-3 text-sm text-[#3a2410]">
        {link}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={onCopy}
          className="rounded-lg border-2 border-[#134e4a] bg-[#2dd4bf] px-5 py-2 font-bold text-[#062e2a] shadow-[3px_3px_0_#134e4a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="rounded-lg border-2 border-[#5c3a1e] bg-[#e8c48a] px-5 py-2 font-bold text-[#3a2410] shadow-[3px_3px_0_#5c3a1e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Share
          </button>
        )}
      </div>

      <button
        onClick={onReset}
        className="mt-4 text-sm font-semibold text-[#3a2410] underline"
      >
        Write another
      </button>
    </div>
  );
}
