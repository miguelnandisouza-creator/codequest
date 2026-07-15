"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Props = {
  title: string;
  content: string;
  onComplete: () => void;
  completeLabel: string;
};

export default function PixelMentor({
  title,
  content,
  onComplete,
  completeLabel,
}: Props) {
  const lines = useMemo(() => splitDialog(content), [content]);
  const [lineIndex, setLineIndex] = useState(0);
  const currentLine = lines[lineIndex];
  const isLastLine = lineIndex === lines.length - 1;

  const advance = useCallback(() => {
    if (!isLastLine) {
      setLineIndex((current) => current + 1);
      return;
    }

    onComplete();
  }, [isLastLine, onComplete]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        event.preventDefault();
        advance();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [advance]);

  return (
    <div className="cq-card p-4 md:p-5">
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="shrink-0 md:w-36">
          <div className="relative mx-auto aspect-square w-28 overflow-hidden rounded-md border border-[#5b8cff]/40 bg-[#0b1322] md:w-36">
            <Image
              src="/assets/characters/byte-wizard.png"
              alt="Byte, mentor do CodeQuest"
              fill
              sizes="144px"
              className="object-cover object-top"
              priority
            />
          </div>

          <p className="cq-kicker mt-2 text-center">
            Byte
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="cq-title text-2xl">{title}</h2>

            <span className="cq-badge">
              Narracao
            </span>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={advance}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                advance();
              }
            }}
            className="mt-4 min-h-36 cursor-pointer rounded-md border border-[#26384f] bg-[#0d1422] p-5 text-lg leading-8 text-[#dbe8ff] outline-none transition hover:border-[#5b8cff] focus:border-[#5b8cff]"
          >
            <p>{currentLine}</p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 font-mono text-sm text-[#93a4bd]">
              <span>
                Fala {lineIndex + 1} de {lines.length}
              </span>

              <span>
                {isLastLine ? completeLabel : "Enter para continuar"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function splitDialog(content: string) {
  const lines = content
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : [content];
}
