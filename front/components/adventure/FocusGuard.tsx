"use client";

import { useEffect, useMemo, useState } from "react";

type GuardEvent = {
  reason: "tab-hidden" | "window-blur" | "paste";
  at: string;
};

type Props = {
  active: boolean;
  stageTitle: string;
};

const reasonLabels: Record<GuardEvent["reason"], string> = {
  "tab-hidden": "a aba da missao ficou em segundo plano",
  "window-blur": "a janela perdeu o foco durante a missao",
  paste: "houve tentativa de colar texto na resposta",
};

export default function FocusGuard({ active, stageTitle }: Props) {
  const [events, setEvents] = useState<GuardEvent[]>([]);
  const [lockedEvent, setLockedEvent] = useState<GuardEvent | null>(null);
  const lastEvent = lockedEvent ?? events[0];
  const lockTitle = useMemo(() => {
    if (!lastEvent) {
      return "Modo foco ativo";
    }

    if (lastEvent.reason === "paste") {
      return "Colagem bloqueada";
    }

    return "Missao pausada";
  }, [lastEvent]);

  useEffect(() => {
    if (!active) {
      queueMicrotask(() => setLockedEvent(null));
      return;
    }

    function lock(reason: GuardEvent["reason"]) {
      const event = {
        reason,
        at: new Date().toISOString(),
      };

      setEvents((current) => [event, ...current].slice(0, 10));
      setLockedEvent(event);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        lock("tab-hidden");
      }
    }

    function handleWindowBlur() {
      window.setTimeout(() => {
        if (document.visibilityState === "visible" && !document.hasFocus()) {
          lock("window-blur");
        }
      }, 150);
    }

    function handlePaste(event: ClipboardEvent) {
      event.preventDefault();
      lock("paste");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("paste", handlePaste, true);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("paste", handlePaste, true);
    };
  }, [active]);

  if (!active || !lockedEvent) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 px-4 py-8">
      <section className="cq-panel w-full max-w-xl border-red-300/55 bg-[#12070a]/95 p-6 shadow-[0_0_45px_rgba(239,68,68,0.22)]">
        <p className="cq-kicker text-red-100">Modo foco</p>
        <h2 className="cq-title mt-3 text-3xl">{lockTitle}</h2>
        <p className="mt-4 leading-7 text-[#f4c7c7]">
          A fase foi pausada porque {reasonLabels[lockedEvent.reason]}. Para manter a atividade justa,
          resolva a missao sem alternar para outras abas, janelas ou ferramentas de IA.
        </p>

        <div className="mt-5 rounded border border-red-300/35 bg-red-500/10 p-4 text-sm text-red-100">
          <p className="font-mono text-xs font-black uppercase tracking-[0.12em]">
            Missao
          </p>
          <p className="mt-2">{stageTitle}</p>
          <p className="mt-3 font-mono text-xs">
            Alertas nesta sessao: {events.length}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setLockedEvent(null)}
            className="cq-button"
          >
            Entendi, voltar para a missao
          </button>
          <a href="/review" className="cq-button cq-button-secondary">
            Revisar antes
          </a>
        </div>
      </section>
    </div>
  );
}
