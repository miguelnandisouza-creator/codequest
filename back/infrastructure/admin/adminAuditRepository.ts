import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseServerClient } from "@/infrastructure/supabase/serverClient";

const auditUserId = "00000000-0000-0000-0000-000000000001";
const dataDir = path.join(process.cwd(), ".data");
const auditFile = path.join(dataDir, "admin-audit-log.json");
const canWriteLocalFiles = process.env.VERCEL !== "1";
const maxAuditRecords = 120;

export type AdminAuditRecord = {
  id: string;
  action: string;
  label: string;
  actorEmail: string;
  targetUserId?: string;
  targetName?: string;
  targetEmail?: string;
  details?: string;
  createdAt: string;
};

type StoredAudit = {
  records?: AdminAuditRecord[];
};

type AuditRow = {
  player: StoredAudit;
};

export async function readAdminAuditLog(limit = 40) {
  const records = await readPersistedAudit();

  return records
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, limit);
}

export async function recordAdminAction(record: Omit<AdminAuditRecord, "id" | "createdAt">) {
  const currentRecords = await readPersistedAudit();
  const nextRecord: AdminAuditRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const nextRecords = [nextRecord, ...currentRecords]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, maxAuditRecords);

  try {
    await writePersistedAudit(nextRecords);
  } catch (error) {
    console.warn(
      "Admin audit write skipped:",
      error instanceof Error ? error.message : "unknown error"
    );
  }

  return nextRecord;
}

async function readPersistedAudit(): Promise<AdminAuditRecord[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("player_progress")
      .select("player")
      .eq("user_id", auditUserId)
      .maybeSingle<AuditRow>();

    if (!error && Array.isArray(data?.player?.records)) {
      return data.player.records;
    }

    if (error) {
      console.warn("Supabase read admin audit failed:", error.message);
    }
  }

  try {
    const raw = await readFile(auditFile, "utf8");
    const parsed = JSON.parse(raw) as StoredAudit;

    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch {
    return [];
  }
}

async function writePersistedAudit(records: AdminAuditRecord[]) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("player_progress")
      .upsert({
        user_id: auditUserId,
        player: { records },
        updated_at: records[0]?.createdAt ?? new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (!error) {
      return;
    }

    console.warn("Supabase write admin audit failed:", error.message);
  }

  if (!canWriteLocalFiles) {
    throw new Error("Historico admin indisponivel em producao.");
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(auditFile, JSON.stringify({ records }, null, 2), "utf8");
}
