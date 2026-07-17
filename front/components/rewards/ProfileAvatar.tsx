"use client";

import Image from "next/image";

import { usePlayer } from "@/application/hooks/usePlayer";
import { rewardItems } from "@/data/rewards";

type Props = {
  size?: "sm" | "lg";
};

export default function ProfileAvatar({ size = "sm" }: Props) {
  const { player } = usePlayer();
  const avatarId = player.inventory.equippedAvatarId ?? player.avatar;
  const avatar = rewardItems.find((item) => item.id === avatarId && item.kind === "avatar")
    ?? rewardItems.find((item) => item.kind === "avatar");
  const dimensions = size === "lg" ? "size-24" : "size-10";
  const textSize = size === "lg" ? "text-xl" : "text-xs";
  const frameClass = getFrameClass(player.inventory.equippedFrameId);

  return (
    <span
      className={`${dimensions} ${frameClass} cq-profile-avatar relative inline-flex overflow-hidden border border-[#6f91d8] bg-[#101827] shadow-[0_0_0_2px_rgba(10,18,32,0.95)]`}
      title={avatar?.name ?? "Perfil"}
    >
      {avatar?.imageSrc ? (
        <Image
          src={avatar.imageSrc}
          alt={avatar.name}
          fill
          sizes={size === "lg" ? "96px" : "40px"}
          className="object-cover"
        />
      ) : (
        <span className={`m-auto font-mono font-black text-[#dbe8ff] ${textSize}`}>
          {avatar?.sprite ?? "CQ"}
        </span>
      )}
    </span>
  );
}

function getFrameClass(frameId?: string) {
  if (!frameId?.startsWith("frame-")) {
    return "";
  }

  return `cq-avatar-frame-${frameId.replace("frame-", "")}`;
}
