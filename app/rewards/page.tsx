"use client";

import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";
import {
  getLocalSessionSnapshot,
  getServerLocalSessionSnapshot,
  LocalSession,
  subscribeToLocalAuth,
} from "@/application/auth/localAuth";
import { rewardItems, RewardKind } from "@/data/rewards";

const tabs: { label: string; value: RewardKind }[] = [
  { label: "Fotos", value: "avatar" },
  { label: "Pets", value: "pet" },
  { label: "Temas", value: "theme" },
  { label: "Molduras", value: "frame" },
  { label: "Efeitos", value: "effect" },
];

const rewardLabels: Record<RewardKind, string> = {
  avatar: "Foto",
  pet: "Pet",
  theme: "Tema",
  frame: "Moldura",
  effect: "Efeito",
};

export default function RewardsPage() {
  const { player, buyReward, equipReward } = usePlayer();
  const [activeTab, setActiveTab] = useState<RewardKind>("avatar");
  const [rewardFilter, setRewardFilter] = useState<"all" | "owned" | "available" | "exclusive" | "legendary">("all");
  const rewardsLocked = Boolean(player.inventory.rewardsLocked);
  const sessionSnapshot = useSyncExternalStore(
    subscribeToLocalAuth,
    getLocalSessionSnapshot,
    getServerLocalSessionSnapshot
  );
  const session = useMemo(() => parseJson<LocalSession>(sessionSnapshot), [sessionSnapshot]);
  const visibleRewards = rewardItems.filter((reward) => {
    if (reward.kind !== activeTab) {
      return false;
    }

    if (!reward.allowedEmails?.length) {
      return true;
    }

    return session
      ? reward.allowedEmails.includes(session.email.toLowerCase())
      : false;
  }).filter((reward) => {
    const owned = player.inventory.ownedRewardIds.includes(reward.id);
    const available = player.level >= reward.levelRequired && player.coins >= reward.price;

    if (rewardFilter === "owned") {
      return owned;
    }

    if (rewardFilter === "available") {
      return !owned && available;
    }

    if (rewardFilter === "exclusive") {
      return Boolean(reward.allowedEmails?.length);
    }

    if (rewardFilter === "legendary") {
      return reward.rarity === "lendario";
    }

    return true;
  });

  return (
    <main className="cq-page">
      <section className="cq-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="cq-kicker">Loja de recompensas</p>
            <h1 className="cq-title mt-3 text-4xl md:text-6xl">
              Trocar moedas
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-[#93a4bd]">
              Use moedas ganhas nas missoes para liberar fotos de perfil e pets comemorativos.
            </p>
          </div>

          <div className="cq-panel w-full min-w-0 overflow-hidden p-5 md:w-auto md:min-w-64">
            <p className="cq-kicker">Carteira</p>
            <p className="mt-2 break-words font-mono text-2xl font-black md:text-3xl">
              {player.coins} moedas
            </p>
            <p className="mt-1 break-words text-sm text-[#93a4bd]">
              Nivel {player.level}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`cq-button ${activeTab === tab.value ? "" : "cq-button-secondary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "Todos"],
            ["owned", "Meus itens"],
            ["available", "Da para comprar"],
            ["exclusive", "Exclusivos"],
            ["legendary", "Lendarios"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRewardFilter(value as typeof rewardFilter)}
              className={`cq-button ${rewardFilter === value ? "" : "cq-button-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {rewardsLocked && (
          <div className="cq-panel mt-6 border-yellow-300/40 p-4 text-sm text-yellow-100">
            Loja bloqueada pelo admin. Voce pode ver os itens, mas nao comprar ou trocar equipamentos agora.
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleRewards.map((reward) => {
            const owned = player.inventory.ownedRewardIds.includes(reward.id);
            const equipped = getEquippedRewardId(player.inventory, reward.kind) === reward.id;
            const locked = player.level < reward.levelRequired;
            const lacksCoins = player.coins < reward.price;
            const cannotBuy = rewardsLocked || locked || lacksCoins;

            return (
              <article key={reward.id} className="cq-card p-5">
                <div className="flex items-start justify-between gap-4">
                  {reward.imageSrc ? (
                    <div
                      className={[
                        "relative overflow-hidden border border-[#6f91d8] bg-[#101827]",
                        reward.kind === "avatar" ? "h-28 w-24" : "size-28",
                      ].join(" ")}
                    >
                      <Image
                        src={reward.imageSrc}
                        alt={reward.name}
                        fill
                        sizes={reward.kind === "avatar" ? "96px" : "112px"}
                        className={[
                          reward.kind === "avatar" ? "object-cover" : "object-contain",
                          reward.imageSrc.includes("/generated/") ? "p-0" : "p-2",
                        ].join(" ")}
                      />
                    </div>
                  ) : reward.swatch ? (
                    <div className="flex size-28 overflow-hidden border border-[#6f91d8] bg-[#101827]">
                      {reward.swatch.map((color) => (
                        <span
                          key={color}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="cq-pixel-icon size-14 text-base">
                      {reward.sprite}
                    </div>
                  )}

                  <span className="cq-badge">
                    {rewardLabels[reward.kind]}
                  </span>
                  <span className={`cq-badge ${getRewardTierClass(reward)}`}>
                    {getRewardTierLabel(reward)}
                  </span>
                </div>

                <h2 className="cq-title mt-6 text-2xl">{reward.name}</h2>
                <p className="mt-3 min-h-14 leading-7 text-[#93a4bd]">
                  {reward.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="cq-badge">{reward.price} moedas</span>
                  <span className="cq-badge">Nivel {reward.levelRequired}</span>
                  {owned && (
                    <span className="cq-badge border-[#72e6a8]/45 text-[#b8ffd8]">Seu item</span>
                  )}
                  {reward.petAbility && (
                    getPetAbilityBadges(reward.petAbility).map((label) => (
                      <span key={label} className="cq-badge border-[#72e6a8]/45 text-[#b8ffd8]">
                        {label}
                      </span>
                    ))
                  )}
                </div>

                <div className="mt-6">
                  {owned ? (
                    <button
                      type="button"
                      onClick={() => equipReward(reward.id, reward.kind)}
                      disabled={rewardsLocked}
                      className="cq-button w-full disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {rewardsLocked ? "Bloqueado" : equipped ? "Equipado" : "Equipar"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => buyReward(reward.id)}
                      disabled={cannotBuy}
                      className="cq-button w-full disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {locked
                        ? "Nivel insuficiente"
                        : rewardsLocked
                          ? "Bloqueado"
                          : lacksCoins
                          ? "Moedas insuficientes"
                          : "Comprar"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {visibleRewards.length === 0 && (
          <div className="cq-panel mt-8 p-6 text-[#93a4bd]">
            Nenhuma recompensa encontrada neste filtro.
          </div>
        )}
      </section>
    </main>
  );
}

function getRewardTierLabel(reward: { rarity?: string; allowedEmails?: string[]; price: number; levelRequired: number }) {
  if (reward.allowedEmails?.length) {
    return "Exclusivo";
  }

  if (reward.rarity === "lendario") {
    return "Lendario";
  }

  if (reward.price >= 500 || reward.levelRequired >= 6) {
    return "Raro";
  }

  return "Comum";
}

function getRewardTierClass(reward: { rarity?: string; allowedEmails?: string[]; price: number; levelRequired: number }) {
  const tier = getRewardTierLabel(reward);

  if (tier === "Exclusivo") {
    return "border-[#e7c66a]/60 text-[#ffe6a3]";
  }

  if (tier === "Lendario") {
    return "border-[#f472b6]/60 text-[#ffd1e8]";
  }

  if (tier === "Raro") {
    return "border-[#72e6a8]/45 text-[#b8ffd8]";
  }

  return "";
}

function getEquippedRewardId(
  inventory: {
    equippedAvatarId?: string;
    equippedPetId?: string;
    equippedThemeId?: string;
    equippedFrameId?: string;
    equippedEffectId?: string;
  },
  kind: RewardKind
) {
  if (kind === "avatar") return inventory.equippedAvatarId;
  if (kind === "pet") return inventory.equippedPetId;
  if (kind === "theme") return inventory.equippedThemeId;
  if (kind === "frame") return inventory.equippedFrameId;
  return inventory.equippedEffectId;
}

function parseJson<T>(value: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getPetAbilityBadges(ability: {
  label: string;
  coinBonusPercent?: number;
  xpBonusPercent?: number;
  flatCoinBonus?: number;
  flatXpBonus?: number;
  intervalBonusMissions?: number;
  intervalBonusCoins?: number;
  intervalBonusXp?: number;
  hintPenaltyReduction?: number;
  cooldownMissions?: number;
}) {
  const badges = [ability.label];

  if (ability.flatCoinBonus) {
    badges.push(`+${ability.flatCoinBonus} moedas fixas`);
  }

  if (ability.flatXpBonus) {
    badges.push(`+${ability.flatXpBonus} XP fixo`);
  }

  if (ability.intervalBonusMissions) {
    const parts = [
      ability.intervalBonusXp ? `+${ability.intervalBonusXp} XP` : "",
      ability.intervalBonusCoins ? `+${ability.intervalBonusCoins} moedas` : "",
    ].filter(Boolean).join(" e ");

    if (parts) {
      badges.push(`${parts} a cada ${ability.intervalBonusMissions}`);
    }
  }

  if (ability.cooldownMissions) {
    badges.push(`recarga ${ability.cooldownMissions} missao`);
  }

  return badges;
}
