"use client";

import { useEffect, useState } from "react";
import { isMuted, setMuted, subscribeMuted } from "../lib/audio";

export function useMuted(): [boolean, () => void] {
  const [muted, setMutedState] = useState(isMuted);

  useEffect(() => subscribeMuted(setMutedState), []);

  return [muted, () => setMuted(!isMuted())];
}
