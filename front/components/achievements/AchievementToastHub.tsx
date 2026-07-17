"use client";

import { useEffect, useState } from "react";

import { Achievement } from "@/domain/entities/achievement";

type Toast = Achievement & {
  toastId: string;
};

export default function AchievementToastHub() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handleAchievement(event: Event) {
      const achievement = event instanceof CustomEvent
        ? event.detail?.achievement as Achievement | undefined
        : undefined;

      if (!achievement) {
        return;
      }

      const toast: Toast = {
        ...achievement,
        toastId: crypto.randomUUID(),
      };

      setToasts((current) => [toast, ...current].slice(0, 3));
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.toastId !== toast.toastId));
      }, 5200);
    }

    window.addEventListener("codequest-achievement-unlocked", handleAchievement);

    return () => {
      window.removeEventListener("codequest-achievement-unlocked", handleAchievement);
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[80] grid w-[min(24rem,calc(100vw-2rem))] gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.toastId}
          className="animate-cq-achievement-pop border border-[#74f0a7]/60 bg-[#07101d]/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center border border-[#74f0a7]/70 bg-[#10203a] font-mono text-sm font-black text-[#dfffe9] shadow-[inset_0_0_0_2px_rgba(116,240,167,0.12)]">
              {toast.icon}
            </div>
            <div>
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#74f0a7]">
                Conquista desbloqueada
              </p>
              <h2 className="cq-title mt-1 text-lg">{toast.title}</h2>
              <p className="mt-1 text-xs leading-5 text-[#c8d3e3]">
                {toast.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
