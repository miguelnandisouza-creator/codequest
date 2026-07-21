"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

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
  const [rewardFilter, setRewardFilter] = useState<"all" | "owned" | "available" | "gifted" | "exclusive" | "legendary">("all");
  const [showCryptoTool, setShowCryptoTool] = useState(false);
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
    const gifted = hasGiftNotification(player.giftNotifications, reward.id);

    if (rewardFilter === "owned") {
      return owned;
    }

    if (rewardFilter === "available") {
      return !owned && available;
    }

    if (rewardFilter === "gifted") {
      return gifted;
    }

    if (rewardFilter === "exclusive") {
      return Boolean(reward.allowedEmails?.length);
    }

    if (rewardFilter === "legendary") {
      return reward.rarity === "lendario";
    }

    return true;
  });
  const activeTabRewards = rewardItems.filter((reward) => reward.kind === activeTab);
  const shopStats = getShopStats(activeTabRewards, player, session);

  useEffect(() => {
    const shouldShowCryptoTool = new URLSearchParams(window.location.search).get("crypto") === "1";
    const frame = shouldShowCryptoTool
      ? window.requestAnimationFrame(() => setShowCryptoTool(true))
      : undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowCryptoTool((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ShopStat label="Liberados" value={shopStats.owned} />
          <ShopStat label="Da para comprar" value={shopStats.available} />
          <ShopStat label="Recebidos" value={shopStats.gifted} />
          <ShopStat label="Bloqueados" value={shopStats.locked} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "Todos"],
            ["owned", "Meus itens"],
            ["available", "Da para comprar"],
            ["gifted", "Recebidos"],
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

        {showCryptoTool && <LocalPasswordHashTool />}

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleRewards.map((reward) => {
            const owned = player.inventory.ownedRewardIds.includes(reward.id);
            const equipped = getEquippedRewardId(player.inventory, reward.kind) === reward.id;
            const locked = player.level < reward.levelRequired;
            const lacksCoins = player.coins < reward.price;
            const cannotBuy = rewardsLocked || locked || lacksCoins;
            const gifted = hasGiftNotification(player.giftNotifications, reward.id);
            const status = getRewardStatus({
              owned,
              equipped,
              gifted,
              rewardsLocked,
              locked,
              lacksCoins,
            });

            return (
              <article
                key={reward.id}
                className={[
                  "cq-card p-5",
                  equipped ? "border-[#72e6a8]/60" : "",
                  gifted && !equipped ? "border-yellow-300/45" : "",
                ].join(" ")}
              >
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

                <div className={`mt-5 rounded border px-3 py-2 text-sm ${status.className}`}>
                  {status.label}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="cq-badge">{reward.price} moedas</span>
                  <span className="cq-badge">Nivel {reward.levelRequired}</span>
                  {owned && (
                    <span className="cq-badge border-[#72e6a8]/45 text-[#b8ffd8]">Seu item</span>
                  )}
                  {gifted && (
                    <span className="cq-badge border-yellow-300/45 text-yellow-100">Presente</span>
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
                      {rewardsLocked ? "Loja bloqueada" : equipped ? "Equipado agora" : "Equipar item"}
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
                          ? "Loja bloqueada"
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

function ShopStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="cq-panel p-4">
      <p className="cq-kicker">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black">{value}</p>
    </div>
  );
}

function LocalPasswordHashTool() {
  const [password, setPassword] = useState("");
  const [generatedHash, setGeneratedHash] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [hashToVerify, setHashToVerify] = useState("");
  const [verifyResult, setVerifyResult] = useState<"idle" | "valid" | "invalid">("idle");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  async function handleGenerateHash() {
    setError("");
    setVerifyResult("idle");

    if (!password) {
      setError("Digite uma senha para gerar o hash.");
      return;
    }

    setIsWorking(true);

    try {
      setGeneratedHash(await generatePasswordHash(password));
    } catch {
      setError("Nao foi possivel gerar o hash neste navegador.");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleVerifyHash() {
    setError("");
    setVerifyResult("idle");

    if (!verifyPassword || !hashToVerify) {
      setError("Preencha a senha e o hash para testar.");
      return;
    }

    setIsWorking(true);

    try {
      setVerifyResult(await verifyPasswordHash(verifyPassword, hashToVerify) ? "valid" : "invalid");
    } catch {
      setError("Hash invalido ou navegador sem suporte a Web Crypto.");
    } finally {
      setIsWorking(false);
    }
  }

  function handleClear() {
    setPassword("");
    setGeneratedHash("");
    setVerifyPassword("");
    setHashToVerify("");
    setVerifyResult("idle");
    setError("");
  }

  return (
    <section className="cq-panel mt-6 border-[#72e6a8]/45 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="cq-kicker">Ferramenta local</p>
          <h2 className="cq-title mt-2 text-2xl">Hash de senha</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#93a4bd]">
            PBKDF2 SHA-256 com salt aleatorio. Nada e enviado para o servidor e nada fica salvo no site.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="cq-button cq-button-secondary md:min-w-28"
        >
          Limpar
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded border border-[#6f91d8]/35 bg-[#101827]/70 p-4">
          <label className="block text-sm font-bold text-[#e5edf9]" htmlFor="local-password-hash">
            Senha
          </label>
          <input
            id="local-password-hash"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded border border-[#6f91d8]/45 bg-[#060913] px-3 py-2 text-[#e5edf9] outline-none focus:border-[#72e6a8]"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={handleGenerateHash}
            disabled={isWorking}
            className="cq-button mt-3 w-full disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isWorking ? "Processando" : "Gerar hash local"}
          </button>
          <textarea
            value={generatedHash}
            readOnly
            className="mt-3 min-h-28 w-full resize-y rounded border border-[#6f91d8]/35 bg-[#060913] p-3 font-mono text-xs text-[#cfe0ff] outline-none"
            placeholder="O hash aparece aqui"
          />
        </div>

        <div className="rounded border border-[#6f91d8]/35 bg-[#101827]/70 p-4">
          <label className="block text-sm font-bold text-[#e5edf9]" htmlFor="local-password-verify">
            Testar senha
          </label>
          <input
            id="local-password-verify"
            type="password"
            value={verifyPassword}
            onChange={(event) => setVerifyPassword(event.target.value)}
            className="mt-2 w-full rounded border border-[#6f91d8]/45 bg-[#060913] px-3 py-2 text-[#e5edf9] outline-none focus:border-[#72e6a8]"
            autoComplete="new-password"
          />
          <textarea
            value={hashToVerify}
            onChange={(event) => setHashToVerify(event.target.value)}
            className="mt-3 min-h-24 w-full resize-y rounded border border-[#6f91d8]/35 bg-[#060913] p-3 font-mono text-xs text-[#cfe0ff] outline-none focus:border-[#72e6a8]"
            placeholder="Cole o hash para conferir"
          />
          <button
            type="button"
            onClick={handleVerifyHash}
            disabled={isWorking}
            className="cq-button mt-3 w-full disabled:cursor-not-allowed disabled:opacity-45"
          >
            Conferir
          </button>
          {verifyResult !== "idle" && (
            <div className={`mt-3 rounded border px-3 py-2 text-sm ${
              verifyResult === "valid"
                ? "border-[#72e6a8]/45 bg-[#72e6a8]/10 text-[#b8ffd8]"
                : "border-red-300/45 bg-red-500/10 text-red-100"
            }`}
            >
              {verifyResult === "valid" ? "Senha confere com o hash." : "Senha diferente do hash."}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded border border-red-300/45 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      )}
    </section>
  );
}

function getShopStats(
  rewards: typeof rewardItems,
  player: ReturnType<typeof usePlayer>["player"],
  session: LocalSession | null
) {
  const visibleRewards = rewards.filter((reward) => (
    !reward.allowedEmails?.length ||
    Boolean(session && reward.allowedEmails.includes(session.email.toLowerCase()))
  ));

  return visibleRewards.reduce((stats, reward) => {
    const owned = player.inventory.ownedRewardIds.includes(reward.id);
    const canBuy = !owned &&
      player.level >= reward.levelRequired &&
      player.coins >= reward.price;

    return {
      owned: stats.owned + (owned ? 1 : 0),
      available: stats.available + (canBuy ? 1 : 0),
      gifted: stats.gifted + (hasGiftNotification(player.giftNotifications, reward.id) ? 1 : 0),
      locked: stats.locked + (!owned && !canBuy ? 1 : 0),
    };
  }, {
    owned: 0,
    available: 0,
    gifted: 0,
    locked: 0,
  });
}

function hasGiftNotification(
  giftNotifications: NonNullable<ReturnType<typeof usePlayer>["player"]["giftNotifications"]> | undefined,
  rewardId: string
) {
  return Boolean(giftNotifications?.some((gift) => gift.rewardId === rewardId));
}

function getRewardStatus({
  owned,
  equipped,
  gifted,
  rewardsLocked,
  locked,
  lacksCoins,
}: {
  owned: boolean;
  equipped: boolean;
  gifted: boolean;
  rewardsLocked: boolean;
  locked: boolean;
  lacksCoins: boolean;
}) {
  if (rewardsLocked) {
    return {
      label: "Loja bloqueada pelo admin",
      className: "border-yellow-300/35 bg-yellow-500/10 text-yellow-100",
    };
  }

  if (equipped) {
    return {
      label: "Equipado no perfil agora",
      className: "border-[#72e6a8]/45 bg-[#72e6a8]/10 text-[#b8ffd8]",
    };
  }

  if (owned && gifted) {
    return {
      label: "Recebido como presente e pronto para usar",
      className: "border-yellow-300/35 bg-yellow-500/10 text-yellow-100",
    };
  }

  if (owned) {
    return {
      label: "Voce ja liberou este item",
      className: "border-[#72e6a8]/45 bg-[#72e6a8]/10 text-[#b8ffd8]",
    };
  }

  if (locked) {
    return {
      label: "Suba de nivel para desbloquear",
      className: "border-[#6f91d8]/45 bg-[#6f91d8]/10 text-[#cfe0ff]",
    };
  }

  if (lacksCoins) {
    return {
      label: "Faltam moedas para comprar",
      className: "border-[#6f91d8]/45 bg-[#6f91d8]/10 text-[#cfe0ff]",
    };
  }

  return {
    label: "Disponivel para comprar agora",
    className: "border-[#72e6a8]/45 bg-[#72e6a8]/10 text-[#b8ffd8]",
  };
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

async function generatePasswordHash(password: string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto unavailable");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 210000;
  const hash = await derivePasswordHash(password, salt, iterations);

  return `pbkdf2_sha256$${iterations}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

async function verifyPasswordHash(password: string, storedHash: string) {
  const [algorithm, iterationsValue, saltValue, hashValue] = storedHash.trim().split("$");
  const iterations = Number(iterationsValue);

  if (algorithm !== "pbkdf2_sha256" || !Number.isInteger(iterations) || iterations < 100000 || !saltValue || !hashValue) {
    return false;
  }

  const salt = base64ToBytes(saltValue);
  const expectedHash = base64ToBytes(hashValue);
  const actualHash = await derivePasswordHash(password, salt, iterations);

  return bytesEqual(actualHash, expectedHash);
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: bytesToArrayBuffer(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derivedBits);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  left.forEach((byte, index) => {
    diff |= byte ^ right[index];
  });

  return diff === 0;
}
