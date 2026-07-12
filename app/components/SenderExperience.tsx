"use client";

import { useEffect, useState } from "react";

import IntroLogo from "./IntroLogo";
import BottleAssembly from "./BottleAssembly";
import BeachScene from "./scene/BeachScene";
import PaperEditor from "./PaperEditor";
import OceanThrow from "./OceanThrow";
import { supabase } from "../../lib/supabase";

export default function SenderExperience() {
  const [showIntro, setShowIntro] = useState(true);

  const [message, setMessage] =
    useState("");

const [generatedLink, setGeneratedLink] =
  useState("");

 const [stage, setStage] =
  useState<
    "write" |
    "rolled" |
    "assembly" |
    "ocean" |
    "link"
  >("write");
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);
  const saveMessage = async () => {
  const { data, error } =
    await supabase
      .from("messages")
      .insert([
        {
          message,
        },
      ])
      .select()
      .single();

  if (error) {
    console.error(error);
    return;
  }

  const link =
    `${window.location.origin}/message/${data.id}`;

  setGeneratedLink(link);

  setStage("link");
};

  if (showIntro) {
    return <IntroLogo />;
  }

  return (
    <BeachScene>

      <div className="flex min-h-screen items-center justify-center">

        {stage === "write" && (
          <PaperEditor
            onRoll={(msg) => {
              setMessage(msg);
              setStage("rolled");
            }}
          />
        )}

        {stage === "rolled" && (
  <div className="text-center">

    <img
      src="/paper-roll.png"
      className="mx-auto w-40"
    />

    <h2 className="mt-6 text-3xl text-white font-bold">
      Message Rolled
    </h2>

    <button
      onClick={() =>
        setStage("assembly")
      }
      className="
      mt-6
      rounded-xl
      bg-amber-600
      px-6
      py-3
      text-white
      "
    >
      Continue
    </button>

  </div>
)}

{stage === "assembly" && (
  <BottleAssembly
    onComplete={() => {
  setStage("ocean");
}}
  />
)}
{stage === "ocean" && (
  <OceanThrow
    onFinished={saveMessage}
  />
)}
{stage === "link" && (
  <div
    className="
    rounded-2xl
    bg-black/30
    backdrop-blur-md
    p-8
    text-center
    text-white
    "
  >
    <h2 className="text-3xl font-bold">
      Bottle Sent
    </h2>

    <p className="mt-4">
      Share this link:
    </p>

    <div
      className="
      mt-4
      rounded-xl
      bg-white/10
      p-4
      break-all
      "
    >
      {generatedLink}
    </div>

    <button
      className="
      mt-6
      rounded-xl
      bg-cyan-600
      px-6
      py-3
      "
      onClick={() =>
        navigator.clipboard.writeText(
          generatedLink
        )
      }
    >
      Copy Link
    </button>
  </div>
)}

      </div>

    </BeachScene>
  );
}