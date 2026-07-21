import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readStoredUsers } from "@/infrastructure/auth/userStore";
import { getSupabaseServerClient } from "@/infrastructure/supabase/serverClient";

const passwordResetUserId = "00000000-0000-0000-0000-000000000002";
const dataDir = path.join(process.cwd(), ".data");
const requestsFile = path.join(dataDir, "password-reset-requests.json");
const canWriteLocalFiles = process.env.VERCEL !== "1";
const maxRequests = 80;

export type PasswordResetRequest = {
  id: string;
  userId: string;
  name: string;
  email: string;
  requestedPassword: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
};

type StoredRequests = {
  requests?: PasswordResetRequest[];
};

type RequestRow = {
  player: StoredRequests;
};

export async function createPasswordResetRequest(email: string, requestedPassword: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readStoredUsers();
  const user = users.find((item) => item.email === normalizedEmail);

  if (!user) {
    return null;
  }

  const currentRequests = await readPersistedRequests();
  const pendingRequests = currentRequests.filter((request) => (
    request.status === "pending" && request.userId === user.id
  ));
  const nextRequest: PasswordResetRequest = {
    id: crypto.randomUUID(),
    userId: user.id,
    name: user.name,
    email: user.email,
    requestedPassword,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const nextRequests = [
    nextRequest,
    ...currentRequests.filter((request) => !pendingRequests.some((pending) => pending.id === request.id)),
  ]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, maxRequests);

  await writePersistedRequests(nextRequests);

  return nextRequest;
}

export async function readPasswordResetRequests(limit = 40) {
  const requests = await readPersistedRequests();

  return requests
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, limit);
}

export async function resolvePasswordResetRequest(
  requestId: string,
  status: "approved" | "rejected",
  resolvedBy: string
) {
  const requests = await readPersistedRequests();
  const request = requests.find((item) => item.id === requestId);

  if (!request) {
    throw new Error("Solicitacao de senha nao encontrada.");
  }

  const resolvedRequest: PasswordResetRequest = {
    ...request,
    requestedPassword: "",
    status,
    resolvedAt: new Date().toISOString(),
    resolvedBy,
  };
  const nextRequests = requests.map((item) => (
    item.id === requestId ? resolvedRequest : item
  ));

  await writePersistedRequests(nextRequests);

  return resolvedRequest;
}

async function readPersistedRequests(): Promise<PasswordResetRequest[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("player_progress")
      .select("player")
      .eq("user_id", passwordResetUserId)
      .maybeSingle<RequestRow>();

    if (!error && Array.isArray(data?.player?.requests)) {
      return data.player.requests;
    }

    if (error) {
      console.warn("Supabase read password reset requests failed:", error.message);
    }
  }

  try {
    const raw = await readFile(requestsFile, "utf8");
    const parsed = JSON.parse(raw) as StoredRequests;

    return Array.isArray(parsed.requests) ? parsed.requests : [];
  } catch {
    return [];
  }
}

async function writePersistedRequests(requests: PasswordResetRequest[]) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("player_progress")
      .upsert({
        user_id: passwordResetUserId,
        player: { requests },
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (!error) {
      return;
    }

    console.warn("Supabase write password reset requests failed:", error.message);
  }

  if (!canWriteLocalFiles) {
    throw new Error("Solicitacoes de senha indisponiveis em producao.");
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(requestsFile, JSON.stringify({ requests }, null, 2), "utf8");
}
