"use client";

import Image from "next/image";

import { Stage } from "@/domain/entities/stage";

type Props = {
  stage: Stage;
  resolved: boolean;
  state?: "playing" | "locked" | "completed";
};

type Scene = {
  image: string;
  accent: string;
  position: string;
};

type SceneMoment = {
  label: string;
  solvedLabel: string;
  aura: string;
};

const scenes: Record<string, Scene> = {
  "sql-chapter-1": {
    image: "/assets/scenes/sql-village.png",
    accent: "text-amber-200",
    position: "center center",
  },
  "sql-chapter-2": {
    image: "/assets/scenes/sql-city.png",
    accent: "text-cyan-200",
    position: "center center",
  },
  "sql-chapter-3": {
    image: "/assets/scenes/sql-market.png",
    accent: "text-orange-200",
    position: "center center",
  },
  "sql-chapter-4": {
    image: "/assets/scenes/sql-castle-stats.png",
    accent: "text-teal-200",
    position: "center center",
  },
  "sql-chapter-5": {
    image: "/assets/scenes/sql-relations-fortress.png",
    accent: "text-orange-200",
    position: "center center",
  },
};

export default function PixelScene({
  stage,
  resolved,
  state = "playing",
}: Props) {
  const scene = scenes[stage.chapterId] ?? scenes["sql-chapter-1"];
  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const effect = getSceneEffect(stage);
  const moment = getSceneMoment(stage, effect);
  const shouldAnimate = resolved && !isLocked;

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
      <div className="relative min-h-[420px] overflow-hidden md:min-h-[520px]">
        <Image
          src={scene.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 1120px"
          className={[
            "object-cover transition duration-700",
            isLocked ? "grayscale" : "",
            resolved || isCompleted ? "scale-100 brightness-110" : "scale-[1.02] brightness-75",
          ].join(" ")}
          style={{ objectPosition: scene.position }}
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        <div
          className={[
            "absolute inset-0 opacity-0 transition duration-700",
            moment.aura,
            resolved || isCompleted ? "opacity-100" : "",
          ].join(" ")}
        />

        <StoryEffect
          effect={effect}
          active={shouldAnimate}
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
          <div className="max-w-xl rounded-lg border border-white/10 bg-black/45 px-4 py-3 shadow-xl backdrop-blur-sm">
            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${scene.accent}`}>
              {isLocked
                ? "Caminho bloqueado"
                : resolved || isCompleted
                  ? "Mundo alterado"
                  : "Cenario ativo"}
            </p>
            <p className="mt-2 text-sm text-zinc-200">
              {isLocked
                ? "Conclua as fases anteriores para despertar esta area."
                : resolved || isCompleted
                  ? moment.solvedLabel
                  : moment.label}
            </p>
          </div>

          <div className="hidden rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-right backdrop-blur-sm md:block">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
              {stage.type}
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">
              {stage.reward.xp} XP / {stage.reward.coins} moedas
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/55 p-4 shadow-2xl backdrop-blur-md md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                {stage.chapterId.replace("sql-chapter-", "Modulo ")}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                {stage.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
                {stage.description}
              </p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10 md:w-56">
              <div
                className={[
                  "h-full rounded-full transition-all duration-700",
                  resolved || isCompleted ? "w-full bg-green-400" : "w-1/3 bg-blue-400",
                ].join(" ")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type StoryEffectName =
  | "welcome"
  | "table"
  | "lanterns"
  | "columns"
  | "star"
  | "limit"
  | "boss"
  | "filter"
  | "logic"
  | "shortcuts"
  | "balance"
  | "order"
  | "desc"
  | "pagination"
  | "aggregate"
  | "group"
  | "having"
  | "join"
  | "leftJoin"
  | "subquery"
  | "final";

function getSceneEffect(stage: Stage): StoryEffectName {
  const id = stage.id;

  if (id.includes("welcome")) return "welcome";
  if (id.includes("tables") || id.includes("database-map") || id.includes("result-grid")) return "table";
  if (id.includes("query-shape")) return "star";
  if (id.includes("select-all")) return "lanterns";
  if (id.includes("columns")) return "columns";
  if (id.includes("star")) return "star";
  if (id.includes("limit")) return "limit";
  if (id.includes("boss")) return stage.chapterId === "sql-chapter-5" ? "final" : "boss";
  if (id.includes("filter") || id.includes("comparison")) return "filter";
  if (id.includes("logic") || id.includes("combined")) return "logic";
  if (id.includes("shortcuts")) return "shortcuts";
  if (id.includes("between")) return "balance";
  if (id.includes("order")) return "order";
  if (id.includes("desc")) return "desc";
  if (id.includes("pagination")) return "pagination";
  if (id.includes("aggregate") || id.includes("functions")) return "aggregate";
  if (id.includes("group")) return "group";
  if (id.includes("having")) return "having";
  if (id.includes("left-join")) return "leftJoin";
  if (id.includes("join")) return "join";
  if (id.includes("subquery")) return "subquery";
  if (id.includes("relations")) return "join";

  return "welcome";
}

function getSceneMoment(
  stage: Stage,
  effect: StoryEffectName
): SceneMoment {
  if (stage.id.includes("database-map")) {
    return {
      label: "Byte abriu o mapa da lojinha: banco, tabelas, colunas e linhas.",
      solvedLabel: "O mapa ficou claro: o banco guarda tabelas organizadas.",
      aura: "bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.24),transparent_18%),radial-gradient(circle_at_55%_44%,rgba(96,165,250,0.18),transparent_24%)]",
    };
  }

  if (stage.id.includes("result-grid")) {
    return {
      label: "A janela de resultado ainda precisa ser interpretada com calma.",
      solvedLabel: "A grade foi lida corretamente: colunas no topo, registros nas linhas.",
      aura: "bg-[radial-gradient(circle_at_34%_42%,rgba(34,211,238,0.26),transparent_18%),radial-gradient(circle_at_44%_52%,rgba(20,184,166,0.16),transparent_20%)]",
    };
  }

  if (stage.id.includes("query-shape")) {
    return {
      label: "A primeira frase SQL aparece dividida entre SELECT e FROM.",
      solvedLabel: "A frase encaixou: SELECT escolhe colunas, FROM escolhe a tabela.",
      aura: "bg-[radial-gradient(circle_at_50%_44%,rgba(251,191,36,0.24),transparent_18%),radial-gradient(circle_at_39%_49%,rgba(96,165,250,0.16),transparent_18%)]",
    };
  }

  if (effect === "table") {
    return {
      label: "O mural da vila mostra registros soltos esperando organizacao.",
      solvedLabel: "O mural revelou a tabela clientes com linhas e colunas.",
      aura: "bg-[radial-gradient(circle_at_28%_39%,rgba(34,211,238,0.30),transparent_18%),radial-gradient(circle_at_43%_42%,rgba(14,165,233,0.18),transparent_20%)]",
    };
  }

  if (effect === "lanterns") {
    return {
      label: "As lanternas da vila aguardam o primeiro SELECT completo.",
      solvedLabel: "As lanternas acenderam quando a consulta trouxe todos os clientes.",
      aura: "bg-[radial-gradient(circle_at_25%_63%,rgba(253,224,71,0.38),transparent_11%),radial-gradient(circle_at_84%_58%,rgba(253,224,71,0.34),transparent_12%),radial-gradient(circle_at_51%_56%,rgba(253,224,71,0.16),transparent_18%)]",
    };
  }

  if (effect === "columns") {
    return {
      label: "Byte pede apenas as colunas certas para nao lotar o pergaminho.",
      solvedLabel: "As colunas escolhidas brilharam no mural da vila.",
      aura: "bg-[radial-gradient(circle_at_31%_41%,rgba(250,204,21,0.25),transparent_15%),radial-gradient(circle_at_40%_41%,rgba(34,211,238,0.22),transparent_18%)]",
    };
  }

  if (effect === "star") {
    return {
      label: "A runa da estrelinha ainda precisa ser entendida.",
      solvedLabel: "A runa * abriu todas as colunas da tabela.",
      aura: "bg-[radial-gradient(circle_at_50%_44%,rgba(251,191,36,0.36),transparent_18%)]",
    };
  }

  if (effect === "limit" || effect === "pagination") {
    return {
      label: "A fila de registros precisa caber dentro da tela.",
      solvedLabel: "A consulta trouxe so a quantidade certa de registros.",
      aura: "bg-[radial-gradient(circle_at_50%_61%,rgba(96,165,250,0.26),transparent_22%)]",
    };
  }

  if (effect === "filter") {
    return {
      label: "Os portoes da cidade analisam a condicao da consulta.",
      solvedLabel: "O filtro separou exatamente os registros pedidos.",
      aura: "bg-[radial-gradient(circle_at_34%_57%,rgba(103,232,249,0.34),transparent_13%),radial-gradient(circle_at_66%_57%,rgba(103,232,249,0.34),transparent_13%)]",
    };
  }

  if (effect === "logic" || effect === "shortcuts" || effect === "balance") {
    return {
      label: "As regras da cidade precisam combinar sem conflito.",
      solvedLabel: "As condicoes se encaixaram e abriram o caminho.",
      aura: "bg-[radial-gradient(circle_at_50%_49%,rgba(34,211,238,0.28),transparent_24%)]",
    };
  }

  if (effect === "order" || effect === "desc") {
    return {
      label: "As bancas do mercado ainda estao fora de ordem.",
      solvedLabel: "O relatorio foi ordenado para ser lido sem bagunca.",
      aura: "bg-[radial-gradient(circle_at_52%_58%,rgba(251,191,36,0.30),transparent_24%)]",
    };
  }

  if (effect === "aggregate" || effect === "group" || effect === "having") {
    return {
      label: "O castelo aguarda um resumo confiavel dos dados.",
      solvedLabel: "Os paineis do castelo calcularam o resumo correto.",
      aura: "bg-[radial-gradient(circle_at_50%_42%,rgba(45,212,191,0.34),transparent_24%)]",
    };
  }

  if (effect === "join" || effect === "leftJoin" || effect === "subquery" || effect === "final") {
    return {
      label: "A fortaleza protege as pontes entre tabelas relacionadas.",
      solvedLabel: "As tabelas foram conectadas sem perder o sentido dos dados.",
      aura: "bg-[radial-gradient(circle_at_50%_43%,rgba(45,212,191,0.34),transparent_25%)]",
    };
  }

  if (effect === "boss") {
    return {
      label: "O desafio final do modulo observa tudo que voce aprendeu.",
      solvedLabel: "O guardiao aceitou sua consulta completa.",
      aura: "bg-[radial-gradient(circle_at_50%_50%,rgba(96,165,250,0.30),transparent_26%)]",
    };
  }

  return {
    label: getChapterIntro(stage.chapterId),
    solvedLabel: "Byte marcou essa descoberta no mapa do Reino SQL.",
    aura: "bg-[radial-gradient(circle_at_50%_48%,rgba(96,165,250,0.22),transparent_24%)]",
  };
}

function getChapterIntro(chapterId: string) {
  if (chapterId === "sql-chapter-2") {
    return "A cidade testa filtros antes de deixar a consulta passar.";
  }

  if (chapterId === "sql-chapter-3") {
    return "O mercado precisa transformar dados em relatorios legiveis.";
  }

  if (chapterId === "sql-chapter-4") {
    return "O Castelo das Estatisticas espera calculos confiaveis.";
  }

  if (chapterId === "sql-chapter-5") {
    return "A Fortaleza das Relacoes guarda caminhos entre tabelas.";
  }

  return "Byte observa a Vila dos Dados antes da proxima descoberta.";
}

function StoryEffect({
  effect,
  active,
}: {
  effect: StoryEffectName;
  active: boolean;
}) {
  if (!active) {
    return null;
  }

  if (effect === "lanterns") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <Glow className="left-[16%] top-[56%]" size="large" tone="amber" />
        <Glow className="left-[80%] top-[52%]" size="large" tone="amber" />
        <Glow className="left-[48%] top-[48%]" size="medium" tone="amber" />
      </div>
    );
  }

  if (effect === "table" || effect === "columns") {
    return (
      <div className="pointer-events-none absolute left-[13%] top-[26%] w-[min(25rem,42vw)] rounded-md border border-cyan-200/35 bg-zinc-950/70 p-3 shadow-[0_0_34px_rgba(34,211,238,0.22)] backdrop-blur-[2px] animate-cq-rise">
        <div className="mb-2 flex items-center justify-between border-b border-cyan-200/20 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">
          <span>clientes</span>
          <span>{effect === "columns" ? "colunas escolhidas" : "linhas e colunas"}</span>
        </div>

        <div className="grid grid-cols-4 gap-1 text-[10px] text-cyan-50">
          {["id", "nome", "cidade", "email"].map((item) => (
            <span key={item} className="rounded-sm bg-cyan-400/20 px-2 py-1 font-semibold">
              {item}
            </span>
          ))}
          {["1", "Ana", "Sao Paulo", "ana@mail.com"].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={[
                "min-w-0 truncate rounded-sm px-2 py-1",
                effect === "columns" && (index === 1 || index === 3)
                  ? "bg-yellow-300/35 text-yellow-50"
                  : "bg-white/10",
              ].join(" ")}
            >
              {item}
            </span>
          ))}
          {["2", "Bruno", "Curitiba", "bruno@mail.com"].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={[
                "min-w-0 truncate rounded-sm px-2 py-1",
                effect === "columns" && (index === 1 || index === 3)
                  ? "bg-yellow-300/25 text-yellow-50"
                  : "bg-white/10",
              ].join(" ")}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (effect === "star") {
    return <RuneBurst symbol="*" tone="amber" />;
  }

  if (effect === "limit" || effect === "pagination") {
    return (
      <div className="pointer-events-none absolute bottom-[26%] left-[18%] right-[18%] flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((item, index) => (
          <span
            key={item}
            className="size-9 rounded border border-blue-200/50 bg-blue-400/30 text-center text-sm font-bold leading-9 text-blue-50 shadow-[0_0_20px_rgba(96,165,250,0.35)] animate-cq-pop"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (effect === "filter") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <Glow className="left-[32%] top-[55%]" size="medium" tone="cyan" />
        <Glow className="left-[66%] top-[55%]" size="medium" tone="cyan" />
        <div className="absolute left-[36%] top-[56%] h-1 w-[28%] rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.8)] animate-cq-scan" />
      </div>
    );
  }

  if (effect === "logic" || effect === "shortcuts" || effect === "balance") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <RuneBurst symbol={effect === "logic" ? "AND" : effect === "shortcuts" ? "IN" : "BETWEEN"} tone="cyan" />
      </div>
    );
  }

  if (effect === "order" || effect === "desc") {
    return (
      <div className="pointer-events-none absolute bottom-[28%] left-[18%] right-[18%] flex items-end justify-center gap-4">
        {[32, 52, 78, 112].map((height, index) => (
          <span
            key={height}
            className="w-10 rounded-t bg-amber-300/70 shadow-[0_0_24px_rgba(251,191,36,0.45)] animate-cq-bars"
            style={{
              height: `${effect === "desc" ? [...[32, 52, 78, 112]].reverse()[index] : height}px`,
              animationDelay: `${index * 110}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (effect === "aggregate" || effect === "group" || effect === "having") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[42%] top-[23%] rounded-xl border border-teal-200/40 bg-teal-950/60 px-6 py-4 text-center text-teal-100 shadow-[0_0_50px_rgba(45,212,191,0.35)] animate-cq-rise">
          <p className="text-xs uppercase tracking-[0.2em]">{effect === "having" ? "HAVING" : effect === "group" ? "GROUP BY" : "SUM / AVG"}</p>
          <div className="mt-3 flex h-20 items-end gap-2">
            {[35, 58, 44, 76, 62].map((height, index) => (
              <span
                key={index}
                className="w-4 rounded-t bg-teal-300"
                style={{ height }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (effect === "join" || effect === "leftJoin" || effect === "subquery" || effect === "final") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[16%] top-[35%] size-16 rounded-lg border border-teal-200/50 bg-teal-400/20 shadow-[0_0_30px_rgba(45,212,191,0.45)] animate-cq-pop" />
        <div className="absolute right-[18%] top-[34%] size-16 rounded-lg border border-teal-200/50 bg-teal-400/20 shadow-[0_0_30px_rgba(45,212,191,0.45)] animate-cq-pop" />
        <div className="absolute left-[23%] right-[25%] top-[41%] h-1 rounded-full bg-teal-300 shadow-[0_0_24px_rgba(45,212,191,0.8)] animate-cq-scan" />
        {(effect === "subquery" || effect === "final") && (
          <div className="absolute left-[44%] top-[24%] size-24 rounded-full border border-cyan-200/50 bg-cyan-400/20 shadow-[0_0_45px_rgba(34,211,238,0.5)] animate-cq-pulse" />
        )}
      </div>
    );
  }

  return <RuneBurst symbol="SQL" tone="blue" />;
}

function Glow({
  className,
  size,
  tone,
}: {
  className: string;
  size: "medium" | "large";
  tone: "amber" | "cyan";
}) {
  return (
    <span
      className={[
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-cq-pulse",
        size === "large" ? "size-36" : "size-24",
        tone === "amber"
          ? "bg-yellow-300/35 shadow-[0_0_70px_26px_rgba(253,224,71,0.32)]"
          : "bg-cyan-300/35 shadow-[0_0_70px_26px_rgba(103,232,249,0.32)]",
        className,
      ].join(" ")}
    />
  );
}

function RuneBurst({
  symbol,
  tone,
}: {
  symbol: string;
  tone: "amber" | "cyan" | "blue";
}) {
  const color = tone === "amber"
    ? "border-amber-200/50 bg-amber-300/20 text-amber-50 shadow-[0_0_50px_rgba(251,191,36,0.35)]"
    : tone === "cyan"
      ? "border-cyan-200/50 bg-cyan-300/20 text-cyan-50 shadow-[0_0_50px_rgba(34,211,238,0.35)]"
      : "border-blue-200/50 bg-blue-300/20 text-blue-50 shadow-[0_0_50px_rgba(96,165,250,0.35)]";

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className={`rounded-xl border px-7 py-5 text-2xl font-black tracking-[0.18em] animate-cq-rune ${color}`}>
        {symbol}
      </div>
    </div>
  );
}
