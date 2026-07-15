"use client";

import { useEffect } from "react";

import { usePlayer } from "@/application/hooks/usePlayer";

export default function RewardStyleSync() {
  const { player } = usePlayer();
  const themeId = player.inventory.equippedThemeId?.replace("theme-", "") ?? "";
  const effectId = player.inventory.equippedEffectId?.replace("effect-", "") ?? "";

  useEffect(() => {
    if (themeId) {
      document.documentElement.dataset.cqTheme = themeId;
    } else {
      delete document.documentElement.dataset.cqTheme;
    }

    if (effectId) {
      document.documentElement.dataset.cqEffect = effectId;
    } else {
      delete document.documentElement.dataset.cqEffect;
    }
  }, [effectId, themeId]);

  return null;
}
