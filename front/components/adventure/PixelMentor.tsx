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
    <div className="rounded-xl border border-blue-500/20 bg-zinc-950 p-4 shadow-2xl md:p-5">
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="shrink-0 md:w-36">
          <div className="relative mx-auto aspect-square w-28 overflow-hidden rounded-lg border border-blue-500/40 bg-blue-950/30 shadow-[0_0_30px_rgba(59,130,246,0.22)] md:w-36">
            <Image
              src="/assets/characters/byte-wizard.png"
              alt="Byte, mentor do CodeQuest"
              fill
              sizes="144px"
              className="object-cover object-top"
              priority
            />
          </div>

          <p className="mt-2 text-center text-xs font-semibold uppercase text-blue-300">
            Byte
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold">{title}</h2>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
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
            className="mt-4 min-h-36 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900 p-5 text-lg leading-8 text-zinc-200 outline-none transition hover:border-blue-500 focus:border-blue-500"
          >
            <p>{currentLine}</p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-500">
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
