import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseServerClient } from "@/infrastructure/supabase/serverClient";

const settingsUserId = "00000000-0000-0000-0000-000000000000";
const dataDir = path.join(process.cwd(), ".data");
const settingsFile = path.join(dataDir, "app-settings.json");
const canWriteLocalFiles = process.env.VERCEL !== "1";

export type AppSettings = {
  maintenanceMode: boolean;
  envForced: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

type StoredAppSettings = {
  maintenanceMode?: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

type SettingsRow = {
  player: StoredAppSettings;
  updated_at: string;
};

export async function readAppSettings(): Promise<AppSettings> {
  const storedSettings = await readPersistedSettings();

  return normalizeSettings(storedSettings);
}

export async function writeAppSettings(
  patch: Partial<Pick<AppSettings, "maintenanceMode">>,
  updatedBy: string
): Promise<AppSettings> {
  const currentSettings = await readPersistedSettings();
  const nextSettings: StoredAppSettings = {
    ...currentSettings,
    maintenanceMode: Boolean(patch.maintenanceMode),
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  await writePersistedSettings(nextSettings);

  return normalizeSettings(nextSettings);
}

async function readPersistedSettings(): Promise<StoredAppSettings> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("player_progress")
      .select("player, updated_at")
      .eq("user_id", settingsUserId)
      .maybeSingle<SettingsRow>();

    if (!error && data?.player) {
      return {
        ...data.player,
        updatedAt: data.player.updatedAt ?? data.updated_at,
      };
    }

    if (error) {
      console.warn("Supabase read app settings failed:", error.message);
    }
  }

  try {
    const raw = await readFile(settingsFile, "utf8");
    const parsed = JSON.parse(raw);

    return typeof parsed === "object" && parsed ? parsed as StoredAppSettings : {};
  } catch {
    return {};
  }
}

async function writePersistedSettings(settings: StoredAppSettings) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("player_progress")
      .upsert({
        user_id: settingsUserId,
        player: settings,
        updated_at: settings.updatedAt ?? new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (!error) {
      return;
    }

    console.warn("Supabase write app settings failed:", error.message);
  }

  if (!canWriteLocalFiles) {
    throw new Error("Configuracoes do app indisponiveis em producao.");
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf8");
}

function normalizeSettings(settings: StoredAppSettings): AppSettings {
  const envForced = process.env.CODEQUEST_MAINTENANCE === "1";

  return {
    maintenanceMode: envForced || Boolean(settings.maintenanceMode),
    envForced,
    updatedAt: settings.updatedAt,
    updatedBy: settings.updatedBy,
  };
}
