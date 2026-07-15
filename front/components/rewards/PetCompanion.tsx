"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { usePlayer } from "@/application/hooks/usePlayer";
import { rewardItems } from "@/data/rewards";

export default function PetCompanion() {
  const { player } = usePlayer();
  const [celebrating, setCelebrating] = useState(false);
  const [speech, setSpeech] = useState("");
  const pet = useMemo(() => (
    rewardItems.find((item) => item.id === player.inventory.equippedPetId)
  ), [player.inventory.equippedPetId]);

  useEffect(() => {
    let timeoutId: number | undefined;

    function showSpeech(message: string, duration = 3200) {
      window.clearTimeout(timeoutId);
      setSpeech(message);
      timeoutId = window.setTimeout(() => setSpeech(""), duration);
    }

    function celebrate() {
      setCelebrating(true);
      showSpeech("Parabens!", 1800);
      window.setTimeout(() => setCelebrating(false), 1400);
    }

    function say(event: Event) {
      const message = event instanceof CustomEvent
        ? String(event.detail?.message ?? "")
        : "";

      if (message) {
        showSpeech(message);
      }
    }

    window.addEventListener("codequest-pet-celebrate", celebrate);
    window.addEventListener("codequest-pet-say", say);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("codequest-pet-celebrate", celebrate);
      window.removeEventListener("codequest-pet-say", say);
    };
  }, []);

  if (!pet) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 hidden md:block">
      <div className="relative flex min-h-36 min-w-44 items-end justify-end">
        {speech && (
          <div className="cq-speech-bubble animate-cq-bubble absolute bottom-24 right-16">
            {speech}
          </div>
        )}

        <div
          className={[
            "relative grid size-24 place-items-center transition-transform",
            celebrating ? "animate-cq-pet-celebrate" : "animate-cq-pet-idle",
          ].join(" ")}
        >
          <div className="absolute inset-x-5 bottom-1 h-3 rounded-full bg-black/35 blur-sm" />
          <div className="relative size-24">
            {pet.imageSrc ? (
              <Image
                src={pet.imageSrc}
                alt={pet.name}
                fill
                sizes="96px"
                className="object-contain drop-shadow-[0_8px_0_rgba(0,0,0,0.25)]"
                priority={false}
              />
            ) : (
              <span className="cq-pixel-icon size-16 text-base">
                {pet.sprite}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
