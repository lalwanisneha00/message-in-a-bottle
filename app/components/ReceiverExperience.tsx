"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import IntroLogo from "./IntroLogo";

interface ReceiverExperienceProps {
  message: string;
}

export default function ReceiverExperience({
  message,
}: ReceiverExperienceProps) {
  const [stage, setStage] = useState<
    "ocean" | "shore" | "uncork" | "extract" | "read"
  >("ocean");

  return (
    <IntroLogo>
    <div className="flex min-h-screen items-center justify-center">

      {/* STAGE 1 */}

      {stage === "ocean" && (
        <div className="text-center">

          <motion.img
            drag
            src="/sprites/bottlefloating.png"
            alt=""
            className="w-48 mx-auto cursor-grab"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            onDragEnd={() => {
              setStage("shore");
            }}
          />

          <p className="mt-6 text-xl text-white">
            Drag bottle to shore
          </p>

        </div>
      )}

      {/* STAGE 2 - UNCORK */}

      {stage === "shore" && (
        <div className="relative w-[260px] h-[420px]">

          <img
            src="/sprites/Bottlewithpaperroll.png"
            alt=""
            className="absolute inset-0 w-full"
          />

          <motion.img
            drag="y"
            dragElastic={0}
            dragMomentum={false}
            dragConstraints={{
              top: -300,
              bottom: 0,
            }}
            src="/sprites/Cork.png"
            alt=""
            className="
              absolute
              left-1/2
              -translate-x-1/2
              top-[-30px]
              w-18
              cursor-grab
              z-20
            "
            onDragEnd={(_, info) => {

              if (info.offset.y > 0) {
                return;
              }

              if (info.offset.y < -30) {
                setTimeout(() => {
                  setStage("uncork");
                }, 250);
              }
            }}
          />

          <p className="absolute -bottom-14 w-full text-center text-lg text-white">
            Pull the cork out
          </p>

        </div>
      )}

      {/* STAGE 3 - PULL MESSAGE */}

      {stage === "uncork" && (
        <div className="relative w-[260px] h-[420px]">

          <img
            src="/sprites/Emptybottle.png"
            alt=""
            className="absolute inset-0 w-full"
          />

          <motion.img
            drag="y"
            dragElastic={0}
            dragMomentum={false}
            dragConstraints={{
              top: -320,
              bottom: 0,
            }}
            src="/sprites/Paperroll.png"
            alt=""
            className="
              absolute
              left-1/2
              -translate-x-1/2
              top-[115px]
              w-32
              cursor-grab
              z-20
            "
            onDragEnd={(_, info) => {

              if (info.offset.y > 0) {
                return;
              }

              if (info.offset.y < -150) {
                setTimeout(() => {
                  setStage("extract");
                }, 250);
              }
            }}
          />

          <p className="absolute -bottom-14 w-full text-center text-lg text-white">
            Pull the message out
          </p>

        </div>
      )}

      {/* STAGE 4 - UNROLL */}

      {stage === "extract" && (
        <div className="text-center">

          <motion.img
            src="/sprites/Vintagepaper.png"
            alt=""
            className="w-[350px] md:w-[500px]"
            initial={{
              scaleX: 0.15,
              opacity: 0,
            }}
            animate={{
              scaleX: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
            }}
            onAnimationComplete={() => {
              setTimeout(() => {
                setStage("read");
              }, 300);
            }}
          />

        </div>
      )}

      {/* STAGE 5 - READ MESSAGE */}

      {stage === "read" && (
        <div className="relative">

          <img
            src="/sprites/Vintagepaper.png"
            alt=""
            className="w-[350px] md:w-[500px]"
          />

          <div
            className="
              absolute
              top-[16%]
              left-[22%]
              w-[62%]
              h-[60%]
              overflow-auto
              text-black
              text-lg
              whitespace-pre-wrap
              leading-relaxed
            "
          >
            {message}
          </div>

          <div className="text-center">

            <Link
              href="/"
              className="
                inline-block
                mt-8
                rounded-xl
                bg-blue-600
                px-6
                py-3
                text-white
              "
            >
              Send Your Own Bottle
            </Link>

          </div>

        </div>
      )}

    </div>
    </IntroLogo>
  );
}