"use client";

import { useEffect, useMemo, useState } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";

const seenGiftsKey = "codequest-seen-gifts";

export default function GiftNotificationHub() {
  const { player, petSay } = usePlayer();
  const [dismissedIds, setDismissedIds] = useState<string[]>(readSeenGifts);
  const activeGift = useMemo(() => (
    (player.giftNotifications ?? []).find((gift) => !dismissedIds.includes(gift.id)) ?? null
  ), [dismissedIds, player.giftNotifications]);

  useEffect(() => {
    if (activeGift) {
      petSay(`Voce recebeu ${activeGift.rewardName}!`);
    }
  }, [activeGift, petSay]);

  if (!activeGift) {
    return null;
  }

  function dismiss() {
    if (!activeGift) {
      return;
    }

    const nextIds = Array.from(new Set([...dismissedIds, activeGift.id]));

    setDismissedIds(nextIds);
    writeSeenGifts(nextIds);
  }

  return (
    <div className="fixed inset-x-4 bottom-5 z-[90] mx-auto max-w-md">
      <section className="cq-panel border-yellow-300/50 bg-[#120f05]/95 p-5 shadow-[0_0_34px_rgba(231,198,106,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="cq-kicker">Presente recebido</p>
            <h2 className="cq-title mt-2 text-2xl">{activeGift.rewardName}</h2>
            <p className="mt-3 text-sm leading-6 text-[#f3e3a5]">
              {activeGift.giftedBy} enviou este item para sua conta. Ele ja esta disponivel na loja.
            </p>
          </div>
          <span className="grid size-12 place-items-center rounded border border-yellow-300/40 bg-yellow-300/10 font-mono text-xl text-yellow-100">
            +
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/rewards" className="cq-button">
            Ver na loja
          </a>
          <button type="button" onClick={dismiss} className="cq-button cq-button-secondary">
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}

function readSeenGifts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(seenGiftsKey) ?? "[]");

    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeSeenGifts(ids: string[]) {
  localStorage.setItem(seenGiftsKey, JSON.stringify(ids.slice(-50)));
}
